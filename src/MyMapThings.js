import React,{ Component }from 'react';
import {Fetch} from "./DataFetcher.js";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
    withScriptjs,
    withGoogleMap,
    GoogleMap,
    Marker
} from "react-google-maps";

class SoundingValues extends Component {
    render() {
        let index = this.props.currentSoundingIndex;
        let soundingsData = this.props.soundingsData[0];
        if (soundingsData === undefined) return "not ready yet";
        return (
            <div className="soundingsData" > 
                Altitude: {soundingsData[index].altitude}m, 
                Temperature: {soundingsData[index].airTemperature} °C,
                Wind speed: {soundingsData[index].windSpeed} m/s, 
                Wind direction: {soundingsData[index].windDirection}°
            </div>);
        
        //return (<div> +
            //"Altitude: " + soundingsData[index].altitude +
            //" m, Temperature: " + soundingsData[index].airTemperature +
            //" °C, Wind speed: " + soundingsData[index].windSpeed +
            //" m/s, Wind direction: " + soundingsData[index].windDirection +
            //"°"</div>);
    }
}
const MapWithAMarker = withScriptjs(withGoogleMap(props =>
    <GoogleMap
        defaultZoom={6}
        defaultCenter={{ lat: 61.805230, lng: 24.988423}}
    >
        <Marker visible={props.markerVisible} position={{ lat: props.markerLat, lng: props.markerLng }}>
        </Marker>
    </GoogleMap>
));

class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.fetcher = new Fetch();
        this.state = {
            ticks: {},
            min: -500,
            max: 40000,
            markerLat: 61.4,
            markerLng: 23,
            soundingsData: [],
            currentSoundingIndex: 0,
            currentSoundingPositionIndex: 0,
            markerVisible: false,
            sliderValue: 0
        };
    }
    componentDidMount() {
        console.log("mounted");

        let altitudes = {};
        this.fetcher.fetchLatestSoundings().then((data) => { 
            for (let i = 0; i < data[0].length; i++) {
                let currentAltitude = Math.floor(data[0][i].altitude);;
                altitudes[currentAltitude] = "";
            }

            console.log(this.state);
            //console.log(data[this.
            this.setState({
                ticks: altitudes,
                markerLat: parseFloat(data[this.state.currentSoundingPositionIndex][0].latitude),
                markerLng: parseFloat(data[this.state.currentSoundingPositionIndex][0].longitude),
                markerVisible: true,
                soundingsData: data,
                max: (Math.floor(data[0][data[0].length - 1].altitude) + 500)
            });
        });

    }
    handleChange(currentSliderValue) {
        let that = this.that;
        console.log(currentSliderValue);
        console.log(this.that);
        console.log(this);
        let currentSounding, currentSoundingIndex;
        for (let i = 0; i < that.state.soundingsData[0].length; i++) {
            if (Math.floor(that.state.soundingsData[0][i].altitude) == currentSliderValue) {
                currentSounding = (that.state.soundingsData[0][i]);
                currentSoundingIndex = i; 
                break;
            }
        }
        console.log(currentSounding.latitude);
        console.log(currentSounding.longitude);
        console.log(currentSounding.airTemperature);
        that.setState({
            markerLat: parseFloat(currentSounding.latitude),
            markerLng: parseFloat(currentSounding.longitude),
            markerVisible: true,
            sliderValue: currentSliderValue,
            currentSoundingIndex: currentSoundingIndex
        });
    }
    render() {
        return ( 
            <div className={"mapContainer"}>
                <MapWithAMarker
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBej9fCwuETi14G6kfLYbQVo-WNahaskqI&v=3.exp"
                    markerLat={this.state.markerLat}
                    markerLng={this.state.markerLng}
                    markerVisible={this.state.markerVisible}
                    loadingElement={<div style={{ height: '100%'}} />}
                    containerElement={<div style={{ height: "400px"}} /> }
                    mapElement={<div style={{height: '100%'}}/>}
                    
                />
                <Slider value={this.state.sliderValue} marks={this.state.ticks} that={this} min={this.state.min}  max={this.state.max} step={null} onChange={this.handleChange} />
                <SoundingValues soundingsData={this.state.soundingsData} currentSoundingIndex={this.state.currentSoundingIndex}/>
            </div> 
        );
    }
}

export {
    MapContainer,
    MapWithAMarker
}
// <MapWithAMarker
  // googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
  // loadingElement={<div style={{ height: `100%` }} />}
  // containerElement={<div style={{ height: `400px` }} />}
  // mapElement={<div style={{ height: `100%` }} />}
// />
