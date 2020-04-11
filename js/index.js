
document.getElementById('enter-vr-container').style.visibility = 'hidden';
setTimeout(()=>{
	let hash = location.hash.substr(1);
	if (hash) {
		document.getElementById('enter-vr-container').style.visibility = 'visible';
		document.getElementById('songSection').style.display = 'none';
		document.getElementById('goBack').style.display = 'block';
		//document.querySelector('.webvr-ui-button').click();
	} else {
		document.getElementById('songSection').style.display = 'block';
		document.getElementById('goBack').style.display = 'none';
		//document.getElementById('enter-vr-container').style.visibility = 'hidden';
	}
}, 100);

function playSong(vid) {
	window.location.href = vid;
	location.reload();
}

document.getElementById('sendButton').addEventListener('click', () => {
	var serverUrl = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=queue&q=';
	var youtubeUrl = document.getElementById('url').value;
	if (youtubeUrl) {
		var urlArr = [youtubeUrl];
		var email = document.getElementById('email').value;
		if (email) {
			console.log('PROCESSING SONG');
			urlArr.push(email);
			//serverUrl += encodeURI(youtubeUrl);
			serverUrl += encodeURI(JSON.stringify(urlArr));
			console.log(serverUrl);
			fetch(serverUrl)
				.then((response) => {
			    return response.json();
			  })
			  .then((data) => {
					console.log(data);
					if (data.status == 'OK') {
						var songUrl = data.value;
						document.getElementById('formMsg').innerHTML = 'We already have that song in the list. You can <a href=\'javascript:playSong("' + songUrl + '")\'>play it from this link</a>';
					} else {
						document.getElementById('formMsg').innerHTML = 'We got your request, depending on the queued tasks it may take minutes or hours. We will send an email when done, please check your inbox and your spam folder.';
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
		var hashUrl = '/#'+ select.value;
		window.location.href = hashUrl;
		location.reload();
	}
});

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

(function() {
	var select = document.getElementById('songsList');
	var serverUrl = 'https://script.google.com/macros/s/AKfycbxsr0Wtr7AaLILm-4cgZ0zgUfPd7ln1VS9j5GRTVWcFSOzoVG4/exec?a=read&q=songs';
	fetch(serverUrl)
	    .then((response) => {
	        return response.json();
	    })
	    .then((data) => {
			if (data.status == 'OK') {
				select.options[0].innerHTML = '--- CHOOSE A SONG ---';
				var values = data.value;
				for (var row of values) {
					var opt = document.createElement('option');
				    opt.value = row[0] + ',' + row[2];
				    opt.setAttribute("data-image", row[3]);
				    opt.innerHTML = row[1];
				    select.appendChild(opt);
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
})();

$('#songsList').on('change', () => {
	var select = document.getElementById('songsList');
	if (select.value) {
		document.getElementById('selectSong').removeAttribute('disabled');
	} else {
		document.getElementById('selectSong').setAttribute('disabled', '1');
	}
});

// let songs = document.querySelectorAll('.song');
// for (let song of songs) {
// 	song.addEventListener('click', ()=>{
// 		var hashUrl = '/#'+ song.id.replace('_',',');
// 		window.location.href = hashUrl;
// 		location.reload();
// 	});
// }