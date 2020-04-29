import os
import json
import pafy
import pickle
import random
import string
import logging
import requests
import argparse
from flask_cors import CORS
from threading import Thread
from pydub import AudioSegment
from dotenv import load_dotenv
from urllib.parse import quote
import urllib.parse as urlparse
from flask import request,Flask
from urllib.parse import parse_qs
from multiprocessing import Process
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

app = Flask(__name__)
CORS(app)
upload_to_drive = True
store_in_catalog = True

logging.basicConfig(format='%(asctime)s %(message)s', level=logging.INFO, filename='static/log.txt', filemode='w')
logging.info('DEPLOYING')

#do not forget to have a .env file in this path with the environmental variables set.
if upload_to_drive:
	load_dotenv()
	DRIVE_PARENT_FOLDER = os.environ.get('DRIVE_PARENT_FOLDER')
	SCOPES = ['https://www.googleapis.com/auth/drive']
if store_in_catalog:
	CATALOG_SERVER = os.environ.get('CATALOG_SERVER')

def song_processing_thread(paths):
	thread = Thread(target=song_processing, args=(paths,))
	thread.daemon = True
	thread.start()

def debug_text(text):
	base_url = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=debug&q='
	base_url += quote(text, safe='~()*!.\'')
	r = requests.get(base_url)

def song_processing(paths):
	output = ''
	debug = open('debug.txt', 'w')
	logging.info(f'DOWNLOADING {paths["name"]}')
	youtube_dl_cmd = f"youtube-dl -x --audio-format mp3 -o {paths['song_path']} '" + paths['url'] + "'"
	debug_text(youtube_dl_cmd)
	logging.info(youtube_dl_cmd)
	os.system(youtube_dl_cmd)
	if os.path.exists(paths["song_path"]):
		logging.info(f'SPLEETER {paths["name"]}')
		os.system(f'spleeter separate -i {paths["song_path"]} -p spleeter:5stems -o {paths["temp_dir"]}')
		logging.info(f'SPLITING {paths["name"]}')
		duration = split_song(paths["temp_path"], paths["out_path"])
		logging.info(f'METADATA {paths["name"]}')
		output = store_metadata(paths["url"], paths["out_path"])
		logging.info(output)
		os.system(f'mv {paths["song_path"]} {paths["out_path"]}/{paths["song_name"]}')
		os.system(f'rm -fr {paths["temp_path"]}')
		if upload_to_drive:
			logging.info(f'UPLOADING {paths["name"]}')
			upload_folder(paths["name"])
			logging.info(f'UPLOADED {paths["name"]}')
		if 'url_webhook' in paths:
			logging.info(f'WEBHOOK {paths["name"]}')
			paths['url_webhook'] += '&o=' + quote(output, safe='~()*!.\'')
			logging.info(paths['url_webhook'])
			r = requests.get(paths['url_webhook'])
			logging.info(r.text)
			print(r.text)
		if 'url_email' in paths:
			logging.info(f'EMAIL {paths["name"]}')
			email_params = [paths['email'], output]
			paths['url_email'] += quote(json.dumps(email_params), safe='~()*!.\'')
			logging.info(paths['url_email'])
			r = requests.get(paths['url_email'])
			logging.info(r.text)
			print(r.text)
		r = requests.get("https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=status&q=DONE")
	else:
		if 'url_webhook' in paths:
			logging.info(f'ERROR WEBHOOK {paths["name"]}')
			paths['url_webhook'] += '&o='
			logging.info(paths['url_webhook'])
			r = requests.get(paths['url_webhook'])
			logging.info(r.text)
			print(r.text)
		if 'url_email' in paths:
			logging.info(f'ERROR EMAIL {paths["name"]}')
			email_params = [paths['email'], '']
			paths['url_email'] += quote(json.dumps(email_params), safe='~()*!.\'')
			logging.info(paths['url_email'])
			r = requests.get(paths['url_email'])
			logging.info(r.text)
			print(r.text)
		logging.info(f'DONE {paths["name"]}')
		r = requests.get("https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=status&q=ERROR")
		logging.info(r.text)
	return output

