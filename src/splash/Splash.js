/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import events from 'events'
import 'style/splash.scss'
import {title} from 'Config'
import 'aframe'
import 'Scene'
import AudioBuffer from 'Tone/core/Buffer'
import Tone from 'Tone/core/Tone'
import {SplashScene} from 'splash/Scene'
import StartAudioContext from 'startaudiocontext'
import * as webvrui from 'webvr-ui/build/webvr-ui'
import {ExitButton} from 'interface/ExitButton'
import {InsertHeadset} from 'interface/InsertHeadset'
import Master from 'Tone/core/Master'
import {GA} from 'utils/GA'
import { isMobile, isTablet } from 'utils/Helpers'

const audioBufferLoaded = new Promise(resolve=> AudioBuffer.on('load', resolve));

/**
 * A View that manages the loading Splash Screen Scene and the users
 * ability to enter the experience.
 * @param {HTMLElement} container
 */
export default function initSplash(container=document.body){
    //the AFrame scene
    const aScene = container.querySelector('a-scene')
	const splash = container.querySelector('#splash')
	//this link is for when VR is available but user might want 360 instead
	const tryItIn360 = document.getElementById('try-it-in-360');
    const enableMotion = document.getElementById('enable-motion');
	//holds the buttons
	const enterVRContainer = splash.querySelector('#enter-vr-container');
    //the splash threejs scene
	const splashScene = new SplashScene(splash.querySelector('canvas'))

	const aSceneLoaded = new Promise(resolve=> aScene.addEventListener('loaded', resolve));


	// create the webvr-ui Button
    const enterVRButton = new webvrui.EnterVRButton(null, {
        color: '#ffffff',
		corners : 'square',
		onRequestStateChange: (state)=>{
			// if(state === webvrui.State.PRESENTING){
			// 	enterVRButton.setTitle('WAITING');
			// }
            console.log('onRequestStateChange')
            console.log(state)
            console.log(enterVRButton.manager.defaultDisplay)
			return true;
		},
        textEnterVRTitle: 'ENTER VR'.toUpperCase()
	});

    enterVRButton.domElement.addEventListener('click', () => {enterVRButton.setTitle('WAITING');console.log('enterVRButton.setTitle');}, true);

    //create the Enter 360 Button that is full-size and replaces Enter VR
    function createEnter360Button(){
        console.log('createEnter360Button')
        enterVRContainer.innerHTML = '';
        const enter360 = document.createElement('button');
        enter360.classList.add('webvr-ui-button');
        enter360.style.color = 'white';
        enter360.innerHTML = `<div class="webvr-ui-title" style="padding: 0;">BROWSER-MODE</div>`;
        enterVRContainer.appendChild(enter360);
        enter360.addEventListener('click', onEnter360);
        tryItIn360.style.display = 'none';
        enableMotion.style.display = 'none';
        GA("vr-display", "none");
        return enter360;
    }

	// this can happen by "Enter 360" or "Try it in 360"
	function onEnter360(){
        console.log('onEnter360')
		splash.classList.remove('visible')
		splashScene.close()
		aScene.play()
		aScene.emit('enter-360')
		GA('ui', 'enter', '360')
	}


    if(isTablet()){
        console.log('isTablet')
        createEnter360Button();
    }

	enterVRButton.on('ready', () => {
        console.log('enterVRButton.on.ready')
	    const display = enterVRButton.manager.defaultDisplay;
        console.log(display)
		if(display){
            console.log('enterVRButton.display')
            console.log(display.displayName)
			GA("vr-display", display.displayName);
			aScene.setAttribute('headset', display.displayName);
		} 
		enterVRButton.domElement.style.marginBottom = '10px';
		if(!isTablet()) {
            console.log('!isTablet')
            enterVRContainer.insertBefore(enterVRButton.domElement, enterVRContainer.firstChild);
        }
		tryItIn360.style.display = 'inline-block';
        enableMotion.style.display = 'inline-block';
	});


	enterVRButton.on('enter',()=>{
        console.log('enterVRButton.on.enter')
        splash.classList.remove('visible')
        splashScene.close()
		aScene.play();
		aScene.enterVR();
        GA('ui', 'enter', 'vr');
        // try {
        //     window.exitVR = aScene.exitVR;
        // } catch(e) {
        //     console.log(e);
        // }
	});

	enterVRButton.on('exit', ()=>{
        console.log('enterVRButton.on.exit')
		aScene.exitVR();
		aScene.pause();
        splash.classList.add('visible')
        splashScene.start();
	});

	enterVRButton.on('error', ()=>{
        console.log('enterVRButton.on.error')
        console.log(enterVRButton.state)
        console.log(enterVRButton.manager.defaultDisplay)
        GA('ui', 'enter', 'vr');
		if(enterVRButton.state === webvrui.State.ERROR_NO_PRESENTABLE_DISPLAYS || enterVRButton.state === webvrui.State.ERROR_BROWSER_NOT_SUPPORTED){
		    console.log('createEnter360Button')
            createEnter360Button();
		}
	});

    //start the audio context on click
    if (location.hash.substr(1)) {
        setTimeout(() => {
            console.log('StartAudioContext')
            StartAudioContext(Tone.context, [enterVRContainer])
        }, 1000)
    } else {
        console.log('NOT StartAudioContext')
    }
	splashScene.start();

    window.splashScene = splashScene;

    aSceneLoaded
        //load the scene, say "loading"
        .then(()=>{
			//now that we have a renderer, make sure webvr-ui gets the canvas
			enterVRButton.sourceCanvas = aScene.renderer.domElement;
			console.log('enterVRButton.sourceCanvas')
            console.log(enterVRButton.sourceCanvas)
            //dont run the aScene in the background
			aScene.pause();
			//add the loaded events
			tryItIn360.addEventListener('click', onEnter360);
		})
        //load audio for entry
        .then(audioBufferLoaded)
        //change text to "Enter **"
        .then(()=>{
			//audio and everything is loaded now
			enterVRContainer.classList.add('ready');
			const always = ()=> {
                //if WebVR is available and its not polyfill on a tablet
                console.log('enterVRButton.state')
                console.log(enterVRButton.state)
                if (enterVRButton.state === webvrui.State.READY_TO_PRESENT && !(isMobile() && isTablet())) {
                    console.log('READY_TO_PRESENT')
                    enterVRButton.setTitle('VR MODE'.toUpperCase());
                } else if (isTablet() || (enterVRButton.state || '').indexOf('error') >= 0) {
                    console.log('enterVRButton.isTablet')
                    document.querySelector('.webvr-ui-title').innerHTML = '<img src="./images/360_icon.svg"><span>BROWSER-MODE</span>';
                    document.querySelector('.webvr-ui-title').classList.add('mode360')
                }
            };
            return enterVRButton.getVRDisplay()
                .then(always, always);
		})
        .catch(console.error.bind(console));



    new ExitButton()
    new InsertHeadset()
	aboutPage();

	return splash;
}



/**
 * Bind the about page elements to showing / hiding the page
 * @param {HTMLElement} about the about page root element, defaults to #about
 */
function aboutPage(about=document.querySelector('#about')){
    //open the about page
    console.log('aboutPage')
    const openAbout = splash.querySelector('#openAbout')
    const closeAbout = splash.querySelector('#closeAbout')

    openAbout.addEventListener('click', () => {
        console.log('openAbout')
        about.classList.add('visible')
        GA('ui', 'open', 'about')
    })

    closeAbout.addEventListener('click', () => {
        console.log('closeAbout')
        about.classList.remove('visible')
        GA('ui', 'close', 'about')
    })

    return about;
}


