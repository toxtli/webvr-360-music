rm out.mp3
rm -fr output
youtube-dl -x --audio-format mp3 -o out.mp3 $1
spleeter separate -i out.mp3 -p spleeter:5stems -o output
