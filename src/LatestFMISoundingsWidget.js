
import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import "./LatestFMISoundingsWidget.css";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";

/* to use this 'widget'
 * from npm install react-google-maps, react-xml-parser, recompose, rc-slider
 * in App.js or whatever import LatestFMISoundingsWidget.js , *.css and 
 * put <LatestFMISoundingsWidget/> somewhere, to change size, it has class named LatestFMISoundingsWidget
 */


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


var XMLParser = require('react-xml-parser');

class Fetch {
    fetchLatestSoundings() {
        let fetchPromise = new Promise((resolve, reject) => {
            fetch("http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::sounding::multipointcoverage&latest=true")
            .then((resp) => resp.text())
            .then(data => {
                let xml = new XMLParser().parseFromString(data);

                //allPositions is "4-dimensional list"
                //[pos1lat, pos1lng, pos1altitude, pos1seconds, ...]
                //[degrees, degrees, meters, seconds since 1970...]
                //
                //readings is "4-dimensional list"
                //[wind speed, wind direction1, air temperature1, dev point1, ...]
                //[m/s, degrees, celcius, celcius]
                //
                //readings and allPositions share indexing. readings[0-3] is from position allPositions[0-3], 4-7, 8-11 etc..
                //
                //importantPositions is "3-dimensional list"
                //[pos1lat, pos1lng, pos1meters, pos2lat, pos2lng, pos2meter...]
                //[deg, deg, meters,...]
                
                let allPositionsJSON = xml.getElementsByTagName("gmlcov:positions");
                let allPositionsGrouped = [];
                let allReadingsJSON = xml.getElementsByTagName("gml:doubleOrNilReasonTupleList");
                let allReadingsGrouped = [];
                let importantPositionsJSON = xml.getElementsByTagName('gml:posList');
                let importantPositionsGrouped = [];

                let importantData = [];
                for (let locationIndex = 0; locationIndex < allPositionsJSON.length; locationIndex++) {
                    let allPositionsCurrentLocation = allPositionsJSON[locationIndex].value.split(" ");
                    allPositionsCurrentLocation.pop();
                    allPositionsGrouped[locationIndex] = [];
                    while (allPositionsCurrentLocation.length > 0) {
                        let entry = {};
                        entry["latitude"] = allPositionsCurrentLocation.shift();
                        entry["longitude"] = allPositionsCurrentLocation.shift();
                        entry["altitude"] = allPositionsCurrentLocation.shift();
                        entry["seconds"] = allPositionsCurrentLocation.shift(); 
                        allPositionsGrouped[locationIndex].push(entry);
                    }
                    
                    let allReadingsCurrentLocation = allReadingsJSON[locationIndex].value.split(" ");
                    allReadingsCurrentLocation.pop();
                    allReadingsGrouped[locationIndex] = [];
                    while (allReadingsCurrentLocation.length > 0) {
                        let entry = {};
                        entry["windSpeed"] = allReadingsCurrentLocation.shift();
                        entry["windDirection"] = allReadingsCurrentLocation.shift();
                        entry["airTemperature"] = allReadingsCurrentLocation.shift();
                        entry["devPoint"] = allReadingsCurrentLocation.shift();
                        allReadingsGrouped[locationIndex].push(entry);
                    }

                    let importantPositionsCurrentLocation = importantPositionsJSON[locationIndex].value.split(" ");
                    importantPositionsCurrentLocation.pop();
                    importantPositionsGrouped[locationIndex] = [];
                    while (importantPositionsCurrentLocation.length > 0) {
                        let entry = {};
                        entry["latitude"] = importantPositionsCurrentLocation.shift();
                        entry["longitude"] = importantPositionsCurrentLocation.shift();
                        entry["altitude"] = importantPositionsCurrentLocation.shift();
                        importantPositionsGrouped[locationIndex].push(entry);
                    }

                    importantData[locationIndex] = [];
                    while (importantPositionsGrouped[locationIndex].length) {
                        let currentImportantPosition = importantPositionsGrouped[locationIndex].shift();
                        while (1) {
                            let currentCandidatePosition = allPositionsGrouped[locationIndex].shift();
                            let currentCandidateReading = allReadingsGrouped[locationIndex].shift();
                            if (currentCandidatePosition["latitude"] === currentImportantPosition["latitude"]
                                && currentCandidatePosition["longitude"] === currentImportantPosition["longitude"]
                                && currentCandidatePosition["altitude"] === currentImportantPosition["altitude"]) {
                                let addable = Object.assign(currentCandidatePosition, currentCandidateReading);
                                importantData[locationIndex].push(addable);
                                break;
                            }
                        }
                    }
                }
                // console.log(importantData);

                let launchLocations = xml.getElementsByTagName("target:region").map(launchLocation => launchLocation.value);

                //return importantData;
                resolve({soundingsData: importantData, launchLocations: launchLocations});

            })
            .catch((err) => {
                console.log("ERR: " + err);
                reject("ERR: " + err);
            });
        });
        return fetchPromise;
    }

}

