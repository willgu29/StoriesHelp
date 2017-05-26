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
  }
  handleSubmit(event) {
    event.preventDefault();
    //post to preview url with sentences and urls

  }

  render() {
    var numberOfSlides = this.props.sentences.length;
    return (
      <div>
      <form method="post" onSubmit={this.handleSubmit} >
        <input type="hidden" name="sentences" value={this.props.sentences} />
        <input type="hidden" name="urls" value={this.props.urls} />
        Number of Sentences: {numberOfSlides}
        <input type="submit" value="preview story" />
      </form>
      <br />

      </div>
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
  return response.json();
}


const WAIT_INTERVAL = 250;

class TypeStory extends Component {
  constructor(props) {
   super(props);
   this.state = {text : '',
                url : '',
                urls : []};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleURL = this.handleURL.bind(this);
   this.refreshURLS = this.refreshURLS.bind(this);
   this.triggerChange = this.triggerChange.bind(this);


  }
  refreshURLS(urls) {
    this.setState({"urls" : urls});
  }
  componentWillMount() {
    this.timer = null;
  }

  handleChange(event) {
    clearTimeout(this.timer);
    this.setState({text: event.target.value});
    this.timer = setTimeout(this.triggerChange, WAIT_INTERVAL);
      /*
      this.setState({"urls" : ["http://media3.giphy.com/media/kMSyCATSq9SEw/giphy.gif",
                              "http://media2.giphy.com/media/3o6Yg6gk00QtuKBgTS/giphy.gif",
                              "http://media1.giphy.com/media/fxZvE8YuYJwRi/giphy.gif"]}); */
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

  render() {
    var showInput = (<input type="submit" value="add sentence" />)
    if (this.state.url == ''){
      showInput = (<div></div>)
    }
    return (
      <div>
        <ContentViews onSelect={this.handleURL} urls={this.state.urls} ></ContentViews>

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

var selectedViewStyle = {
  border: '3px solid purple'
}
var nonSelectedViewStyle = {
  border: '0px solid purple'
}

class GifView extends Component {

  render() {
    return (
      <img className="Display-gif"
        onClick={() => this.props.onClick()}
        src={this.props.url}
        style={this.props.style}
        alt="Can't load gif" />
    );
  }
}

class ImageView extends Component {

}

// class VideoView extends Component {
//   render() {
//     return(
//
//     );
//   }
// }

class ContentViews extends Component {
  constructor(props) {
    super(props);
    this.state = {'isSelected' : [false, false, false]}
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.state = {'isSelected' : [false, false, false]}
  }

  renderURL(i, selected) {
    var style = {}
    if (selected) {
      style = selectedViewStyle;
    } else {
      style = nonSelectedViewStyle;
    }
    if (this.props.urls == null) {
      return (<div></div>);
    }
    var url = this.props.urls[i];
    if (url == null) {
      return (<div></div>)
    }
    if (url.indexOf('.gif') !== -1) {
      return (<GifView
              url={this.props.urls[i]}
              style={style}
              onClick={() => this.handleSelect(i)}></GifView>);

    } else if (url.indexOf(".mp4") !== -1) {
      //is video
    } else {
      //is image
      return (<div></div>);
    }

  }
  handleSelect(i) {
    var url = this.props.urls[i];
    var setSelected = [false, false, false];
    setSelected[i] = true;
    this.setState({
      // 'selectedURL': url,
      'isSelected': setSelected
    });

    this.props.onSelect(url)

  }

  render() {

    return (
    <div className="board-row">
      {this.renderURL(0, this.state.isSelected[0])}
      {this.renderURL(1, this.state.isSelected[1])}
      {this.renderURL(2, this.state.isSelected[2])}
    </div>
  );
  }
}

// class ContentView extends Component {
//   render() {
//
//   }
// }
//
// class RefreshViews extends Component {
//   render() {
//
//   }
// }

class SearchBar extends Component {
  constructor(props) {
   super(props);
   this.state = {text: ''};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
      this.setState({searchText: event.target.value});
  }
  handleSubmit(event) {
   event.preventDefault();
   axios.get('https://localhost:5000/api/gifs?text={this.state.text}')
      .then(res => {
        const contentURLS = res.data.map(obj => obj.data);
        this.setState({ contentURLS });
      });

   //search for gifs/content/yehh this.state.searchText
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Search:
          <input type="text" value={this.state.text} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default App;
