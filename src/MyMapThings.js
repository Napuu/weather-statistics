import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
// this is almost exact copy from https://tomchentw.github.io/react-google-maps/#usage--configuration
// altered only a little bit
const MapWithAMarker = withScriptjs(withGoogleMap(props =>
    <GoogleMap
        defaultZoom={4}
        defaultCenter={{ lat: 64.5, lng: 26}}
    >
        <Marker visible={props.markerVisible} position={{ lat: props.markerLatitude, lng: props.markerLongitude }}>
        </Marker>
    </GoogleMap>
));

export {
    MapWithAMarker
}