class LatestFMISoundingsWidget extends Component {
    constructor(props) {
        super(props);
        this.handleLocationSelectorValueChange = this.handleLocationSelectorValueChange.bind(this);
        this.handleSliderValueChange = this.handleSliderValueChange.bind(this);
        this.state = {
            map: {
                markerLatitude: parseFloat(0),
                markerLongitude: parseFloat(0),
                markerVisible: false
            },
            infoBox: {
                dataReady: false,
                windSpeed: "",
                windDirection: "",
                altitude: "",
                airTemperature: "",
                seconds: ""
            },
            slider: {
                max: 0,
                min: 0,
                value: 0,
                marks: {}
                
            },
            global: {
                launchLocations: [],
                observationAltitudes: [],
                soundingsData: []
            }

            //64.491998, 25.976914
        };
    }
    componentDidMount() {
        let fetcher = new Fetch();
        fetcher.fetchLatestSoundings().then((data) => {
            let altitudes = [];
            for (let launchLocationIndex = 0; launchLocationIndex < data.soundingsData.length; launchLocationIndex++) {
                altitudes.push({});
                for (let observationIndex = 0; observationIndex < data.soundingsData[launchLocationIndex].length; observationIndex++) {
                    let currentObservationAltitude = Math.floor(data.soundingsData[launchLocationIndex][observationIndex].altitude);
                    altitudes[launchLocationIndex][currentObservationAltitude] = "";
                }
            }
            this.setState(prevState => ({
                global: {
                    ...prevState.global,
                    "launchLocations": data.launchLocations,
                    "soundingsData": data.soundingsData
                },
                slider: {
                    ...prevState.slider, 
                    "marksReadyObservationAltitudes": altitudes,
                }
            }));
            this.initializeWithLaunchLocationIndex(0);
        });
    }
    handleSliderValueChange(val) {
        let index = this.state.global.launchLocationIndex;
        let currentLaunchLocationObservations = this.state.global.soundingsData[index];
        //there is no dict for altitudes so gotta find out the correct one this way ":D"
        let currentObservation = {};
        for (let i = 0; i < currentLaunchLocationObservations.length; i++) {
            if (Math.floor(currentLaunchLocationObservations[i].altitude) === val) {
                currentObservation = currentLaunchLocationObservations[i];
                break;
            }
        }
        this.updateInfoBox(currentObservation);
        this.setState(prevState => ({
            slider: {
                ...prevState.slider,
                "value": val 
            },
            map: {
                ...prevState.map,
                markerLatitude: parseFloat(currentObservation.latitude),
                markerLongitude: parseFloat(currentObservation.longitude)
            }
        })); 
    }
    updateInfoBox(currentObservation) {
        this.setState(prevState => ({
            infoBox: {
                ...prevState.infoBox,
                "dataReady": true,
                "windSpeed": currentObservation.windSpeed,
                "windDirection": currentObservation.windDirection,
                "airTemperature": currentObservation.airTemperature,
                "altitude": currentObservation.altitude,
                "seconds": parseInt(currentObservation.seconds, 10)
            }
        }));
    }
    handleLocationSelectorValueChange(event) {
        this.initializeWithLaunchLocationIndex(event.target.value); 
    }
    initializeWithLaunchLocationIndex(index) {
        let altitudes = Object.keys(this.state.slider.marksReadyObservationAltitudes[index]);
        let min = parseFloat(altitudes[0]);
        let max = parseFloat(altitudes[altitudes.length - 1]);
        let lat = parseFloat(this.state.global.soundingsData[index][0].latitude);
        let lng = parseFloat(this.state.global.soundingsData[index][0].longitude);
        this.setState(prevState => ({
            slider: {
                ...prevState.slider,
                "value": 0,
                "marks": this.state.slider.marksReadyObservationAltitudes[index],
                "min": min,
                "max": max
            },
            map: {
                ...prevState.marker,
                markerVisible: true,
                markerLatitude: lat,
                markerLongitude: lng
            },
            global: {
                ...prevState.global,
                launchLocationIndex: index
            }
        })); 
    }
    handleTouchMove(ev) {
        ev.preventDefault();
    }
    render() {
        return(
            <div className="LatestFMISoundingsWidget soundingContainer" >
                <MapWithAMarker
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBej9fCwuETi14G6kfLYbQVo-WNahaskqI&v=3.exp"
                    markerLatitude={this.state.map.markerLatitude}
                    markerLongitude={this.state.map.markerLongitude}
                    markerVisible={this.state.map.markerVisible}
                    loadingElement={<div style={{ height: '100%'}} />}
                    containerElement={<div style={{ height: "400px"}} /> }
                    mapElement={<div style={{height: '100%'}}/>}
                /> 
                
                <SoundingLaunchLocationSelector onChange={this.handleLocationSelectorValueChange} launchLocations={this.state.global.launchLocations} />

                <Slider className="sliderThing12342" value={this.state.slider.value} marks={this.state.slider.marks} min={this.state.slider.min}  max={this.state.slider.max} step={null} onChange={this.handleSliderValueChange} />

                <InfoBox className={"infoBox12342"}
                        dataReady={this.state.infoBox.dataReady} 
                        windSpeed={this.state.infoBox.windSpeed} 
                        windDirection={this.state.infoBox.windDirection} 
                        altitude={this.state.infoBox.altitude} 
                        airTemperature={this.state.infoBox.airTemperature} 
                        seconds={this.state.infoBox.seconds}/>

            </div>

        );
    }
}

class SoundingLaunchLocationSelector extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);  
    }
    onChange(ev) {
        this.props.onChange(ev);
    }
    render() {
        let elements = [];
        this.props.launchLocations.map((location, i) => elements.push(<option key={i} value={i}>{location}</option>));
        return(
            <div>
                {"Launch location: "}
                <select onChange={this.onChange}>
                    {elements}
                </select>
            </div>
        );
    }

}

class InfoBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            windSpeed: props.windSpeed,
            windDirection: props.windDirection,
            altitude: props.altitude,
            airTemperature: props.airTemperature,
            seconds: props.seconds,
            dataReady: props.dataReady
        };
    }
    render() {
        if (!this.props.dataReady) return "not ready yet";
        return(
            <div className={"infoBox12342"}>
                Altitude: {this.props.altitude} m, 
                Wind speed: {this.props.windSpeed} m/s, 
                Wind direction: {this.props.windDirection} °, 
                Temperature: {this.props.airTemperature} °C, 
                Time: {(new Date(this.props.seconds * 1000)).toString()}
            </div>
        );
    }
}
export default LatestFMISoundingsWidget;

