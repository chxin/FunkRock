'use strict'
import React,{Component,PropTypes} from 'react';
import {
  View,
  TextInput,
  StyleSheet,

} from 'react-native';

import {BLACK,GRAY,ENV_EDIT_LINE,LIST_BG} from '../../styles/color';
import Toolbar from '../Toolbar';
import Loading from '../Loading';

export default class NameEditView extends Component{
  constructor(props){
    super(props);
    this.state = {text:props.user.get('RealName')};
  }
  _textChanged(text){
    this.setState({text});
  }
  render(){
    if(this.props.isFetching){
      return  (
        <View style={styles.container}>
          <Toolbar
            title={'修改昵称'}
            navIcon="back"
            actions={[{title:'完成',show:'always'}]}
            onIconClicked={this.props.onBack}
            onActionSelected={[()=>{
              this.props.save(this.state.text)
            }]} />
            <Loading />
        </View>
      );
    }
    // keyboardType={"name-phone-pad"}
    return (
      <View style={styles.container}>
        <Toolbar
          title={'修改昵称'}
          navIcon="back"
          actions={[{title:'完成',show:'always'}]}
          onIconClicked={this.props.onBack}
          onActionSelected={[()=>{
            this.props.save(this.state.text)
          }]} />
        <View style={styles.inputContainer}>
          <TextInput
              style={styles.input}
              autoFocus={true}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              multiline={false}
              placeholderTextColor={GRAY}
              textAlignVertical={'bottom'}
              placeholder={""}
              onChangeText={(text)=>this._textChanged(text)}
              value={this.state.text} />
        </View>
      </View>
    );
  }
}

NameEditView.propTypes = {
  user:PropTypes.object.isRequired,
  onBack:PropTypes.func.isRequired,
  save:PropTypes.func.isRequired,
  isFetching:PropTypes.bool,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white',
  },
  inputContainer:{
    // flex:1,
    marginTop:16,
    paddingHorizontal:15,
    flexDirection:'row',
    alignItems:'center',
    // justifyContent:'center',
    paddingBottom:7,
    height:48,
    borderBottomWidth:1,
    // backgroundColor:'white',
    borderColor:ENV_EDIT_LINE
  },
  input:{
    fontSize:17,
    color:BLACK,
    // backgroundColor:'white',
    flex:1,
    padding:0,
    height:48,
    marginTop:0,marginBottom:0,
  }
});
