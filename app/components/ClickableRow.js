'use strict'

import React,{Component,PropTypes} from 'react';

import {View,Animated} from 'react-native';
import TouchFeedback from './TouchFeedback.js';

export default class ClickableRow extends Component {
  static contextTypes = {
    navigator:React.PropTypes.object
  }
  constructor(props){
    super(props);
    this.state = {pressed:new Animated.Value(0)};
  }
  _onShown(v){
    // console.warn('onshown');
    // this.setState({pressed:false});
    Animated.timing(
     this.state.pressed,
     {
       toValue: v,
       duration:200,
     }
   ).start();
  }
  _bindEvent(){
    var navigator = this.context.navigator;
    // console.warn('navigator',navigator);
    if (navigator) {
      var callback = (event) => {
        // console.warn('route',event.data.route,this.props.currentRouteId);
        if(!event.data.route || !event.data.route.id || event.data.route.id === 'main'|| (event.data.route.id === this.props.currentRouteId)){
          this._onShown(0);
        }
      };
      // Observe focus change events from the owner.
      this._listener= navigator.navigationContext.addListener('didfocus', callback);

    }
  }
  componentDidMount() {
    if(this.props.enable){
      this._bindEvent();
    }
  }
  componentWillUnmount() {
    this._listener && this._listener.remove();
  }
  render () {

    var color = this.state.pressed.interpolate({
       inputRange: [0, 1],
       outputRange: ['white', 'lightgray']
   });
  // var color = 'white';
    return (
      <Animated.View style={{backgroundColor:color}}>
        <TouchFeedback onPress={()=>{
            // console.warn('clicked');
            this._onShown(1);
            this.props.onRowClick()
          }}>
          {this.props.children}
        </TouchFeedback>
      </Animated.View>
    )
  }
}

ClickableRow.propTypes = {
  children:PropTypes.any,
  enable:PropTypes.bool,
  currentRouteId:PropTypes.string,
  onRowClick:PropTypes.func,
};

ClickableRow.defaultProps = {
  enable:true,
}
