import React, {Component} from 'react';
//import ReactBootstrapSlider from 'react-bootstrap-slider';
import {Fetch} from "./DataFetcher.js";
class ControlsContainer extends Component {
    render() {
        return (
            <div className={"controlsContainer"}>
                {this.props.children} 
            </div> 
        );
    }
}
class Slider extends React.Component { 
    constructor(props) {
        super(props); 

        this.state = {
            ticks: [0, 3],
            ticks_labels: [0, 3],
            ticks_snap_bounds: 1,
            soundingIndex: 0,
            val: 4000
        }
        this.soundings();
            //ticks = {[0, 100, 200, 300, 400]}
          //ticks_labels = {["$0", "$100", "$200", "$300", "$400"]}
          //ticks_snap_bounds = {10 }

    }
    soundings() {
        let myFetch = new Fetch();
        console.log("fetching");
        myFetch.fetchLatestSoundings().then((data) => {
            let altitudes = [];
            for (let i = 0; i < data[0].length; i++) {
                altitudes.push(Math.floor(data[0][i].altitude));;
            }
            console.log(altitudes);
            //this.setState({ticks: altitudes, ticks_labels: altitudes});
            
            console.log("state below");
            this.setState({val: 15000});
            //return <ReactBootstrapSlider value={0} ticks={altitudes}/>;
        });
    }
            

    componentDidMount() {
        console.log("mounting");
    }
    change(val) {
        console.log(val.target.value);
        console.log("value changed" + this.currentValue);
    }
    render() {
        return "M";
    }

}
// const Slider = "";
export {
    ControlsContainer,
    Slider,
}
