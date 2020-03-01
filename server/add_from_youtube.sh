rm songs/$1.mp3
rm -fr songs/$1
rm -fr ../audio/$1
youtube-dl -x --audio-format mp3 -o songs/$1.mp3 $2
spleeter separate -i songs/$1.mp3 -p spleeter:5stems -o songs
python split.py songs/$1 ../audio/$1