# openlayers-hit-test-demo

This is a demo of using the OpenLayers library to perform a WFS GetFeatures request using the "bbbox" (boudning box) parameter to perform a "hit-test" for clicks on a web map against an underlying WFS layer. This demo does __not__ involve reprojection from the SRS of the map to the SRS of the underlying feature layer: both are in the same SRS, in this case, EPSG:26986.

This demo depends upon the following external library:
* OpenLayers vesrion 6.1.0
