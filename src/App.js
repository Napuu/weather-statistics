import React, { Component } from 'react';
import logo from './logo.svg';
import { ControlsContainer, Slider, Slider2, Slider3 } from "./MyControls.js";
import {MapWithAMarker } from "./MyMapThings.js";
import {Fetch} from "./DataFetcher.js";
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ControlsContainer>
            <Slider 
                  ticks = {[0, 100, 200, 300, 400]}
                  ticks_labels = {["$0", "$100", "$200", "$300", "$400"]}
                  ticks_snap_bounds = {10 }
            />
            <Slider2/>
        </ControlsContainer>
        <MapWithAMarker
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBej9fCwuETi14G6kfLYbQVo-WNahaskqI&v=3.exp"
            loadingElement={<div style={{ height: '100%'}} />}
            containerElement={<div style={{ height: "400px"}} /> }
            mapElement={<div style={{height: '100%'}}/>}
        />
        <button onClick={fetchSounding}>
            Fetch :-)
          </button>

        <Slider
            isSounding = {true}
        />
      </div>
    );
  }
}

let fetcher = new Fetch();
function fetchSounding() {
    console.log("fetch");
    console.log(fetcher.fetch());
}

export default App;
