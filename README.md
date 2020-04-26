# Overview

Inside Music YouTube Edition is a web app that uses Artificial Intelligence to separate the instruments of a YouTube song, and places them in a virtual room to hear the songs in a totally inmersive environment. The original edition was created by [Song Exploder](http://songexploder.net/) and [Google Creative Lab](https://thefwa.com/) as a [WebVR Experiment](https://webvrexperiments.com) that lets you step inside a song, giving you a closer look at how music is made.

The audio of the available songs is not included in this repo. To add your own YouTube audio and play it, use the interface to convert it.

This is an Experiment, not a Google product.

## Demo

Try it now! [https://3dyt.hcilab.ml](https://3dyt.hcilab.ml)

## Technology

Inside Music Youtube Edition is built with [aframe](https://aframe.io), [THREE.JS](https://threejs.org), [Tone.js](https://tonejs.github.io/), and [Spleeter](https://github.com/deezer/spleeter).

## Contributors

* [@hapticdata](https://github.com/hapticdata)
* [@tambien](https://github.com/tambien)
* [@ryburke](https://github.com/ryburke)
* [@alexanderchen](https://github.com/alexanderchen)
* [@toxtli](https://github.com/toxtli)

## Interaction

Select a song from the menu. The stems of the song will appear in a circle around you, each represented by a sphere. In _Browser Mode_, tap the spheres to turn them on or off. In _VR Mode_, you can use your controller to toggle their state. On Google Cardboard, you will have a retical (a small circle in front of you eye) which can be used to turn the stems on and off.

## Build

To build a local version of Inside Music, you will need to have Node.js and [webpack](https://webpack.github.io/) installed (<4.0).

In the terminal, inside the project's directory, install all of the project's dependencies:

```bash
npm install
```

Then compile the source code with webpack:

```bash
webpack -p
```

You can now run a local server such as `http-server`. To install `http-server`, run `npm install -g http-server`. You can now view the site in a browser.

You can easily build the tool and expose the server by running:

```bash
npm run restart
```

## Server side (music processing)

The provided code reads the songs list from a public URL. If you want to test the tool in your local environment, you have to set the audioDirectory variable to 'audio' in the src/Config.js file.

You have to install the requirements before executing the python script:

```bash
pip install -r requirements.txt
```

The script can be executed via command line arguments:

```bash
python app.py --url [YOUTUBE_VIDEO_URL]
```

or, via web:

```bash
python app.py --web
```

```bash
curl http://localhost:4000/?url=[YOUTUBE_VIDEO_URL]
```

Examples:

```bash
python app.py --url https://www.youtube.com/watch?v=cNAdtkSjSps
```

```bash
curl http://localhost:4000/?url=https://www.youtube.com/watch?v=cNAdtkSjSps
```

After processing a song, you can play it in the web app by sending the video ID and the duration in seconds separated by comman in the URL hash as follows:

```bash
open http://localhost:8080/#[VIDEO_ID],[DURATION_IN_SECONDS]
```

Example:

```bash
open http://localhost:8080/#cNAdtkSjSps,351
``` 

## LICENSE

Copyright 2020 Carlos Toxtli

Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

This project has been modified by Carlos Toxtli to add support for YouTube songs.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