def get_video_id(url):
	vid_id = ''
	parsed = urlparse.urlparse(url)
	params = parse_qs(parsed.query)
	if 'v' in params:
		vid_id = params['v'][0]
	elif 'youtu.be' in url:
		vid_id = url.split('/')[-1]
	return vid_id

def main(args):
	url = args['url']
	# if args['nodrive']:
	# 	upload_to_drive = False
	paths = {}
	vid_id = get_video_id(url)
	if vid_id:
		name = vid_id
		output = ""
		paths["url"] = args['url']
		paths["name"] = name
		paths["song_name"] = "_song.mp3"
		paths["song_dir"] = "songs"
		paths["temp_dir"] = "processed"
		paths["out_dir"] = "audio"
		paths["song_path"] = f'{paths["song_dir"]}/{paths["name"]}.mp3'
		paths["temp_path"] = f'{paths["temp_dir"]}/{paths["name"]}'
		paths["out_path"] = f'{paths["out_dir"]}/{paths["name"]}'
		paths["out_song"] = f'{paths["out_path"]}/{paths["song_name"]}'
		if not os.path.exists(paths["song_dir"]):
			os.system(f'mkdir {paths["song_dir"]}')
			os.system(f'mkdir {paths["temp_dir"]}')
			os.system(f'mkdir {paths["out_dir"]}')
		if not os.path.exists(paths["out_song"]):
			if 'webhook' in args and args['webhook'] is not None:
				paths['url_webhook'] = args['webhook']
				url_parts = paths['url_webhook'].split('?')
				if len(url_parts) > 1:
					url_base = f'{url_parts[0]}?'
					parsed = urlparse.urlparse(paths['url_webhook'])
					params = parse_qs(parsed.query)
					comma = ''
					for param in params:
						logging.info(f'WEBHOOK PARAMS {param} {params[param][0]}')
						if param in ['a','q','o']:
							quoted = quote(params[param][0], safe='~()*!.\'')
							url_base += f'{comma}{param}={quoted}'
						else:
							url_base += quote(f'{comma}{param}={params[param][0]}', safe='~()*!.\'')
						comma = '&'
					paths["url_webhook"] = url_base
					logging.info(f'WEBHOOK URL {paths["name"]} {paths["url_webhook"]}')
				song_processing_thread(paths)
				output = f'/#{paths["name"]},60'
				return {'status':'WAITING', 'value':output}
			elif 'email' in args and args['email'] is not None:
				paths['email'] = args['email']
				paths['url_email'] = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=email&q='
				song_processing_thread(paths)
				output = f'/#{paths["name"]},60'
				return {'status':'WAITING', 'value':output}
			else:
				output = song_processing(paths)
				return {'status':'OK', 'value':output}
		else:
			duration = get_duration(paths["out_path"])
			output = f'/#{paths["name"]},{duration}'
			r = requests.get("https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=status&q=DONE")
		return {'status':'OK', 'value':output}
	return {'status':'ERROR', 'value':'The video ID is missing'}

def store_catalog(metadata):
	data_obj = [
		metadata['_ydl_info']['id'],
		metadata['_ydl_info']['title'],
		metadata['_ydl_info']['duration'],
		metadata['_ydl_info']['thumbnail']
	]
	data_str = quote(json.dumps(data_obj))
	url = f"{CATALOG_SERVER}?a=store&q={data_str}"
	r = requests.get(url)
	print(r.status_code)
	return r.status_code

def store_metadata(url, out_path):
	metadata = pafy.new(url)
	metadata_dict = vars(metadata)
	#print(metadata_dict)
	with open(f'{out_path}/metadata.json', 'w') as f:
		json.dump(metadata_dict, f)
	if store_in_catalog:
		store_catalog(metadata_dict)
	return f"/#{metadata_dict['_ydl_info']['id']},{metadata_dict['_ydl_info']['duration']}"

def tmp_wav():
    return (''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))) + ".wav"

