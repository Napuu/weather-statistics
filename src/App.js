import React, { Component } from 'react';
import {Fetch} from "./DataFetcher.js";
import './App.css';
import Slider from 'rc-slider';
import {MapWithAMarker} from './MyMapThings.js';
import 'rc-slider/assets/index.css';
class App extends Component {
  render() {
    return (
        <div className="App">
            <LatestFMISoundingsWidget/>
        </div>
    );
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
           // for (let soundingPosIndex = 0; soundingPosIndex < data.length; soundingPosIndex++) {
                // altitudes.push({});
                // for (let i = 0; i < data[soundingPosIndex].length; i++) {
                    // let currentAltitude = Math.floor(data[soundingPosIndex][i].altitude);;
                    // altitudes[soundingPosIndex][currentAltitude] = "";
                // }
            // }  
            // console.log
            // console.log(data);
            // console.log(altitudes);
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
        // console.log(this.state.slider.marks);
    }
    render() {
        return(
            <div className="soundingContainer" >
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

                <Slider className="sliderThing" value={this.state.slider.value} marks={this.state.slider.marks} min={this.state.slider.min}  max={this.state.slider.max} step={null} onChange={this.handleSliderValueChange} />

                <InfoBox className={"infoBox"}
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
            <div className={"infoBox"}>
                Altitude: {this.props.altitude} m, 
                Wind speed: {this.props.windSpeed} m/s, 
                Wind direction: {this.props.windDirection} °, 
                Temperature: {this.props.airTemperature} °C, 
                Time: {(new Date(this.props.seconds * 1000)).toString()}
            </div>
        );
    }
}
export default App;
