Module.register("MMM-Pollen", {
    // Default module config.
    defaults: {
          googleApiKey: "[YOURAPIKEY]",
          longitude: "52.3108558",
          latitude: "4.950632",
          language: "nl",
          days: 1,                              //changing this does not have any affect at the moment
          updateInterval: 60
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


  
  
    start: function()
    {
        setInterval(() => {
            this.updateDom();
        }, this.config.updateInterval * 60 * 1000);
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
                    valCell.innerHTML = this.translate("Unknown");
                
                row.appendChild(valCell);
                table.appendChild(row);
            }
            return table;
        } catch (error) {
            Log.error(error.message);
            console.error(error.message);
        }
    },
  
  
    // Override dom generator.
    getDom: async function ()
    {
      var api_url = this.constructUrl();
      var dataTable = await this.getData(api_url);
      var wrapper = document.createElement("div");
      wrapper.appendChild(dataTable);
      return wrapper;
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