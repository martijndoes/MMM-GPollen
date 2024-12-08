Module.register("MMM-GPollen", {
    // Default module config.
    defaults: {
		  mode: "table",						//table will display simple table. Map will display google maps with overlay
          googleApiKey: "[YOURAPIKEY]",			//your google api key
		  zoomLevel: 9,							//will control the zoomlevel if mode = map
          longitude: 52.3108558,				//longitude of your location
          latitude: 4.950632,					//latitude of your location
          language: "en",						//language in which labels are displayed
          days: 3,                              //number of forecast days you want to display in table view
          updateInterval: 60,					//in minutes. How often will it retrieve new info from the API. Don't set it too low, it will drain your monthly API Calls
		  rotateInterval: 10					//in seconds. How many seconds between pollentype switches in the map
    },
	
	getTranslations: function() {
		return {
                en: "translations/en.json",
                fr: "translations/fr.json",
                de: "translations/de.json",
                es: "translations/es.json",
				nl: "translations/nl.json"
		}
	},
	
	getStyles: function() {
		return [
			'MMM-GPollen.css'
		]
	},
	
	getScripts: function() {
		return [
			'PollenMapType.js'
		]
	},	

	//start the dom update interval
    start: function()
    {
        setInterval(() => {
            this.updateDom();
        }, this.config.updateInterval * 60 * 1000);
    },
	
    // Override dom generator.
    getDom: async function ()
    {
		var self=this;
		//if mode is set to mep retrieve all the information needed for map display
		if(this.config.mode === "map")
		{
			var wrapper = document.createElement("div");
			var script = document.createElement("script");
			wrapper.appendChild(script);
			var key = this.config.googleApiKey
			//thanks to https://forum.magicmirror.builders/topic/716/can-t-load-script-correctly/2 @ianperrin for this solution!
			//getting the script. The callback initmap function is called after the map is loaded
			this.getScript('https://www.google.com/jsapi', function() { 
				google.load('maps', '3', { other_params: 'key=' + key, callback: function() {
					self.initMap();
				}});
			});
			
			//create three divs. One for each type of map
			var map = document.createElement("div");
			var id = document.createAttribute("id");
			id.value = "mapDiv";
			map.setAttributeNode(id);
			wrapper.appendChild(map);
			
			var map2 = document.createElement("div");
			var id2 = document.createAttribute("id");
			id2.value = "mapDiv2";
			map2.setAttributeNode(id2);
			wrapper.appendChild(map2);
			
			var map3 = document.createElement("div");
			var id3 = document.createAttribute("id");
			id3.value = "mapDiv3";
			map3.setAttributeNode(id3);
			wrapper.appendChild(map3);
		}
		//what happens is the display mode is set to table
		else if (this.config.mode === "table")
		{
			//first construct thr url and then retrieve the table with all the data
			var api_url = this.constructUrl();
			var dataTable = await this.getData(api_url);
			var wrapper = document.createElement("div");
			wrapper.appendChild(dataTable);
		}

      return wrapper;
    },
	

	//getting the data for the table view
    getData: async function(apiUrl)
    {
        var table=document.createElement("table");
  
        try
        {
            const response = await fetch(apiUrl);
            if (!response.ok)
            {
                throw new Error(`Response status: ${response.status}`);
            }
  
            const json = await response.json();
			
			//header of the table. Fill it with the types of pollen
			var label1 = json.dailyInfo[0].pollenTypeInfo[0].displayName;
			var label2 = json.dailyInfo[0].pollenTypeInfo[1].displayName;
			var label3 = json.dailyInfo[0].pollenTypeInfo[2].displayName;
			var headerRow = document.createElement("tr");
			var headerCell = document.createElement("th");
			headerCell.innerHTML = " ";
			headerRow.appendChild(headerCell);
			var headerCell1 = document.createElement("th");
			headerCell1.innerHTML = label1;
			headerRow.appendChild(headerCell1);
			var headerCell2 = document.createElement("th");
			headerCell2.innerHTML = label2;
			headerRow.appendChild(headerCell2);
			var headerCell3 = document.createElement("th");
			headerCell3.innerHTML = label3;
			headerRow.appendChild(headerCell3);
			table.appendChild(headerRow);
			
			
			
			var dayEl = json.dailyInfo;
            var dayLen = dayEl.length;
			//loop through the days
			for(var d = 0; d < dayLen; d++)
			{
				var el = json.dailyInfo[d].pollenTypeInfo;
				var len = el.length;
				//create the row, fill the first cell with the name of the day
				var row = document.createElement("tr");
				var dayCell = document.createElement("td");
				dayCell.innerHTML = this.getDayName(d, this.config.language);
				row.appendChild(dayCell);
				
				//loop through the pollentypes. Fill the cell with the value for that day
				for (var i = 0; i < len; i++)
				{
					var entry = json.dailyInfo[d].pollenTypeInfo[i];
					var valCell = document.createElement("td");
					if (entry.indexInfo != null)
						valCell.innerHTML = entry.indexInfo.category;
					else
						valCell.innerHTML = this.translate("None");		

					row.appendChild(valCell);
				}
				table.appendChild(row);
			}

            return table;
        } catch (error) {
            Log.error(error.message);
            console.error(error.message);
        }
    },
	
	
	//construct the URL for the table view
    constructUrl: function()
    {
        var url = "https://pollen.googleapis.com/v1/forecast:lookup?";

        url += "key="
        url += this.config.googleApiKey;
        
        url += "&location.longitude=";
        url += this.config.longitude;
        
        url += "&location.latitude=";
        url += this.config.latitude;

        url += "&days=";
        url += this.config.days;

        url += "&languageCode=";
        url += this.config.language;

        url += "&plantsDescription=";
        url += "false";

        Log.info("The constructed url is:" + url);
        return url;
    },
	
	//gets the name of the day in a specific language, either the current or "addDays" days in future.
	getDayName: function(addDays, locale)
	{
		var date = new Date();
		date.setDate(date.getDate() + addDays);
		return date.toLocaleDateString(locale, { weekday: 'long' });  
	},	
	
	
	//init the map view
	initMap: function() 
	{
		//set the location from the config
		const myLatLng = { lat: this.config.latitude, lng: this.config.longitude };

		//initialize the maps. Some configs are in here like the zoomlevel
		const map = new google.maps.Map(document.getElementById("mapDiv"), {
		  mapId: "ffcdd6091fa9fb03",
		  zoom: this.config.zoomLevel,
		  center: myLatLng,
		  maxZoom: 16,
		  minZoom: 3,
		  restriction: {
			latLngBounds: {north: 80, south: -80, west: -180, east: 180},
			strictBounds: true,
		  },
		  streetViewControl: false,
		  disableDefaultUI: true,
		}); 
		
		const map2 = new google.maps.Map(document.getElementById("mapDiv2"), {
		  mapId: "ffcdd6091fa9fb03",
		  zoom: this.config.zoomLevel,
		  center: myLatLng,
		  maxZoom: 16,
		  minZoom: 3,
		  restriction: {
			latLngBounds: {north: 80, south: -80, west: -180, east: 180},
			strictBounds: true,
		  },
		  streetViewControl: false,
		  disableDefaultUI: true,
		});
		
		const map3 = new google.maps.Map(document.getElementById("mapDiv3"), {
		  mapId: "ffcdd6091fa9fb03",
		  zoom: this.config.zoomLevel,
		  center: myLatLng,
		  maxZoom: 16,
		  minZoom: 3,
		  restriction: {
			latLngBounds: {north: 80, south: -80, west: -180, east: 180},
			strictBounds: true,
		  },
		  streetViewControl: false,
		  disableDefaultUI: true,
		});

		//initialize the overlays and insert them in the specific maps
		const pollenMapTypeGrass = new PollenMapType(new google.maps.Size(256, 256),"Grass_UPI", this.config.googleApiKey);
		const pollenMapTypeTree = new PollenMapType(new google.maps.Size(256, 256),"Tree_UPI", this.config.googleApiKey);
		const pollenMapTypeWeed = new PollenMapType(new google.maps.Size(256, 256),"Weed_UPI", this.config.googleApiKey);
		map.overlayMapTypes.insertAt(0, pollenMapTypeGrass);
		map2.overlayMapTypes.insertAt(0, pollenMapTypeTree);
		map3.overlayMapTypes.insertAt(0, pollenMapTypeWeed);
		
		//gets the divs and hides two of them
		var divMap = document.getElementById('mapDiv');
		var divMap2 = document.getElementById('mapDiv2');
		var divMap3 = document.getElementById('mapDiv3');
		divMap.style.display = "none";
		divMap2.style.display = "none";
		divMap3.style.display = "block";
		

		//rotate between the three maps every "rotateInterval" seconds. Update the header to show which maps is being shown.
		var i = 1;
		var el = document.querySelector(".MMM-Pollen .module-header");
		el.innerHTML = this.getHeader() + " - " + this.translate("Grass");
		setInterval(() => 
		{		
			if (i === 1)
			{
				el.innerHTML = this.getHeader() + " - " + this.translate("Weed");
				divMap.style.display = "block";
				divMap2.style.display = "none";
				divMap3.style.display = "none";
			}
			else if (i === 2)
			{
				el.innerHTML = this.getHeader() + " - " + this.translate("Tree");
				divMap.style.display = "none";
				divMap2.style.display = "block";
				divMap3.style.display = "none";
			}
			else if (i === 3)
			{
				el.innerHTML = this.getHeader() + " - " + this.translate("Grass");
				divMap.style.display = "none";
				divMap2.style.display = "none";
				divMap3.style.display = "block";
			}
			
			//reset the counter
			if (i === 3)
				i=1;
			else
				i++;
			
        }, this.config.rotateInterval * 1000);
	},
	
	//gets a JS file and loads it
	getScript: function(source, callback) {
      var script = document.createElement('script');
      var prior = document.getElementsByTagName('script')[0];
      script.async = 1;
      prior.parentNode.insertBefore(script, prior);
  
      script.onload = script.onreadystatechange = function( _, isAbort ) {
          if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
              script.onload = script.onreadystatechange = null;
              script = undefined;
  
              if(!isAbort) { if(callback) callback(); }
          }
      };
  
      script.src = source;
    }
  
  });
 
