// OpenLayers hit-test demo: no reprojection
// Base layer and layer for hit-test are both in EPSG:26986


szServerRoot = location.protocol + '//' + location.hostname;
if (location.hostname.includes('appsrvr3')) {   
    szServerRoot += ':8080/geoserver/';    
} else {
    szServerRoot += '/maploc/';    
}
szWMSserverRoot = szServerRoot + '/wms'; 
szWFSserverRoot = szServerRoot + '/wfs'; 

// Set up OpenLayers Map Projection (MA State Plane NAD83, meters)
// FYI - This can be done more simply via the inclusion of proj4.js,
//       and the relevant projection file.
//       Leaving this code as-is, though, since this demo was cooked
//       up very quickly from pieces of existing code.
var projection = new ol.proj.Projection({
	code: 'EPSG:26986',
	extent: [33861.26,777514.31,330846.09,959747.44],
	units: 'm'
});
ol.proj.addProjection(projection);
var MaStatePlane = '+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
ol.proj.addCoordinateTransforms(
	'EPSG:4326',
	projection,
	function(coordinate){
		var WGS_to_MAState = proj4(MaStatePlane).forward(coordinate);
		return WGS_to_MAState;
	},
	function(coordinate){
		var MAState_to_WGS = proj4(MaStatePlane).inverse(coordinate);
		return MAState_to_WGS;
	}
);


var ol_map = null;

function onClick_handler(e) {
    // The parameter 'e' is the JS event object passed in by the browser 
    var IDENTIFY_TOLERANCE = 200;
    
    console.log('map clicked at pixel location: ' + e.pixel);
    console.log('map clicked at coordinate location: ' + e.coordinate);

    var sUrl = szWFSserverRoot + '?';
    sUrl += "service=wfs&version=1.0.0";
    sUrl += "&request=getfeature";
    sUrl += "&typename=ctps_pg:ctps_pnr_station_points"; 
    sUrl += '&outputformat=json';
    sUrl += "&bbox=";
    
    // Lower left coordinate of bounding box
    var oLowerLeft = [];
    oLowerLeft[0] = e.coordinate[0] + (-1 * IDENTIFY_TOLERANCE);
    oLowerLeft[1] = e.coordinate[1] + (-1 * IDENTIFY_TOLERANCE);

    // Upper right coordinate of bounding box
    var oUpperRight = [];
    oUpperRight[0] = e.coordinate[0] + IDENTIFY_TOLERANCE;
    oUpperRight[1] = e.coordinate[1] + IDENTIFY_TOLERANCE;
    
    sUrl += oLowerLeft[0] + ',' + oLowerLeft[1] + ',';
    sUrl += oUpperRight[0] + "," + oUpperRight[1];    
   

    $.ajax({ url	: sUrl,
         type		: 'GET',
         dataType	: 'json',
         success	: 	function (data, textStatus, jqXHR) {	
                            var reader, aFeatures = [], props = {};
                            reader = new ol.format.GeoJSON();
                            aFeatures = reader.readFeatures(jqXHR.responseText);
                            if (aFeatures.length === 0) {
                                alert('WFS BBOX query returned no features.');
                                return;
                            } else if (aFeatures.length > 1) {
                                // TBD: Have to figure out what to do in this case...
                                //      Right now, just fall through to report on aFeatures[0]...
                                console.log('WFS BBOX query returned > 1 feature.');
                            }
                            props = aFeatures[0].getProperties();
                            console.log('You clicked on ' + props['stan_addr'] + '.');
                            // blah, blah, blah
                        }, // end of 'success' handler
        error       :   function (qXHR, textStatus, errorThrown ) {
                            alert('WFS BBOX query.\n' +
                                    'Status: ' + textStatus + '\n' +
                                    'Error:  ' + errorThrown);
                        } // end of error handler
    });  // End of WFS BBOX query                              
                                
} // onClick_hander()


function initialize() { 
    var towns_polym_layer =
         new ol.layer.Tile({ source: new ol.source.TileWMS({ url		:  szWMSserverRoot,
                                                             params	    : { 'layers': [	'ctps_pg:mgis_towns_polym' ],
                                                                            'styles': [	'a_polygon' ]
                                                                          }
                                                         })
                         });   

    var station_points = 
        new ol.layer.Tile({ source: new ol.source.TileWMS({ url		:  szWMSserverRoot,
                                                            params	: { 'layers': [	'ctps_pg:ctps_pnr_station_points' ],
                                                                        'styles': [	'a_point' ]
                                                                      }
                                                         })
                         });
      
    
    // The ol_map object is global (not local to this function)
    ol_map = new ol.Map({ layers: [ towns_polym_layer, 
                                    station_points
                                  ],
                          target: 'map',                             
                          view:   new ol.View({ projection  : projection,
                                                center      : [232908.27147578463, 902215.0940791398],
                                                zoom: 5 }),
                          // The following actually suppresses zooming on single-clicks
                          interactions: ol.interaction.defaults({doubleClickZoom: false})
                       });
    
    // Register on-click event hanlder for map
	ol_map.on('click', onClick_handler)
} // initialize()