import React, {Component} from 'react';
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
class Slider extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    changeValue(val) {
        console.log(val.target.value);
        console.log("value changed" + this.currentValue);
    }
    render () {
        return (
            <ReactBootstrapSlider
                ticks = {this.props.ticks}
                ticks_labels = {this.props.ticks_labels}
                ticks_snap_bounds = { this.props.ticks_snap_bounds}
                slideStop={this.changeValue}
            />
        );
    }
}
export {
    ControlsContainer,
    Slider
}
