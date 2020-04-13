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
import Players from 'Tone/source/Players'
import AudioBuffer from 'Tone/core/Buffer'
import BufferSource from 'Tone/source/BufferSource'
import AudioBuffers from 'Tone/core/Buffers'
import Tone from 'Tone/core/Tone'
import {trackConfig, useVoiceOver, supported} from 'Config'

export class Voice extends events.EventEmitter{
	constructor(){
		super()

		this._playedLoading = false

		const voFolder = './audio/vo'
		const voServer = 'http://demos.hcilab.ml/audio'

		this._players = new Players().toMaster()
		this._players.fadeOut = 0.5
		this._players.volume.value = -10

		trackConfig.forEach(track => {
			if (track.intro){
				this.loadTrack(track.artist, `${voServer}/song.mp3`)
			}
		})

		//this._players.add('experience', `${voFolder}/intro.[mp3|ogg]`)
		//this._players.add('experience', `https://drive.google.com/uc?export=download&id=1DexhEJ656ejRu4Uy5lwFWY4Z7S0sNQ8O`)
		//this._players.add('experience', `https://drive.google.com/uc?id=1DexhEJ656ejRu4Uy5lwFWY4Z7S0sNQ8O`)
		this.loadTrack('experience', `${voServer}/intro.mp3`)
		this.loadTrack('loading', `${voServer}/loading.mp3`)
		//this._players.add('loading', `${voFolder}/loading.[mp3|ogg]`)

		this._id = -1
	}

	loadTrack(trackName, url){
		//console.log(url)
		this._players.add(trackName, url, (e) => {
			if (!e.loaded) {
				//console.log(e)
				setTimeout(() => {
					loadTrack(trackName, url)
				}, Math.random() * 200 + 200)
			}
		})
	}

	pickAnother(){

	}

	intro(delay=0){
		this.stop()
		this._players.get('experience').start()
	}

	playVoices() {
		if (this._players.has(track.artist) && useVoiceOver){
			this._players.get(track.artist).start('+0.5')
			let duration = this._players.get(track.artist).buffer.duration + 0.5

			if (!this._playedLoading){
				this._playedLoading = true
				console.log('DURATION')		
				console.log(duration)
				this._players.get('loading').start(`+${duration}`)
				duration += this._players.get('loading').buffer.duration
			}

			this._id = Tone.context.setTimeout(() => {
				this.emit('ended')
			}, duration)
		} else {
			setTimeout(() => {
				this.emit('ended')
			}, 200)
		}
	}

	playUntilLoaded(inputFn) {
		try {
			inputFn()
		} catch(e) {
			console.log(e)
			console.log('RETRY')
			setTimeout(() => {
				this.playUntilLoaded(inputFn)
			}, 200)
		}
	}

	song(track){
		this.stop()
		this.playUntilLoaded(this.playVoices)
	}

	/**
	 * stop the currently playing audio
	 */
	stop(){
		Tone.context.clearTimeout(this._id)
		this._players.stopAll('+0.5')
	}
}
