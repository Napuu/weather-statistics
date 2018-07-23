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
const Slider2 = withProps({"value": 1,"ticks":[1,2,3,5]})(ReactBootstrapSlider);
class Slider3 extends ReactBootstrapSlider {
    
}
class Slider extends React.Component { 
    change(val) {
        console.log(val.target.value);
        console.log("value changed" + this.currentValue);
    }
    render() {
        return <ReactBootstrapSlider value={0} {...this.props} />
    }

}
// const Slider = "";
export {
    ControlsContainer,
    Slider,
    Slider2,
    Slider3
}
