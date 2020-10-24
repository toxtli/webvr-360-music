var interfaceUrl = '';
//var serverUrl = '/';
//var serverUrl = 'https://3dyt.hcilab.ml/';

//setTimeout(()=>{
let hash = location.hash.substr(1);
if (hash) {
	document.getElementById('enter-vr-container').style.display = 'inline-block';
	document.getElementById('enter-mobile-container').style.display = 'inline-block';
	document.getElementById('songSection').style.display = 'none';
	document.getElementById('goBack').style.display = 'block';
	document.getElementById('description').style.display = 'none';
	//document.querySelector('.webvr-ui-button').click();
	logVisit();
} else {
	document.getElementById('songSection').style.display = 'block';
	document.getElementById('goBack').style.display = 'none';
	document.getElementById('enter-vr-container').style.display = 'none';
	document.getElementById('enter-mobile-container').style.display = 'none';
	document.getElementById('description').style.display = 'block';
	//document.getElementById('enter-vr-container').style.visibility = 'hidden';
}
//}, 100);

function playSong(vid) {
	window.location.href = interfaceUrl + vid.substr(1);
	location.reload();
}

document.getElementById('sendButton').addEventListener('click', () => {
	var serverUrl = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=queue&q=';
	var youtubeUrl = document.getElementById('url').value;
	if (youtubeUrl) {
		var urlArr = [youtubeUrl];
		var email = document.getElementById('email').value;
		if (email) {
			document.getElementById("sendButton").innerHTML = '...';
			document.getElementById('sendButton').setAttribute('disabled', '1');
			console.log('PROCESSING SONG');
			urlArr.push(email);
			//serverUrl += encodeURI(youtubeUrl);
			serverUrl += encodeURIComponent(JSON.stringify(urlArr));
			//console.log(serverUrl);
			fetch(serverUrl)
			  .then((response) => {
			    return response.json();
			  })
			  .then((data) => {
			  		document.getElementById("sendButton").innerHTML = 'CONVERT';
			  		document.getElementById('sendButton').removeAttribute('disabled');
					console.log(data);
					if (data.status == 'OK') {
						var songUrl = data.value;
						document.getElementById('formMsg').innerHTML = 'We already have that song in the list. You can <a href=\'javascript:playSong("' + songUrl + '")\'>play it from this link</a>';
					} else {
						document.getElementById('formMsg').innerHTML = 'We got your request, depending on the queued tasks it may take minutes or hours. We will send an email when done, please check your inbox and your spam folder. If you do not get the email please check the music list after some time.';
						console.log(data);
					}
			  });
		} else {
			document.getElementById('formMsg').innerHTML = 'Please provide a valid e-mail.';
		}
	} else {
		document.getElementById('formMsg').innerHTML = 'Please provide a valid Youtube URL.';
	}
});

document.getElementById('selectSong').addEventListener('click', () => {
	var select = document.getElementById('songsList');
	if (select.value) {
		var hashUrl = interfaceUrl + '#'+ select.value;
		window.location.href = hashUrl;
		location.reload();
	}
});

if (navigator.permissions && navigator.clipboard && navigator.clipboard.readText) {
	document.getElementById('pasteSection').removeAttribute('hidden');
	document.getElementById('pasteButton').addEventListener('click', () => {
		console.log('PASTE');
		navigator.permissions.query({name: "clipboard-read"}).then(result => {
		  console.log(result.state);
		  if (result.state == "granted" || result.state == "prompt") {
		    //document.getElementById('url').focus();
	  		//document.execCommand("paste");
			navigator.clipboard.readText().then(text => document.getElementById('url').value = text);
		  }
		});
	});
}

var filterOn = false;
document.getElementById('toggleSearch').addEventListener('click', () => {
	if (filterOn) {
		$("#songsList").msDropdown().data("dd").hideFilterBox()
		filterOn = false;
	} else {
		$("#songsList").msDropdown().data("dd").showFilterBox()
		filterOn = true;
	}
});

