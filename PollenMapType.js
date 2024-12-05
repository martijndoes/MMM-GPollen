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
	constructor(tileSize, pollen, apikey) {
	  this.tileSize = tileSize;
	  this.pollen = pollen;
	  this.apikey = apikey;
	}

	getTile(coord, zoom, ownerDocument) 
	{
		const img = ownerDocument.createElement("img");
		const mapType = this.pollen;
		const normalizedCoord = getNormalizedCoord(coord, zoom);

		const x = coord.x;
		const y = coord.y;
		const key = this.apikey;
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
  
