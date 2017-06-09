import React, { Component } from 'react';
import logo from './logo.svg';
import penguin from './logo.jpg';

import './App.css';
import axios from 'axios';

import Preview from './Preview.js'
import Render from './Render.js'
import Editor from './Editor.js'

class App extends Component {
  constructor(props) {
   super(props);
   this.createSlide = this.createSlide.bind(this);
   this.createStory = this.createStory.bind(this);
   this.handleEdit = this.handleEdit.bind(this);
   this.handleClick = this.handleClick.bind(this);
   this.state = {
     sentences: [],
     urls: [],
     previewLoaded : false
   }
  }
  componentDidMount() {
    document.title = "PJ"
  }
  createSlide(text, url) {
    var sentences = this.state.sentences;
    var urls = this.state.urls;
    sentences.push(text);
    urls.push(url);
    this.setState({
      sentences : sentences,
      urls : urls
    })
  }
  createStory(sentences, urls) {
    var thisSentences = this.state.sentences;
    var thisUrls = this.state.urls;
    thisSentences.push.apply(thisSentences, sentences);
    thisUrls.push.apply(thisUrls, urls);
    this.setState({
      sentences : thisSentences,
      urls : thisUrls,
      previewLoaded : true
    })
  }
  handleEdit(){
    this.setState({
      previewLoaded : false
    })
  }
  handleClick(event){
    event.preventDefault();
    //app logo clicked, go home.
    if (window.confirm("Return home? You'll lose all your progress.")){
      window.location.href = ('/');
    }
  }
  render() {
    //        <TypeStory createSlide={this.createSlide} ></TypeStory>
    if (this.state.previewLoaded) {
      return (
      <div className="App">
        <div className="App-header">
          <img src={penguin} onClick={this.handleClick} className="App-logo" alt="logo" />
          <h2>Welcome to Penguin Jeffrey</h2>
        </div>
        <br />
        <br />


        <Preview
                  onEdit={this.handleEdit}
                  sentences={this.state.sentences}
                  urls={this.state.urls}></Preview>
      </div>
      );

    } else {
      return (
        <div className="App">
          <div className="App-header">
            <img src={penguin} onClick={this.handleClick} className="App-logo" alt="logo" />
            <h2>Welcome to Penguin Jeffrey</h2>
          </div>
          <Editor createStory={this.createStory}></Editor>
        </div>
      );
    }
  }
}


const WAIT_INTERVAL = 500;

class TypeStory extends Component {
  constructor(props) {
   super(props);
   this.timer = null;
   this.state = {text : '',
                url : '',
                urls : [],
                isLoading : false};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleURL = this.handleURL.bind(this);
   this.refreshURLS = this.refreshURLS.bind(this);
   this.triggerChange = this.triggerChange.bind(this);
   this.handleUpdate = this.handleUpdate.bind(this);
   this.refreshGifs = this.refreshGifs.bind(this);


  }
  refreshURLS(urls) {
    //replace .gif with .mp4
    var mp4s = []
    for (var i = 0; i < urls['urls'].length; i++) {
      var url = urls['urls'][i].replace('.gif', '.mp4')
      mp4s.push(url)
    }

    this.setState({urls : mp4s,
                    isLoading : false});
  }

  handleChange(event) {
    clearTimeout(this.timer);
    this.setState({text: event.target.value});
    this.timer = setTimeout(this.triggerChange, WAIT_INTERVAL);
  }

  triggerChange() {
    if (this.state.text != "") {
      this.state.url = ""
      search(this.state.text, this.refreshURLS)
      this.setState({isLoading : true})
    }
  }
  refreshGifs(event) {
    event.preventDefault();
    search(this.state.text, this.refreshURLS)
    this.setState({isLoading : true})
    //Todo show spinner/loader
  }
  handleSubmit(event) {
   event.preventDefault();

   this.props.createSlide(this.state.text, this.state.url);
   this.setState({text : '',
                  url  : '',
                  urls : [],
                  isLoading : false})

  }
  handleURL(url){
    url = url.replace('.gif', '.mp4', 1);
    this.setState({url : url})
  }
  handleUpdate(url){
    //max 4 gifs
    var urls = this.state.urls.slice(0, 3);
    url = url.replace('.gif', '.mp4', 1);
    urls.push(url);
    this.state.url = ""
    this.setState({
      urls : urls,
      isLoading : false
    });
  }

