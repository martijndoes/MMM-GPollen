Module.register("MMM-Pollen", {
    // Default module config.
    defaults: {
		  mode: "table",						//table will display simple table. Map will display google maps with overlay
          googleApiKey: "[YOURAPIKEY]",			//your google api key
		  zoomLevel: 9,							//will control the zoomlevel if mode = map
          longitude: 52.3108558,
          latitude: 4.950632,
          language: "nl",
          days: 1,                              //changing this does not have any affect at the moment
          updateInterval: 60,					//in minutes. How often will it retrieve new info from the API.
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
			'MMM-Pollen.css'
		]
	},
	

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
		if(this.config.mode === "map")
		{
			var wrapper = document.createElement("div");
			var script = document.createElement("script");
			var src = document.createAttribute("src");
			var key = this.config.googleApiKey
			//thanks to https://forum.magicmirror.builders/topic/716/can-t-load-script-correctly/2 @ianperrin for this solution!
			this.getScript('https://www.google.com/jsapi', function() { 
				google.load('maps', '3', { other_params: 'key=' + key, callback: function() {
					self.initMap();
				}});
			});

			
			var map = document.createElement("div");
			var id = document.createAttribute("id");
			id.value = "map";
			map.setAttributeNode(id);
			
			wrapper.appendChild(script);
			wrapper.appendChild(map);
		}
		else if (this.config.mode === "table")
		{
			var api_url = this.constructUrl();
			var dataTable = await this.getData(api_url);
			var wrapper = document.createElement("div");
			wrapper.appendChild(dataTable);
		}
 
		

      return wrapper;
    },
	
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
    },

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
            var el = json.dailyInfo[0].pollenTypeInfo;
            var len = el.length;
            for (var i = 0; i < len; i++)
            {
                var entry = json.dailyInfo[0].pollenTypeInfo[i];
                var row = document.createElement("tr");
                var descCell = document.createElement("td");
                descCell.innerHTML = entry.displayName;
                row.appendChild(descCell);
                var valCell = document.createElement("td");
                if (entry.indexInfo != null)
                    valCell.innerHTML = entry.indexInfo.category;
                else
                    valCell.innerHTML = this.translate("None");
                
                row.appendChild(valCell);
                table.appendChild(row);
            }
            return table;
        } catch (error) {
            Log.error(error.message);
            console.error(error.message);
        }
    },
	
	
	initMap: function() 
	{
		const myLatLng = { lat: this.config.latitude, lng: this.config.longitude };

		const map = new google.maps.Map(document.getElementById("map"), {
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

		const pollenMapTypeGrass = new PollenMapType(new google.maps.Size(256, 256),"Grass_UPI");
		const pollenMapTypeTree = new PollenMapType(new google.maps.Size(256, 256),"Tree_UPI");
		const pollenMapTypeweed = new PollenMapType(new google.maps.Size(256, 256),"Weed_UPI");
		
		map.overlayMapTypes.insertAt(0, pollenMapTypeGrass);
		var i = 1;
		var el = document.querySelector(".MMM-Pollen .module-header");
		el.innerHTML = this.getHeader() + " - " + this.translate("Grass");
		setInterval(() => 
		{
			//first remove the existing overlay
			map.overlayMapTypes.setAt( 0, null);
			
			//add an overlay
			if (i === 1)
			{
				map.overlayMapTypes.insertAt(0, pollenMapTypeweed); 
				el.innerHTML = this.getHeader() + " - " + this.translate("Weed");
			}
			else if (i === 2)
			{
				map.overlayMapTypes.insertAt(0, pollenMapTypeTree);
				el.innerHTML = this.getHeader() + " - " + this.translate("Tree");
			}
			else if (i === 3)
			{
				map.overlayMapTypes.insertAt(0, pollenMapTypeGrass);
				el.innerHTML = this.getHeader() + " - " + this.translate("Grass");
			}
			
			//reset the counter
			if (i === 3)
				i=1;
			else
				i++;
			
        }, this.config.rotateInterval * 1000);
		
    
	},
	
  
  
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
    }
  
  });
 
 
 
class PollenMapType 
{
	tileSize;
	pollen;
	alt = null;
	maxZoom = 16;
	minZoom = 3;
	name = null;
	projection = null;
	radius = 6378137;
	constructor(tileSize, pollen) {
	  this.tileSize = tileSize;
	  this.pollen = pollen;
	}

	getTile(coord, zoom, ownerDocument) 
	{
		const img = ownerDocument.createElement("img");
		const mapType = this.pollen;
		const normalizedCoord = getNormalizedCoord(coord, zoom);

		const x = coord.x;
		const y = coord.y;
		const key = "AIzaSyC7QCsLEbnnxzrWCpkAqyoQ31AjThf6c0o";
		img.style.opacity = 0.8;
		img.src = `https://pollen.googleapis.com/v1/mapTypes/${mapType}/heatmapTiles/${zoom}/${x}/${y}?key=${key}`;
		return img;
	}
	releaseTile(tile) {}
}
  

  
function getNormalizedCoord(coord, zoom) 
{
	const y = coord.y;
	let x = coord.x;
	// Define the tile range in one direction. The range is dependent on zoom level:
	// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc.
	const tileRange = 1 << zoom;
	// don't repeat across y-axis (vertically)
	if (y < 0 || y >= tileRange) {
	  return null;
	}

	// repeat across x-axis
	if (x < 0 || x >= tileRange) {
		x = ((x % tileRange) + tileRange) % tileRange;
	}
	return { x: x, y: y };
}
  
