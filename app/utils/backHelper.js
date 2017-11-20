'use strict';

import {
  BackAndroid,
  Platform
} from 'react-native';

var handlerMap = {};

var pop = (nav)=>{
  nav.pop();
}

var defaultHandler = (nav,id,func)=>{
  var routes = nav.getCurrentRoutes();
  var route = null;
  if(routes.length>0){
    route = routes[routes.length-1];
  }
  // console.warn('pop route.id',route.id);
  if(route && route.id === id){
    if(func){
      func();
    }
    else{
      pop(nav)
    }
  }
}



export default {
  init(nav,id,func){
    if(Platform.OS === 'android'){
      // console.warn('init route.id',id);
      handlerMap[id] = ()=>{
        defaultHandler(nav,id,func);
        return true;
      }
      BackAndroid.addEventListener('hardwareBackPress',handlerMap[id]);
    }
  },
  destroy(id){
    if(Platform.OS === 'android'){
      BackAndroid.removeEventListener('hardwareBackPress',handlerMap[id]);
      handlerMap[id] = null;
    }
  }
}
