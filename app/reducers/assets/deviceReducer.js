'use strict';

import {
  DEVICE_LOAD_REQUEST,
  DEVICE_LOAD_SUCCESS,
  DEVICE_LOAD_FAILURE,
  ASSET_LOGS_SUCCESS,
  ASSET_IMAGE_CHANGED,
  ASSET_IMAGE_CHANGED_COMPLETE,
  DEVICE_EXIT
} from '../../actions/assetsAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import {findSectioniIndexByType} from '../commonReducer.js';
import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  deviceId:null,
  data:null,
  sectionData:[],
  arrCanCalcuDash:[],
  hasRuntime:false,
  hasRealtime:false,
  isFetching:false,
  logCount:'',
  strTkdyly:null,
  classType:null,
  joinType:1,
  errorMessage:null,
});

function updateAssetDetailData(state,action) {
  var {body:{deviceId},response:{Result}} = action;
  // let {url,body,types} = action;
  var res = Result;
  var joinType=res.JoinType;
  var deviceDescption = [
    {'title':'设备总称','value':res.Class,'isNav':false,},
    {'title':'设备类型','value':res.DeviceType,'isNav':false,},
  ];
  if (res.Description) {
    deviceDescption.splice(0,0,
      {'title':'设备描述','value':res.Description,'isNav':false,},
    );
  }
  if (res.SerialNumber) {
    deviceDescption.splice(0,0,
      {'title':'资产编号','value':res.SerialNumber,'isNav':false,}
    );
  }
  if(res.Specification){
    deviceDescption.push({
      'title':'设备型号','value':res.Specification,'isNav':false,
    })
  }
  var strTkdyly=null;
  var classType=res.Class;
  var parameters = res.LedgerParameters.
                        map((item)=>{
                          if(item.Values.length > 1){
                            return {
                              title:item.Name,
                              value:'',
                              data:item.Values.map((item)=>{
                                return Immutable.Map({title:item,value:'',isNav:false})
                              }),
                              empty:'',
                              isNav:true,
                              type:'parameter'
                            }
                          }
                          else {
                            if (item.Name==='脱扣单元类型') {
                              strTkdyly=item.Values.join('');
                            }
                            return {
                              'title':item.Name,
                              'value':item.Values.join(''),
                              'isNav':false,
                            }
                          }

                        });

  var runtimeSetting = res.RuntimeSettingParameter;
  if((runtimeSetting.MaintenanceParameters && runtimeSetting.MaintenanceParameters.length > 0)
      || (runtimeSetting.SettingParameters && runtimeSetting.SettingParameters.length > 0)){
    runtimeSetting = [{title:'运维参数',value:'',isNav:true,type:'runtimeSetting'}];
  }
  else {
    runtimeSetting = null;
  }
  // var arrLogPhoto = [
  //   {'title':'现场照片','value':'','isNav':false,},
  //   {'title':'现场日志','value':'','isNav':false,},
  // ];
  var logCount = res.SceneLogs.length;
  var tendingCount=res.HistoryTicketsCount;

  var allElements=[
    [{title:'',value:res.LogoKey}],
    deviceDescption,
    parameters,
    [{title:'现场日志',value:logCount,isNav:true,type:'log',secType:'logSection'}],
    [{title:'维护历史',value:tendingCount,isNav:true,type:'tending'}]
  ];

  var allSecTitle=[
    '',
    '',
    '配置参数',
    ' ',
    ' '
  ];
  if (!parameters||parameters.length===0) {
    allElements.splice(2,1);
    allSecTitle.splice(2,1);
  }
  var hasRuntime = false,hasRealtime=false;
  if(runtimeSetting){
    hasRuntime = true;
  }

  if(res.MonitorParameterGroups && res.MonitorParameterGroups.length > 0){
    var groupItem=res.MonitorParameterGroups[0];
    // if (groupItem.Name&&groupItem.Name.length>0) {
      hasRealtime = true;
    // }
  }
  var arrCanCalcu=[];
  if(res.ParameterCanCalculates && res.ParameterCanCalculates.length > 0){
    res.ParameterCanCalculates.forEach((item)=>{
      if (item.DisplayInstrument) {
        arrCanCalcu.push(item);
      }
    });
  }
  return Immutable.fromJS({
    data:Immutable.fromJS(allElements),
    sectionData:Immutable.fromJS(allSecTitle),
    arrCanCalcuDash:Immutable.fromJS(arrCanCalcu),
    isFetching:false,
    hasRuntime,
    hasRealtime,
    logCount,
    deviceId,
    strTkdyly,
    classType,
    joinType
  });

}

function addLogsCount(state,action) {
  var {hierarchyId,response:{Result}} = action;
  if(state.get('deviceId') === hierarchyId){
    if(!Result){
      Result = [];
    }
    var len = Result.length;
    if(state.get('logCount') !== len){
      var newState = state.set('logCount',len);
      var indexSec=findSectioniIndexByType(newState.get('data'),'logSection');
      var data = newState.get('data');
      data = data.setIn([indexSec,0,'value'],len);
      return newState.set('data',data);
    }
  }
  return state;
}



function imageChanged(state,action) {
  let {data,hierarchyType} = action;
  if(hierarchyType !== 'device') return state;
  if(data.length > 0){
    let image = data[0];
    // console.warn('imageChanged',image.uri);
    // console.warn('state',state);
    var newState = state.setIn(['data',0,0,'pendingImageUri'],image.uri);
    // console.warn('newState',newState);
    return newState;
  }

  return state;

}

function imageChangedComplete(state,action) {
  let {data} = action;
  let newState = state;
  // newState = newState.set('pendingImageUri','');
  newState = newState.setIn(['data',0,0,'value'],data);

  return newState;
}

function handleError(state,action) {
  var {Error} = action.error;
  var strError=null;
  switch (Error) {
    case '050001251009':
      strError = '无查看资产权限，联系管理员';
      action.error=null;
      break;
  }
  return state.set('isFetching',false).set('errorMessage',strError);
}

export default function(state=defaultState,action){
  switch (action.type) {
    case DEVICE_LOAD_REQUEST:
      return state.set('isFetching',true);
    case DEVICE_LOAD_SUCCESS:
      return updateAssetDetailData(state,action);
    case DEVICE_LOAD_FAILURE:
      var newState = state.set('isFetching',false);
      return handleError(newState,action);
    case ASSET_LOGS_SUCCESS:
      return addLogsCount(state,action);
    case ASSET_IMAGE_CHANGED:
      return imageChanged(state,action);
    case ASSET_IMAGE_CHANGED_COMPLETE:
      return imageChangedComplete(state,action);
    case DEVICE_EXIT:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
