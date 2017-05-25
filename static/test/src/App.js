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
    this.state.sentences.append(text);
    this.state.urls.append(url);
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
    return (
      <form methods="post" onSubmit={this.handleSubmit} >
        <input type="hidden" name="sentences" value={this.props.sentences} />
        <input type="hidden" name="urls" value={this.props.urls} />
        <input type="submit" value="preview story" />
      </form>
    );
  }
}

class TypeStory extends Component {
  constructor(props) {
   super(props);
   this.state = {text: ''};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
   this.handleURL = this.handleURL.bind(this);

  }

  handleChange(event) {
      this.setState({text: event.target.value});
      this.setState({"urls" : ["http://media3.giphy.com/media/kMSyCATSq9SEw/giphy.gif",
                              "http://media2.giphy.com/media/3o6Yg6gk00QtuKBgTS/giphy.gif",
                              "http://media1.giphy.com/media/fxZvE8YuYJwRi/giphy.gif"]});
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
    return (
      <div>
        <ContentViews onSelect={this.handleURL} urls={this.state.urls} ></ContentViews>
        {this.state.url}
      <form onSubmit={this.handleSubmit}>
        <label>
          <textarea value={this.state.text} onChange={this.handleChange}></textarea>
        </label>
        <input type="submit" value="add sentence" />
      </form>

      </div>

    );
  }
}

var selectedViewStyle = {
  border: '3px solid purple',
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
  componentWillMount() {

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
      'selectedURL': url,
      'isSelected': setSelected
    });

    this.props.onSelect(this.state.selectedURL)

  }

  render() {

    return (
    <div className="board-row">
      {this.props.urls}
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
