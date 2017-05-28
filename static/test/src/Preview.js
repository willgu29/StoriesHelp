import React, { Component } from 'react';
import axios from 'axios'

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

var captionStyle = {
  textAlign : "center",
}

class GifDisplay extends Component {
  render() {
    return (
      <div className="float-left">
        <img src={this.props.url} style={previewGifStyle} />
        <p style={captionStyle}>{this.props.sentence}</p>
      </div>
    );
  }
}

class VideoDisplay extends Component {
  render() {
    return (
      <div className="float-left">
        <video style={previewVideoStyle} src={this.props.url} autoPlay loop muted>
        </video>
        <p style={captionStyle}>{this.props.sentence}</p>
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
        var typeDisplay = (<div></div>);
        var url = this.props.urls[i];
        if (url.indexOf('.gif') !== -1) {
          typeDisplay = (<GifDisplay url={url}
                                          sentence={this.props.sentences[i]}>
                                          </GifDisplay>);
        } else if (url.indexOf('.mp4') !== -1) {
          typeDisplay = (<VideoDisplay url={url}
                                       sentence={this.props.sentences[i]}>
                                          </VideoDisplay>);
        } else {
          typeDisplay = (<div></div>)
        }
        display.push(typeDisplay);
      }
      return (
        <div>
          <form method="post" onSubmit={this.handleSubmit} >
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
      return (
        <form method="post" onSubmit={this.handleSubmit} >
          Number of Sentences: {numberOfSlides}
          <input type="submit" value="preview story" />
        </form>

      );
    }
  }
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



export default Preview;