document.getElementById('enable-motion').addEventListener('click', () => {
    // feature detect
    try {
	    console.log('ENABLING')
	    if (typeof DeviceMotionEvent.requestPermission === 'function') {
	      DeviceMotionEvent.requestPermission()
	        .then(permissionState => {
	          if (permissionState === 'granted') {
	          	console.log('GRANTED');
	            window.addEventListener('devicemotion', () => {});
	          } else {
	          	console.log('NOT GRANTED');
	          }
	        })
	        .catch(console.error);
	    } else {
	      console.log('ANOTHER DEVICE');
	      // handle regular non iOS 13+ devices
	    }    	
    } catch(e) {
    	console.log(e);
    }
});

// document.getElementById('enable-orientation').addEventListener('click', () => {
//     // feature detect
//     if (typeof DeviceOrientationEvent.requestPermission === 'function') {
//       DeviceOrientationEvent.requestPermission()
//         .then(permissionState => {
//           if (permissionState === 'granted') {
//             window.addEventListener('deviceorientation', () => {});
//           }
//         })
//         .catch(console.error);
//     } else {
//       // handle regular non iOS 13+ devices
//     }
// });

(function() {
	if (!location.hash.substr(1)) {
		var select = document.getElementById('songsList');
		var serverUrl = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=readSongs&q=1';
		fetch(serverUrl)
		    .then((response) => {
		        return response.json();
		    })
		    .then((data) => {
				if (data.status == 'OK') {
					select.options[0].innerHTML = '--- CHOOSE A SONG ---';
					var values = data.value;
					for (var row of values) {
						if (row[0]) {
							var opt = document.createElement('option');
						    opt.value = row[0] + ',' + row[2];
						    opt.setAttribute("data-image", "https://i.ytimg.com/vi/" + row[0] + "/default.jpg");
						    opt.innerHTML = row[1];
						    select.appendChild(opt);
						}
					}
					try {
						$(select).msDropDown();
						var oDropdown = $("#songsList").msDropdown().data("dd");
						$("body").append( "<style>#splash #splash-container #bands span {display:inline;}</style>");
					} catch(e) {
						console.log(e.message);
					}
				}
		  });
	}
})();

$('#songsList').on('change', () => {
	var select = document.getElementById('songsList');
	if (select.value) {
		document.getElementById('selectSong').removeAttribute('disabled');
	} else {
		document.getElementById('selectSong').setAttribute('disabled', '1');
	}
});

function logVisit() {
	var hash = location.hash.substr(1);
	var infoServer = 'https://httpbin.org/anything';
	var logServer = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=log&q=';
	try {
		fetch(infoServer).then((response) => {
		    return response.json();
		}).then((data) => {
			//console.log(data);
		  	var params = [
		  		(new Date()).getTime(),
		  		hash.split(',')[0],
		  		data.origin,
		  		data.headers["Accept-Language"],
		  		data.headers["User-Agent"]
		  	]
		  	logServer += encodeURIComponent(JSON.stringify(params));
		  	fetch(logServer).then((r) => {
		    	return r.text();
		  	}).then((record) => {
		  		//console.log(record);
		  	});
		});
	} catch(e) {
		//console.log(e);
	}
}

var instrumentsDict = {
	'other': 0,
	'piano': 1,
	'drums': 2,
	'voice': 4,
	'bass': 6
}

function moveTrackPosition(el, x, y, z) {
	threedObj[el].position.x = x;
	threedObj[el].position.y = y;
	threedObj[el].position.z = z;
	const position = new THREE.Vector3().setFromMatrixPosition(threedObj[el].matrixWorld)
	pannersObj[el].setPosition(position.x, position.y, position.z);
}

function moveTrackName(name, x, y, z) {
	var el = instrumentsDict[name];
	threedObj[el].position.x = x;
	threedObj[el].position.y = y;
	threedObj[el].position.z = z;
	const position = new THREE.Vector3().setFromMatrixPosition(threedObj[el].matrixWorld)
	pannersObj[el].setPosition(position.x, position.y, position.z);
}