  render() {
    var showInput = (<input type="submit" value="add sentence" />)
    var showSpinner = (<p></p>);


    if (this.state.url == ''){
      showInput = (<div></div>)
    }
    if (this.state.isLoading) {
      showSpinner = (<p>Loading...</p>)
    }
    return (
      <div>
        {showSpinner}
        <ContentViews onSelect={this.handleURL}
                      triggerChange={this.triggerChange}
                      updateURLS={this.handleUpdate}
                      urls={this.state.urls} ></ContentViews>

        <br />
        <br />
        <br />
      <form onSubmit={this.handleSubmit}>

          <textarea rows="2" cols="40" value={this.state.text} onChange={this.handleChange}></textarea>
        {showInput}
      </form>

      </div>

    );
  }
}


// **********  Extra Functions ---- >


function search(query, callback){
  return fetch('/api/gifs?q='+query , {
    accept: 'application/json',
  }).then(checkStatus)
  .then(parseJSON)
  .then(callback);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}


function parseJSON(response) {
  console.log(response)
  return response.json();
}


// ********** Styles --- >

var previewGifStyle = {
  height : '100px'
}

var selectedViewStyle = {
  border: '3px solid purple'
}
var nonSelectedViewStyle = {
  border: '0px solid purple'
}


// ******** Views --- >


class GifView extends Component {
  constructor(props) {
    super(props)
    this.onClick = this.onClick.bind(this);
  }
  onClick(event){
    event.preventDefault();
    this.props.onClick(this.props.index)
  }
  render() {
    return (
      <img className="Display-gif"
        onClick={this.onClick}
        src={this.props.url}
        style={this.props.style}
        alt="Can't load, make sure link is .gif" />
    );
  }
}

class VideoView extends Component {
  constructor(props) {
    super(props)
    this.onClick = this.onClick.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.state = {duration : 0}
  }
  onClick(event){
    event.preventDefault();
    this.props.onClick(this.props.index)
  }
  handleLoad(event){
    event.preventDefault();
    this.setState({duration : event.target.duration})
  }

  render() {
    return (
      <div className='board-row'>
        <video  onClick={this.onClick}
                onLoadedData={this.handleLoad}
                ref={this.video}
                style={this.props.style}
                className="Display-video" autoPlay loop muted
                src={this.props.url}>
        </video>
        <p className="small-caption">{this.state.duration} seconds</p>
      </div>
    );
  }
}


class ContentViews extends Component {
  constructor(props) {
    super(props);
    this.state = {'isSelected' : [false, false, false, false],
                  'text' : ''}
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.refreshGifs = this.refreshGifs.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    this.state = {'isSelected' : [false, false, false, false],
                  'text' : ''}

  }

  renderURLS() {
    if (this.props.urls == null) {
      return (<div></div>);
    }

    var render = []
    for (var i = 0; i < this.props.urls.length; i++) {
      var url = this.props.urls[i];
      var style = {};
      if (this.state.isSelected[i]) {
        style = selectedViewStyle;
      } else {
        style = nonSelectedViewStyle;
      }
      //Canvas implementation can only handle .mp4 ***
      if (url == null) {

      } else if (url.indexOf('.gif') !== -1) {
        render.push(
          (<GifView
                  index={i}
                  key={i}
                  url={url}
                  style={style}
                  onClick={this.handleSelect}></GifView>)
        )
      } else if (url.indexOf('.mp4') !== -1) {
        render.push(
          (<VideoView
                  index={i}
                  key={i}
                  url={url}
                  style={style}
                  onClick={this.handleSelect}></VideoView>)
        )
      } else {
        render.push(
          (<div></div>)
        )
      }
    }
    return render;
  }
  handleSubmit(event) {
    event.preventDefault();
    this.props.updateURLS(this.state.text);
  }
  refreshGifs(event) {
    event.preventDefault();
    this.props.triggerChange();
  }
  handleChange(event) {
    event.preventDefault();
    this.setState({'text' : event.target.value})
  }

  handleSelect(i) {
    var url = this.props.urls[i];
    console.log(i)
    var setSelected = [false, false, false, false];
    setSelected[i] = true;
    this.setState({
      // 'selectedURL': url,
      'isSelected': setSelected
    });

    this.props.onSelect(url)

  }

  render() {
    var userInput = (<div></div>);
    var showRefresh = (<div></div>);
    if (this.props.urls.length > 0) {
      userInput = (<form className="reset-alignment" onSubmit={this.handleSubmit}>
                      Load gif link: <input type="text" onChange={this.handleChange} value={this.state.text} />
                      <input type="submit" value="load gif" />
                    </form>)
      showRefresh = (<form onSubmit={this.refreshGifs}>
                          <input type="submit" value="refresh gifs" />
                     </form>);
    }
    return (
    <div>
      {showRefresh} <br />
      {this.renderURLS()}
      {userInput}
    </div>

  );
  }
}


export default App;
