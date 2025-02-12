<h1>MMM-GPollen</h1>
<h3>Overview</h3>
This module has two options: either it can display a table with the pollen forecast for a number of days in your area or it can display a google maps map with a colored overlay.
It uses the google API to retrieve this information. Not all countries/regions are supported (but most are). See <a href="https://developers.google.com/maps/documentation/pollen/coverage?hl=en">this</a> list for an overview of the supported countries.

<img src="https://github.com/martijndoes/Screenshots/blob/main/Pollen-map.png" />
map mode

<img src="https://github.com/martijndoes/Screenshots/blob/main/Pollen-table.png" />
table mode


<h3>Prerequisites</h3>
Go to https://console.cloud.google.com/google/maps-apis/start and use your google account to request an API key.
You can get 200$ a month of free API calls with a billing account and that should be more than enough to use this component.
Make sure you set quotas and set up notifications so you will never be charged. I cannot be held accountable if you set anything up incorrectly and go over your free credits.

Under APIs & Services make sure Pollen API and Maps JavaScript API (last one only needed if you enable map view in this component) are enabled



<h3>Installation</h3>
Go to your modules folder 
Execute the following command:
git clone https://github.com/martijndoes/MMM-GPollen

Alter your config.js (see next chapter) to display the module


<h3>Configuration</h3>

<table>
  <tr>
    <th>Key</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>mode</td>
    <td>table</td>
    <td>REQUIRED. Can be one of either two values: table or map. Table will display a table with the forecast for x number of days. Map will display a google map with colored overlay showing you were the high concentrations of pollen are.</td>
  </tr>
  <tr>
    <td>googleApiKey</td>
    <td>[YOURAPIKEY]</td>
    <td>REQUIRED. Your google API key (see prerequisites).</td>
  </tr>
  <tr>
    <td>longitude</td>
    <td>52.3108558</td>
    <td>REQUIRED. The longitude of the location that you want to retrieve the information for.</td>
  </tr>
  <tr>
    <td>latitude</td>
    <td>4.950632</td>
    <td>REQUIRED. The latitude of the location that you want to retrieve the information for.</td>
  </tr>
  <tr>
    <td>language</td>
    <td>en</td>
    <td>The language in which it will be displayed. Some of the labels are translated by google (for example the pollen types), others are translated by the module. At the moment this module supports english, dutch, german, french and spanish. This setting will translate the labels that are retrieved from google, for the other translations it will use the main language setting in your config.</td>
  </tr>
  <tr>
    <td>updateInterval</td>
    <td>60</td>
    <td>In minutes. Amount of minutes between refreshing the data. Do not set this value too low, it doesn't add much value and it will greatly increase the number of API calls being made to your account</td>
  </tr>
  <tr>
    <td>days</td>
    <td>3</td>
    <td>Number between 1 and 5. If the module is in table display mode this decides the number of days of forecase that are being displayed.</td>
  </tr>
  <tr>
    <td>zoomLevel</td>
    <td>9</td>
    <td>If module is set to "map" mode this will decide how much the map is zoomed in. Value can be between 1 and 13, where 1 will be the most zoomed out (will display entire continent) and 13 (will display a small city)</td>
  </tr>
  <tr>
    <td>rotateInterval</td>
    <td>10</td>
    <td>In seconds. If module is set to "map" mode it will alternate between the three pollen types. This decides the number of seconds between each alternation. Changing this value will NOT affect the number of API calls being made.</td>
  </tr>
</table>


<h3>Example config</h3>

Here is an example config for the map display:<br />
{<br />
&emsp;  module: 'MMM-GPollen',<br />
&emsp;  header: 'Pollen',<br />
&emsp;  position: 'top_right',<br />
&emsp;  config: {<br />
&emsp;&emsp;    mode: 'table',<br />
&emsp;&emsp;    googleApiKey: 'MYGOOGLEAPIKEY',<br />
&emsp;&emsp;    longitude: 4.95,<br />
&emsp;&emsp;    latitude: 52.31,<br />
&emsp;&emsp;    days: 3,<br />
&emsp;&emsp;    language: 'nl'<br />
&emsp;  }<br />
}<br />
<br />
<br />
And an example for the map display:<br />
{<br />
&emsp;  module: 'MMM-GPollen',<br />
&emsp;  header: 'Pollen',<br />
&emsp;  position: 'top_right',<br />
&emsp;  config: {<br />
&emsp;&emsp;	  mode: 'map',<br />
&emsp;&emsp;	  zoomLevel: 9,<br />
&emsp;&emsp;    googleApiKey: 'MYGOOGLEAPIKEY',<br />
&emsp;&emsp;    longitude: 4.95,<br />
&emsp;&emsp;    latitude: 52.31,<br />
&emsp;&emsp;    language: 'nl'<br />
&emsp;  }<br />
}<br />