def get_duration(out_path):
	return int(len(os.listdir(out_path))/5) * 30

# split the track up in 30 second segments
def split_track(folder, track_name, out_path):
    segment = 0
    print(folder, track_name)
    # normalize the wave file
    tmp_audio = tmp_wav()
    os.system("ffmpeg -i %s/%s.wav -sample_fmt s16 -ac 1 -sample_rate 44100 %s" % (folder, track_name, tmp_audio))
    track = AudioSegment.from_wav(tmp_audio)
    duration = track.duration_seconds
    while segment * 30 < track.duration_seconds:
        seg_audio = track[segment*30000:(segment+1)*30005]
        tmp = tmp_wav()
        seg_audio.fade_out(5).export(tmp, format="wav")
        # convert the sample rate and channel numbers
        os.system("ffmpeg -y -i %s -codec:a libmp3lame -q:a 4 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        # os.system("ffmpeg -y -i %s -codec:a vorbis -aq 50 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        # os.system("xld -o %s/%s-%d.mp3 --samplerate=44100 -f mp3 --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
        # os.system("xld -o %s/%s-%d.ogg --samplerate=44100 -f vorbis --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
        os.remove(tmp)
        segment+=1
        print(track_name, segment)
    os.remove(tmp_audio)
    return duration

# go through and run the split track on each track
def split_song(folder, out_path):
    #out_path = "%s" % (folder)
    duration = 120
    print(folder)
    if not os.path.exists(out_path):
        os.makedirs(out_path)
    # get all of the tracks in the folder
    for file in os.listdir(folder):
        if file.endswith(".wav"):
            duration = split_track(folder, os.path.splitext(file)[0], out_path)
    return duration

def google_login():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    service = build('drive', 'v3', credentials=creds)
    return service

def folder_exists(service, dir_name):
	query = f"""name='{dir_name}' and 
				mimeType='application/vnd.google-apps.folder' and 
				'{DRIVE_PARENT_FOLDER}' in parents and 
				trashed = false"""
	try:
		response = service.files().list(
		    q = query,
		    spaces='drive'
		).execute()
		folders = response.get('files', [])
		return (len(folders) > 0)
	except:
		return False

def upload_folder(dir_name):
	print("UPLOADING_FILES")
	folder = 'audio'
	folder_path = os.path.join(folder, dir_name)
	service = google_login()
	if not folder_exists(service, dir_name):
		print('The folder does not exist')
		body = {
			'name': dir_name,
			'mimeType': "application/vnd.google-apps.folder",
			'parents': [DRIVE_PARENT_FOLDER]
		}
		inserted_folder = service.files().create(body = body).execute()
		new_parent = inserted_folder['id']
		files = os.listdir(folder_path)
		for file in files:
			file_metadata = {
				'name': file,
				'parents': [new_parent]
			}
			file_path = os.path.join(folder_path, file)
			media = MediaFileUpload(file_path)
			file_drive = service.files().create(body=file_metadata,
                                    			media_body=media,
                                    			fields='id').execute()
			print(file_drive)
			os.remove(file_path)
	else:
		print('The folder already exists')

@app.route('/test', methods=['GET'])
def test():
  return '{"status":"OK"}'

@app.route('/log')
def log():
    file = open('static/log.txt', 'r')
    content = file.read()
    content = content.replace('\n','<br>')
    return content

@app.route('/', methods=['GET'])
def index():
	if request.args:
		r = requests.get(CATALOG_SERVER + "?a=status&q=SERVING")
		result = main(request.args)
		print(result)
		return json.dumps(result)
	return json.dumps({'status':'ERROR', 'value':'No parameters were given'})

if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument('--url')
	parser.add_argument('--web', action='store_true')
	parser.add_argument('--email', default=None)
	parser.add_argument('--webhook', default=None)
	#parser.add_argument('--nodrive', action='store_false')
	args = parser.parse_args()
	if not args.web:
		result = main(vars(args))
		print(result)
	else:
		app.run(host='0.0.0.0', port=4000)
