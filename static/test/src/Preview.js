import React, { Component } from 'react';
import axios from 'axios'

import Player from './Player.js'

var resetAlignmentStyle = {
  float : "none",
  clear : "both",
  paddingBottom : '20px'
}


var previewGifStyle = {
  height : '100px'
}

var previewVideoStyle = {
  height : '100px'
}


class GifDisplay extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick(event){
    event.preventDefault();
    this.props.onClick(this.props.index)
  }
  render() {
    return (
      <div className="float-left">
        <img onClick={this.onClick} src={this.props.url} style={previewGifStyle} />
        <p className="caption">{this.props.sentence}</p>
      </div>
    );
  }
}

class VideoDisplay extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick(event){
    event.preventDefault();
    this.props.onClick(this.props.index)
  }
  render() {
    return (
      <div className="float-left">
        <video onClick={this.onClick} style={previewVideoStyle} src={this.props.url} autoPlay loop muted>
        </video>
        <p className='caption'>{this.props.sentence}</p>
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
   this.handleSelect = this.handleSelect.bind(this);
   this.editStory = this.editStory.bind(this);
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
  handleSelect(i){
    this.props.onSelect(i)
  }
  saveStatus(id) {
    //if failed to save handleChange
    //else redirect to saved page
    window.location.href= ("/upload/" + id['id']);

  }
  saveStory(event) {
    event.preventDefault();
    saveStory(this.state.title, this.props.sentences, this.props.urls, this.saveStatus)
  }
  editStory(event){
    event.preventDefault();
    this.props.onEdit();
  }
  handleChange(event) {
    this.setState({title: event.target.value});
  }

  render() {

    if (this.state.shouldPreview) {

      var display = (<Player
                            sentences={this.props.sentences}
                            urls={this.props.urls}
                            ></Player>);


      return (
        <div>
          <form className="reset-alignment" method="post" onSubmit={this.handleSubmit} >
            <input type="submit" value="close preview" />
          </form>
          <br />
          {display}
          <br /><br /><br />

          <div className="reset-alignment">
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
      var duration = getVideoDuration(this.props.sentences);
      return (
        <div>
        <input type="submit" value="add more sentences" onClick={this.editStory}/>
        <br /> <br /> <br /> <br />
        <form className="reset-alignment" method="post" onSubmit={this.handleSubmit} >
          Number of Sentences: {numberOfSlides} <br />
          Length of Video: {duration.toFixed(2)} seconds<br />
          <br />
          <input type="submit" value="preview story" />
        </form>
        </div>

      );
    }
  }
}




function loadViews(sentences, urls, onClickCallback){

  var display = []
  for (var i = 0 ; i < sentences.length; i++) {
    var typeDisplay = (<div></div>);
    var url = urls[i];
    url = url.replace('.gif', '.mp4', 1)
    //if (url.indexOf('.mp4') !== -1) {
      typeDisplay = (<VideoDisplay
                                  index={i}
                                  key={i}
                                  url={url}
                                  onClick={onClickCallback}
                                  sentence={sentences[i]}>
                                      </VideoDisplay>);
    //} else {
    ///  typeDisplay = (<div></div>)
    //}
    display.push(typeDisplay);
  }
  return display;
}


function saveStory(title, sentences, urls, callback) {
  axios.post('/api/saveStory', {
    title: title,
    sentences: sentences,
    urls: urls
  }).then(checkStatus).then(returnObject).then(callback);

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

function getVideoDuration(sentences){
  var seconds = 0;
  for (var i = 0; i < sentences.length; i++) {
    var clipLength = getSentenceSeconds(sentences[i]);
    seconds = seconds + clipLength;
  }
  return seconds;
}

function getSentenceSeconds(sentence){
  var characters = sentence.length;
  var averageWordsByChar = characters/4.5;
  var base = averageWordsByChar/2.2;
  var seconds = base;
  if (base < 1) {
    seconds = (seconds + 1.5);
  }
  if (base < 2) {
    seconds = (seconds + 0.5);
  }
  if (seconds > 4.5) {
    seconds = 4.5;
  }

  return (seconds + 0.2);
}



export default Preview;
