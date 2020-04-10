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

import 'aframe'
import {trackConfig, supported} from 'Config'
import 'interface/Item'

AFRAME.registerComponent('menu', {

	schema : {
		shrink : {
			type : 'boolean',
			default : false
		}
	},

	open(){

	},

	init(){

		if (!supported){
			return
		}

		this.el.id = 'menu'

		this._itemWidth = 200
		this._itemHeight = 200

		let currentSelection = null

		let lastClick = Date.now()

		let planes = [];

		trackConfig.forEach((track, i) => {
			const plane = document.createElement('a-entity')
			plane.setAttribute('menu-item', {
				artist : track.artist,
				track : track.track,
				color : track.color,
				image : track.image
			})
			this.el.appendChild(plane)


			const rotated = i !== 1 && i !== 4
			const moveForward = 0.07

			if (i < 3){
				//top row
				plane.setAttribute('position', `${(i-1)} 0 ${rotated ? moveForward : 0}`)
			} else {
				//bottom row
				plane.setAttribute('position', `${(i-4)} -0.76 ${rotated ? moveForward : 0}`)
			}

			const angle = 8
			if (i === 0 || i === 3){
				plane.setAttribute('rotation', `0 ${angle} 0`)
			} else if (i === 2 || i === 5){
				plane.setAttribute('rotation', `0 ${-angle} 0`)
			}

			//unselect the previous track
			plane.addEventListener('click', () => {

				if (Date.now() - lastClick > 500){
					lastClick = Date.now()
				} else {
					return
				}

				this.el.setAttribute('menu', 'shrink', true)

				if (!plane.getAttribute('menu-item').selected){
					const trackClone = {}
					Object.assign(trackClone, track)
					this.el.emit('select', trackClone)
					this.el.sceneEl.emit('menu-selection', trackClone)
					if (currentSelection){
						currentSelection.setAttribute('menu-item', 'selected', false)
					}
					plane.setAttribute('menu-item', 'selected', true)
					currentSelection = plane
				}
			})

			planes.push(plane);
		})

		this.el.sceneEl.addEventListener('song-end', () => {
			this.el.setAttribute('menu', 'shrink', false)
		})

		this.open = () => {
			const songId = 0
			let hash = location.hash.substr(1)
			let parts = hash.split(',')
			let duration = parseInt(parts[1])
			trackConfig[0] = {
				artist : 'PLAYING',
				track : 'SONG',
				folder : parts[0],
				intro : 'song',
				segments : parseInt(duration/30),
				duration : duration,
				// duration : 5,
				trackNames : ['other', 'piano', 'drums', 'null', 'vocals', 'null', 'bass'],
				names : ['other', 'piano', 'drums', 'null', 'vocals', 'null', 'bass'],
				soundRings: {
					startColor: '#f7002d',
					endColor: '#00edaa',
					shape: 'triangle',
					size: 8
				},
				floor: {
					color: '#253934' //#263330'
				}
			}
			this.el.emit('select', trackConfig[0])
			this.el.sceneEl.emit('menu-selection', trackConfig[0])
			if (currentSelection){
				currentSelection.setAttribute('menu-item', 'selected', false)
			}
			planes[songId].setAttribute('menu-item', 'selected', true)
			currentSelection = planes[songId]
		}

		window.customStart = this.open;

	    // if (location.hash.substr(1)) {
	    //   setTimeout(this.open, 10000)  
	    // }
	},

	update(){
		if (this.data.shrink){
			this.el.emit('shrink')
		} else {
			this.el.emit('grow')
		}
	}
})
