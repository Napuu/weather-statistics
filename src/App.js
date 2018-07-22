import React, { Component } from 'react';
import logo from './logo.svg';
import { ControlsContainer, Slider, Slider2 } from "./MyControls.js";
import {MapWithAMarker } from "./MyMapThings.js";
import './App.css';
class App extends Component {
  render() {
    return (
      <div className="App">
        <ControlsContainer>
            <Slider2/>
            <Slider 
                  ticks = {[0, 100, 200, 300, 400]}
                  ticks_labels = {["$0", "$100", "$200", "$300", "$400"]}
                  ticks_snap_bounds = {10 }
            />
        </ControlsContainer>
        <MapWithAMarker
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBej9fCwuETi14G6kfLYbQVo-WNahaskqI&v=3.exp"
            loadingElement={<div style={{ height: '100%'}} />}
            containerElement={<div style={{ height: "400px"}} /> }
            mapElement={<div style={{height: '100%'}}/>}
        />
      </div>
    );
  }
}


export default App;