function animateTrackPosition(el, steps, timing, field, increase) {
	if (steps > 0) {
		setTimeout(
			()=>{
				threedObj[el].position[field] += increase;
				const position = new THREE.Vector3().setFromMatrixPosition(threedObj[el].matrixWorld)
				pannersObj[el].setPosition(position.x, position.y, position.z);
				animateTrackPosition(el, --steps, timing, field, increase)
			},
			timing
		);
	}
}

function animateTrackName(name, steps, timing, field, increase) {
	if (steps > 0) {
		setTimeout(
			()=>{
				var el = instrumentsDict[name];
				threedObj[el].position[field] += increase;
				const position = new THREE.Vector3().setFromMatrixPosition(threedObj[el].matrixWorld)
				pannersObj[el].setPosition(position.x, position.y, position.z);
				animateTrackPosition(el, --steps, timing, field, increase)
			},
			timing
		);
	}
}

function circuleTrackName(name) {
	setTimeout(
		()=>{
			var time = Date.now() * 0.0005;
			var el = instrumentsDict[name];
			var obj = threedObj[el];
			obj.position.x = Math.cos( time );
			obj.position.y = 1;
			obj.position.z = Math.sin( time );
			const position = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld)
			pannersObj[el].setPosition(position.x, position.y, position.z);
			circuleTrackName(name);
		},
		100
	);
}

function circuleDelTrackName(name, delay) {
	setTimeout(
		()=>{
			var time = Date.now() * 0.0005;
			time = time - delay;
			var el = instrumentsDict[name];
			var obj = threedObj[el];
			obj.position.x = Math.cos( time );
			obj.position.y = 1;
			obj.position.z = Math.sin( time );
			const position = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld)
			pannersObj[el].setPosition(position.x, position.y, position.z);
			circuleDelTrackName(name, delay);
		},
		100
	);
}

function transformSong() {
	circuleDelTrackName('voice', 0);
	circuleDelTrackName('bass', 1000);
	circuleDelTrackName('drums', 2000);
	circuleDelTrackName('piano', 3000);
	circuleDelTrackName('other', 4000);
}

function circuleRevTrackName(name) {
	setTimeout(
		()=>{
			var time = Date.now() * 0.0005;
			var el = instrumentsDict[name];
			var obj = threedObj[el];
			obj.position.x = Math.sin( time );
			obj.position.y = 1;
			obj.position.z = Math.cos( time );
			const position = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld)
			pannersObj[el].setPosition(position.x, position.y, position.z);
			circuleRevTrackName(name);
		},
		100
	);
}

// try {
// 	if (DeviceMotionEvent) {
// 		if (typeof DeviceMotionEvent.requestPermission === 'function') {
// 		  DeviceMotionEvent.requestPermission()
// 		    .then(permissionState => {
// 		      if (permissionState === 'granted') {
// 		        window.addEventListener('devicemotion', () => {});
// 		      }
// 		    })
// 		    .catch(console.error);
// 		} else {
// 		  // handle regular non iOS 13+ devices
// 		}	
// 	}
// } catch(e) {}

// try {
// 	if (DeviceOrientationEvent) {
// 		if (typeof DeviceOrientationEvent.requestPermission === 'function') {
// 		  DeviceOrientationEvent.requestPermission()
// 		    .then(permissionState => {
// 		      if (permissionState === 'granted') {
// 		        window.addEventListener('deviceorientation', () => {});
// 		      }
// 		    })
// 		    .catch(console.error);
// 		} else {
// 		  // handle regular non iOS 13+ devices
// 		}
// 	}
// } catch(e) {}

// let songs = document.querySelectorAll('.song');
// for (let song of songs) {
// 	song.addEventListener('click', ()=>{
// 		var hashUrl = '/#'+ song.id.replace('_',',');
// 		window.location.href = hashUrl;
// 		location.reload();
// 	});
// }