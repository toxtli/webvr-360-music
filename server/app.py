import os
import sys
import json
import random
import string
import tempfile
import argparse
from os.path import basename
from pydub import AudioSegment
from flask import Flask, request

app = Flask(__name__)

def main(args):
	name = args['name']
	url = args['url']
	temp_dir = "processed"
	song_path = f"songs/{name}.mp3"
	temp_path = f"{temp_dir}/{name}"
	out_path = f"../audio/{name}"
	os.system(f"rm {song_path}")
	os.system(f"rm -fr {temp_path}")
	os.system(f"rm -fr {out_path}")
	os.system(f"youtube-dl -x --audio-format mp3 -o {song_path} {url}")
	os.system(f"spleeter separate -i {song_path} -p spleeter:5stems -o {temp_dir}")
	duration = split_song(temp_dir, out_path)
	record = {
		"artist": "Phoenix",
		"track": "Ti Amo",
		"folder": name,
		"intro": "phoenix",
		"segments": int(duration/30),
		"duration": duration,
		"trackNames": ["bass", "drums", "piano", "null", "vocals", "other", "null"],
		"names": ["bass", "drums", "piano", "null", "vocals", "other", "null"],
		"soundRings": {
			"startColor": '#f7002d',
			"endColor": '#00edaa',
			"shape": 'triangle',
			"size": 8
		},
		"floor": {
			"color": "#253934"
		}
	}
	return record



def tmp_wav():
    return (''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))) + ".wav"

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
        # os.system("ffmpeg -y -i %s -codec:a libmp3lame -q:a 4 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        # os.system("ffmpeg -y -i %s -codec:a vorbis -aq 50 %s/%s-%d.mp3 " % (tmp, out_path, track_name, segment))
        os.system("xld -o %s/%s-%d.mp3 --samplerate=44100 -f mp3 --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
        #os.system("xld -o %s/%s-%d.ogg --samplerate=44100 -f vorbis --channels=1 --correct-30samples %s" % (out_path, track_name, segment, tmp))
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

@app.route('/', methods=['GET'])
def index():
	result = main(request.args)
	return json.dumps(result)

if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument('--name')
	parser.add_argument('--url')
	args = parser.parse_args()
	result = main(vars(args))
	print(result)