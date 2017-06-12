import React, { Component } from 'react';
import axios from 'axios'


class EditorType2 extends Component {
  constructor(props){
    super(props);
    this.createSlide = this.createSlide.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSentences = this.handleSentences.bind(this);
    this.state = {
      isLoaded : false,
      isLoading : false,
      currentIndex : -1,
      importedSentences : [],
      sentences : [],
      urls : [],
      text : ''
    }
  }
  createSlide(sentence, url){
    var sentences = this.state.sentences;
    var urls = this.state.urls;
    sentences.push(sentence);
    urls.push(url);
    var nextIndex = this.state.currentIndex + 1;
    if (nextIndex == this.state.importedSentences.length) {
      this.props.createStory(sentences, urls)
      return;
    }
    this.setState({
      sentences : sentences,
      urls : urls,
      currentIndex : nextIndex
    })
  }
  handleSentences(object){
    this.setState({
      currentIndex : 0,
      importedSentences : object['sentences'],
      isLoaded : true
    })
  }
  handleSubmit(event){
    event.preventDefault();
    getSentences(this.state.text, this.handleSentences)
    this.setState({
      isLoading : true
    })

  }
  handleChange(event){
    event.preventDefault();
    this.setState({
      text : event.target.value
    })
  }
  render(){


    if (this.state.isLoaded) {
      var sentence = this.state.importedSentences[this.state.currentIndex];
      return(
        <div>
          <TypeStory sentence={sentence} createSlide={this.createSlide} ></TypeStory>
        </div>
      );
    } else {

      var showSpinner = (<p></p>);
      var showGuide = (<p>Tell your story (meme):</p>);
      var showInput = (<input type="submit" value="create story" />)

      if (this.state.isLoading) {
        showSpinner = (<p>Loading...</p>)
        showGuide = (<p></p>)
      }
      if (this.state.text == ''){
        showInput = (<div></div>)
      }
      return(
        <div>
          {showSpinner}
          {showGuide}
          <form onSubmit={this.handleSubmit}>
              <textarea rows="20" cols="80" value={this.state.text} onChange={this.handleChange}></textarea>
              <br />
              {showInput}
          </form>
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
   this.state = {text : this.props.sentence,
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
  componentDidMount(){
    this.triggerChange();
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      text : nextProps.sentence
    }, this.triggerChange)
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
   var url = this.state.url.replace('.gif', '.mp4', 1)
   this.props.createSlide(this.state.text, url);
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
    var showGuide = (<p>Choose a clip that represents the sentence: <em><b>{this.state.text}</b></em></p>);

    if (this.state.url == ''){
      showInput = (<div></div>)
    }
    if (this.state.isLoading) {
      showSpinner = (<p>Loading...</p>)
      showGuide = (<p></p>);
    }
    return (
      <div>
        {showSpinner}
        {showGuide}
        <ContentViews onSelect={this.handleURL}
                      triggerChange={this.triggerChange}
                      updateURLS={this.handleUpdate}
                      urls={this.state.urls} ></ContentViews>

        <br />
        <br />
        <br />
      <form onSubmit={this.handleSubmit}>

           <textarea rows="2" cols="40" value={this.state.text}
                                        onChange={this.handleChange}></textarea>
        <br />
        {showInput}
      </form>
      <br />
      <br />
      </div>

    );
  }
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
      </div>
    );
    //    <p className="small-caption">{this.state.duration} seconds</p>

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
                      Load video link: <input type="text" onChange={this.handleChange} value={this.state.text} />
                      <input type="submit" value="load clip" />
                    </form>)
      showRefresh = (<form onSubmit={this.refreshGifs}>
                          <input type="submit" value="refresh clips" />
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

function getSentences(textBlob, callback) {
  axios.post('/api/sentences', {
    story : textBlob,
  }).then(checkStatus).then(returnObject).then(callback);
}

function returnObject(object) {
  console.log(object)
  return object.data;
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


function parseJSON(response) {
  console.log(response)
  return response.json();
}



export default EditorType2;
