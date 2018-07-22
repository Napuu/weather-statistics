import React, {Component} from 'react';
import {withProps} from 'recompose';
import ReactBootstrapSlider from 'react-bootstrap-slider';
class ControlsContainer extends Component {
    render() {
        return (
            <div className={"controlsContainer"}>
                {this.props.children} 
            </div> 
        );
    }
}
const Slider2 = withProps({"ticks":[1,2,3,4]})(ReactBootstrapSlider);
class Slider extends ReactBootstrapSlider{ 
    constructor(props) {
        super(props);
        this.state = {
            currentValue: 0
        }
    }
    change(val) {
        console.log(val.target.value);
        console.log("value changed" + this.currentValue);
    }
}
// const Slider = "";
export {
    ControlsContainer,
    Slider,
    Slider2
}
