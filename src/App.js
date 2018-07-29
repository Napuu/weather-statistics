import React, { Component } from 'react';
import {MapContainer } from "./MyMapThings.js";
import {Fetch} from "./DataFetcher.js";
import './App.css';
//import {ReactBootstrapSlider} from "react-bootstrap-slider";
class App extends Component {
  render() {
    return (
      <div className="App">
        <MapContainer>
          </MapContainer>
      </div>
    );
  }
}

let fetcher = new Fetch();
function fetchSounding() {
    //console.log("fetch");
    //fetcher.fetchLatestSoundings().then((data) => {
        //console.log(data); 
    //});
}

export default App;
