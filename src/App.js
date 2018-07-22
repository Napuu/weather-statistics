import React, { Component } from 'react';
import logo from './logo.svg';
import { ControlsContainer, Slider } from "./MyControls.js";
import './App.css';
import ReactBootstrapSlider from 'react-bootstrap-slider';
const testDict = {
    var1: "moi",
    var2: "he"
};
function test(dict) {
   return dict.var1 + dict.var2; 
}
class App extends Component {
  render() {
    return (
      <div className="App">
        moi {test(testDict)}
        <ControlsContainer>
            <Slider 
                  ticks = {[0, 100, 200, 300, 400]}
                  ticks_labels = {["$0", "$100", "$200", "$300", "$400"]}
                  ticks_snap_bounds = { 100 }
            />
        </ControlsContainer>
      </div>
    );
  }
}


function MySlider(props) {

}
export default App;
