(function() {
	// let OS_API 		= 'https://nominatim.openstreetmap.org/reverse';
		
	let TEMPLATE = '<div class="weather-main">'+
	'		<h3 class="weather-main-location">San Francisco</h3>'+
	'		<h3 class="weather-main-date">Thu 8.20</h3>'+
	'		<div class="weather-main-row">'+
	'			<img class="weather-main-icon" />'+
	'			<h1 class="weather-main-temp">0</h1>'+
	'			<div class="weather-main-units">'+
	'				<span class="weather-main-fahrenheit">F</span>'+
	'				<span class="weather-main-celsius">C</span>'+
	'			</div>'+
	'		</div>'+
	'		<h3 class="weather-main-desc"></h3>'+
	'		<small class="weather-main-updated">Updated as of 8:54PM</small>'+
	'		<ul class="weather-main-xinfo">'+
	'			<li class="weather-main-feels">'+
	'				Feels like 0'+
	'			</li>'+
	'			<li class="weather-main-wind">'+
	'				Wind 9 mph'+
	'			</li>'+
	'			<li class="weather-main-humidity">'+
	'				Humidity'+
	'			</li>'+
	'		</ul>'+
	'	</div>'+
	'	<ul class="weather-data">'+
	'		<li class="weather-temp">'+
	'			<h4 class="weather-date">Mon</h4>'+
	'			<img class="weather-date-icon" src="" />'+
	'			<div class="weather-date-min-max">'+
	'				<span class="weather-date-max">0</span>'+
	'				<span class="weather-date-min">0</span>'+
	'			</div>'+
	'			<small class="weather-date-desc"></small>'+
	'		</li>'+
	'		<li class="weather-temp">'+
	'			<h4 class="weather-date">Tue</h4>'+
	'			<img class="weather-date-icon" src="" />'+
	'			<div class="weather-date-min-max">'+
	'				<span class="weather-date-max">0</span>'+
	'				<span class="weather-date-min">0</span>'+
	'			</div>'+
	'			<small class="weather-date-desc"></small>'+
	'		</li>'+
	'		<li class="weather-temp">'+
	'			<h4 class="weather-date">Wed</h4>'+
	'			<img class="weather-date-icon" src="" />'+
	'			<div class="weather-date-min-max">'+
	'				<span class="weather-date-max">0</span>'+
	'				<span class="weather-date-min">0</span>'+
	'			</div>'+
	'			<small class="weather-date-desc"></small>'+
	'		</li>'+
	'		<li class="weather-temp">'+
	'			<h4 class="weather-date">Thu</h4>'+
	'			<img class="weather-date-icon" src="" />'+
	'			<div class="weather-date-min-max">'+
	'				<span class="weather-date-max">0</span>'+
	'				<span class="weather-date-min">0</span>'+
	'			</div>'+
	'			<small class="weather-date-desc"></small>'+
	'		</li>'+
	'		<li class="weather-temp">'+
	'			<h4 class="weather-date">Fri</h4>'+
	'			<img class="weather-date-icon" src="" />'+
	'			<div class="weather-date-min-max">'+
	'				<span class="weather-date-max">0</span>'+
	'				<span class="weather-date-min">0</span>'+
	'			</div>'+
	'			<small class="weather-date-desc"></small>'+
	'		</li>'+
	'	</ul>';
		

		
	let IP_LOOKUP_API		= 'https://json.geoiplookup.io';
	let OPEN_WEATHER_API 	= 'https://api.openweathermap.org/data/2.5/onecall?lat=:latitude&lon=:longitude&units=:units&appid=:key';
	let OPEN_WEATHER_ICONS 	= 'https://openweathermap.org/themes/openweathermap/assets/vendor/owm/img/widgets/:filename.png';
	
	let REQUEST_OK 	= 200;
	let REQUEST_BAD = 400;
	
	let SUNDAY		= 0;
	let MONDAY 		= 1;
	let TUESDAY 	= 2;
	let WEDNESDAY 	= 3;
	let THURSDAY	= 4;
	let FRIDAY		= 5;
	let SATURDAY	= 6;

	/**************************************************************************************
	 *
	 *	UTIL FUNCTIONS
	 *
	/**************************************************************************************
	
	/*
	 * Helper function to extend an object
	 */
	function extend(out) {
		let args = Array.prototype.slice.call(arguments);
		
		for (let i = 1 ; i < args.length; i++) {
			
			let object = args[i];
			if (!isOfType(object, 'undefined')) {
				
				for (let key in object) {
					let value = object[key];
					if ( isOfType(value, 'object') ) {
						out[key] = extend({}, value)
					}  
					else {
						out[key] = value;
					}
				}
			}
		}
		
		return out;
	}
	
	/*
	 * Build a string following the built-in type pattern of javascript toString method  
	 */
	function toStringType(type) {
		return '[object ' + type + ']';
	}
	
	/*
	 * Get the built-in type of an object
	 */
	function getType(object) {
		return Object.prototype.toString.call(object);
	}
	
	/*
	 * Test if an object is of type object, string, integer, double, etc.
	 * i.e., is(object, 'string'), is(object, 'object')
	 */
	function isOfType(object, type) {
		return getType(object).toLowerCase() === toStringType(type).toLowerCase();
	}
	
	/***************************** END UTIL FUNCTIONS *************************************/
	
	
	
	function get(container, selector) {
		return container.querySelector(selector);
	}
	
	/*
	 * Helper function for left zero-padding a number
	 */
	function zeroPaddedFormat(str, padding = '00') {
		return (padding+str).slice(-2);
	}
	
	function toAMPMTime(date) {
		let hours = date.getHours();
		let	mins = zeroPaddedFormat(date.getMinutes());	
		let ampm = hours >= 12 
			? 'PM' : 'AM'; 
	
		if ( hours % 12 ) {
			return `${hours % 12}:${mins} ${ampm}`;
		}
		
		return `12:${mins} ${ampm}`;
	}
	
	function getStrDay(day, full) {
		switch(day) {
			case SUNDAY:
				return 'Sun';
			case MONDAY:
				return 'Mon';
			case TUESDAY:
				return 'Tue';
			case WEDNESDAY:
				return 'Wed';
			case THURSDAY:
				return 'Thu';
			case FRIDAY:
				return 'Fri';
			case SATURDAY:
				return 'Sat';
		}
	}
	
	function setDateView() {
		this.date.innerHTML = getStrDay(this.datetime.getDay())
			+' '+ (1 + this.datetime.getMonth())
			+'.'+ this.datetime.getDate();
	}
	/*
	function setTimeView() {
		this.time.innerHTML = this.datetime.getHours()
			+':'+ zeroPaddedFormat(this.datetime.getMinutes());
	}
	*/
	function ajax(type, url, options) {
		let defaults = {
			data: {},
			headers: {},
			
			onloadstart: function(e) {},
			onprogress: function(e) {},
			onloadend: function(e) {},
			
			success: function() {},
			error: function() {},
			done: function() {},
		};
	
		let object = extend({}, defaults, options);
	
		let xhr = new XMLHttpRequest() 
			|| new ActiveXObject('Microsoft.XMLHTTP');
			
		Object.entries(object.headers)
			.forEach(function([k, v]) {
				xhr.setRequestHeader(k, v);
			});
		
		xhr.open(type, url, true);
		
		xhr.onloadstart = object.onloadstart;
		xhr.onprogress = object.onprogress;
		xhr.onloadend = object.onloadend;
		
		xhr.onreadystatechange = function(e) {
			if (this.readyState === XMLHttpRequest.DONE) {
				if(xhr.status >= 200 && 299 >= xhr.status) {
					object.onsuccess(this);
				}
				else if (xhr.status >= 400 && 499 >= xhr.status) {
					object.onerror(this);
				}
				else {
					object.ondone(this);
				}
			}
		};
		
		
		xhr.send(object.data);
	}
	
	function setLocationView(callback) {
		let self = this;
		ajax('get', IP_LOOKUP_API, {
			onloadstart: function(e) {
				console.log(e);
			},
			onloadend: function(e) {
				console.log(e);
			},
			onprogress: function(e) {
				console.log(e);
			},
			onsuccess: function(xhr) {
				try {
					let location = JSON.parse(xhr.response);
					self.location.innerHTML = self.settings.location(location);
					
					localStorage.setItem('__wip', xhr.response);
					callback.call(self, location);
				}
				catch(e) {
					
				}
				
			},
			onerror: function(xhr) {
				console.log(e);
			}
		});
	}
	
	function setTempView(location) {
		let self = this;
		let url = OPEN_WEATHER_API.replace(/:key/, self.settings.key)
			.replace(/:latitude/, location.latitude)
			.replace(/:longitude/, location.longitude)
			.replace(/:units/, this.settings.units);
			
		let isDataCurrent = function(raw) {
			if ( !raw )
				return false;
		
			try{
				let json = JSON.parse(raw);
				
				let then = new Date(json.data.current.dt * 1e3);
				let now = new Date();
				
				if ( json.expiry < now.getTime() ) {
					return false;
				}
				
				return now.getDate() === then.getDate() 
					|| now.getFullYear() === then.getFullYear()
					|| now.getMonth() === then.getMonth();
			}
			catch(e) {
				return false;
			}
		};
			
		let raw = localStorage.getItem(url);
		if ( !isDataCurrent(raw) ) {	
			
			ajax('get', url, {
				onloadstart: function(e) {
				
				},
				onloadend: function(e) {

				},
				onsuccess: function(xhr) {
					try{
						let json = JSON.parse(xhr.response);
						localStorage.setItem(url, JSON.stringify({
							expiry: Date.now() + (10 * 60 * 60 * 1000),
							data: json
						}));
						
						setTempCurrentReading.call(self, json);
						setTempFutureReading.call(self, json);
					}
					catch(e) {
						console.log('ERROR', e);
					}
					
				},
				onerror: function(xhr) {
				
				}
			});	
		}
		else {
			let json = JSON.parse(raw);
			setTempCurrentReading.call(self, json.data);
			setTempFutureReading.call(self, json.data);
			
		}
	}
	
	function getWindDirection(deg) {
		if (deg >= 20 && 30 >= deg) {
			return 'N/NE';
		}
		if (deg >= 40 && 50 >= deg) {
			return 'NE';
		}
		if (deg >= 60 && 70 >= deg) {
			return 'E/NE'
		}
		if (deg >= 80 && 100 >= deg) {
			return 'E';
		}
		if (deg >= 110 && 120 >= deg) {
			return 'E/SE';
		}
		if (deg >= 130 && 140 >= deg) {
			return 'SE';
		}
		if (deg >= 150 && 160 >= deg) {
			return 'S/SE';
		}
		if (deg >= 170 && 190 >= deg) {
			return 'S';
		}
		if (deg >= 200 && 210 >= deg) {
			return 'S/SW';
		}
		if (deg >= 220 && 230 >= deg) {
			return 'SW';
		}
		if (deg >= 240 && 250 >= deg) {
			return 'W/SW';
		}
		if (deg >= 260 && 280 >= deg) {
			return 'W';
		}
		if (deg >= 290 && 300 >= deg) {
			return 'W/NW';
		}
		if (deg >= 310 && 320 >= deg) {
			return 'NW';
		}
		if (deg >= 330 && 340 >= deg) {
			return 'N/NW';
		}
		
		return 'N';
	}
	
	function setTempCurrentReading(data) {
		this.temp.innerHTML = Math.round(data.current.temp);
		
		let updated = get(this.container, '.weather-main-updated');
			updated.innerHTML = `Updated of as ${toAMPMTime(this.datetime)}`;
		
		let feels = get(this.container, '.weather-main-feels');
			feels.innerHTML = `Feels like ${Math.round(data.current.feels_like)}`;
		
		let humidity = get(this.container, '.weather-main-humidity');
			humidity.innerHTML = `Humidity ${Math.round(data.current.humidity)}`;
		
		let wind = get(this.container, '.weather-main-wind');
			wind.innerHTML = 'Wind '+getWindDirection(data.current.wind_deg) 
				+' '+Math.round(data.current.wind_speed)+' mph ';
						
		let [ weather ] = data.current.weather;
		let icon = get(this.container, '.weather-main-icon');
			icon.src = OPEN_WEATHER_ICONS
				.replace(/:filename/, weather.icon);
				
		let desc = get(this.container, '.weather-main-desc');
			desc.innerHTML = weather.main;
			
		let celsius = get(this.container, '.weather-main-celsius');
		let fahrenheit = get(this.container, '.weather-main-fahrenheit');
		if ( this.settings.units === 'metric') {
			celsius.style.opacity = 1;
			fahrenheit.style.opacity = 0.4;
		}
		else {
			celsius.style.opacity = 0.6;
			fahrenheit.style.opacity = 1;		
		}
	}
	
	function setTempFutureReading(data) {
		
		let now = new Date();
		now.setHours(12, 0, 0);
		now.setMilliseconds(0);
	
		this.container.querySelectorAll('.weather-temp')	
			.forEach(function(element) {
				now.setHours(24 + now.getHours(), 0, 0);
				let date = get(element, '.weather-date');
					date.innerHTML = getStrDay(now.getDay()) 
						+' '+ now.getDate();
				
				let reading = data.daily.find(function(object) {
					return now.getTime() === (object.dt * 1e3);
				});
		
				let min = get(element, '.weather-date-min');
					min.innerHTML = Math.round(reading.temp.min);
					
				let max = get(element, '.weather-date-max');
					max.innerHTML = Math.round(reading.temp.max);
					
				let [ weather ] = reading.weather;
				let icon = get(element, '.weather-date-icon');
					icon.src = OPEN_WEATHER_ICONS
						.replace(/:filename/, weather.icon);
						
				let desc = get(element, '.weather-date-desc');
					desc.innerHTML = weather.main;
			});
	}
	
	
	let defaults = {
		units: 'metric',
		location: function(data) {
			return data.city+', '+data.region;
		}
	};
	
	window.Weather = function(container, settings) {
		let self = this;
		self.container = container;
		self.datetime = new Date();
		self.settings = extend({}, 
			defaults, settings);
			
		container.innerHTML = TEMPLATE;
		if (container.classList.contains('.weather')) {
			container.classList.add('.weather');
		}
		
		this.date = get(container, '.weather-main-date');
		setDateView.call(self);
		
		this.temp = get(container, '.weather-main-temp');
		this.location = get(container, '.weather-main-location');
	
		setLocationView.call(self, function(location) {
			setTempView.call(self, location);
		})
		
		setInterval(function() {
			let raw = localStorage.getItem('__wip');
			if ( !raw )
				return;
				
			setTempView.call(self, 
				JSON.parse(raw));
			
		}, 60 * 60 * 1000)
	};
	
	window.Weather
} ());