import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
   super(props);
   this.createSlide = this.createSlide.bind(this);
   this.state = {
     sentences: [],
     urls: []
   }
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
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>

        <br />
        <TypeStory createSlide={this.createSlide} ></TypeStory>

        <br />
        <br />
        <br />
        <Preview sentences={this.state.sentences}
                  urls={this.state.urls}></Preview>

      </div>
    );
  }
}



class Preview extends Component {
  constructor(props) {
   super(props);
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleChange = this.handleChange.bind(this);
   this.saveStory = this.saveStory.bind(this);
   this.saveStatus = this.saveStatus.bind(this);

   this.state = {shouldPreview : false,
                title : ''}
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.shouldPreview) {
      this.setState({shouldPreview : false})
    } else {
      this.setState({shouldPreview : true})
    }
  }
  saveStatus(id) {
    //if failed to save handleChange
    //else redirect to saved page
    window.location.href= ("/api/saved/" + id['id']);

  }
  saveStory(event) {
    event.preventDefault();
    saveStory(this.state.title, this.props.sentences, this.props.urls, this.saveStatus)
  }
  handleChange(event) {
    this.setState({title: event.target.value});
  }

  render() {

    if (this.state.shouldPreview) {
      var display = []
      for (var i = 0 ; i < this.props.urls.length; i++) {
        var gifDisplay = (<PreviewDisplay url={this.props.urls[i]}
                                          sentence={this.props.sentences[i]}>
                                          </PreviewDisplay>);
        display.push(gifDisplay);
      }
      return (
        <div>
          <form method="post" onSubmit={this.handleSubmit} >
            <input type="submit" value="close preview" />
          </form>
          <br />
          {display}
          <br />
          <br />
          <br />

          <div style={resetAlignmentStyle}>

            <form method="post" action="/api/saveStory" onSubmit={this.saveStory} >
              <input type="hidden" name="sentences" value={this.props.sentences} />
              <input type="hidden" name="urls" value={this.props.urls} />
              Title (optional): <input type="text" name="title"
                          onChange={this.handleChange}
                          value={this.state.title} />
              <input type="submit" value="save story" />
            </form>
          </div>

        </div>
      );
    } else {
      var numberOfSlides = this.props.sentences.length;
      return (
        <form method="post" onSubmit={this.handleSubmit} >
          Number of Sentences: {numberOfSlides}
          <input type="submit" value="preview story" />
        </form>

      );
    }
  }
}

const WAIT_INTERVAL = 350;

class TypeStory extends Component {
  constructor(props) {
   super(props);
   this.timer = null;
   this.state = {text : '',
                url : '',
                urls : []};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleURL = this.handleURL.bind(this);
   this.refreshURLS = this.refreshURLS.bind(this);
   this.triggerChange = this.triggerChange.bind(this);
   this.handleUpdate = this.handleUpdate.bind(this);


  }
  refreshURLS(urls) {
    this.setState( urls );
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
    }
  }

  handleSubmit(event) {
   event.preventDefault();

   this.props.createSlide(this.state.text, this.state.url);
   this.setState({text : '',
                  url  : '',
                  urls : []})

  }
  handleURL(url){
    this.setState({url : url})
  }
  handleUpdate(url){
    //max 4 gifs
    var urls = this.state.urls.slice(0, 3);
    urls.push(url);
    this.setState({
      urls : urls
    });
  }

  render() {
    var showInput = (<input type="submit" value="add sentence" />)
    if (this.state.url == ''){
      showInput = (<div></div>)
    }
    return (
      <div>
        <ContentViews onSelect={this.handleURL}
                      updateURLS={this.handleUpdate}
                      urls={this.state.urls} ></ContentViews>

        <br />
        <br />
        <br />
      <form onSubmit={this.handleSubmit}>
        <label>
          <textarea value={this.state.text} onChange={this.handleChange}></textarea>
        </label>
        {showInput}
      </form>

      </div>

    );
  }
}


// **********  Extra Functions ---- >

function saveStory(title, sentences, urls, callback) {
  axios.post('/api/saveStory', {
    title: title,
    sentences: sentences,
    urls: urls
  }).then(checkStatus).then(returnObject).then(callback);

}

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

function returnObject(object) {
  console.log(object)
  return object.data;
}

function parseJSON(response) {
  console.log(response)
  return response.json();
}


// ********** Styles --- >

var alignLeftStyle = {
  float : 'left',
  paddingRight : "10px",
}
var previewGifStyle = {
  height : '100px'
}

var captionStyle = {
  textAlign : "center",
}

var selectedViewStyle = {
  border: '3px solid purple'
}
var nonSelectedViewStyle = {
  border: '0px solid purple'
}

var resetAlignmentStyle = {
  float : "none",
  clear : "both",
  paddingBottom : '20px'
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

class PreviewDisplay extends Component {
  render() {
    return (
      <div style={alignLeftStyle}>
        <img src={this.props.url} style={previewGifStyle} />
        <p style={captionStyle}>{this.props.sentence}</p>
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
    var form = (<div></div>);
    if (this.props.urls.length > 0) {
      form = (<form onSubmit={this.handleSubmit}>
          Load gif link: <input type="text" onChange={this.handleChange} value={this.state.text} />
          <input type="submit" value="load gif" />
          </form>)
    }
    return (
    <div className="board-row">
      {this.renderURLS()}
      {form}
    </div>
  );
  }
}


export default App;
