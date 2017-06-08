import React, { Component } from 'react';



class Player extends Component {
  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.nextVideo = this.nextVideo.bind(this);
    this.setNextVideo = this.setNextVideo.bind(this);
    this.timer = null;
    this.state = {
      currentIndex : 0
    }
  }
  componentDidMount(){
    var seconds = getSentenceSeconds(this.props.sentences[this.state.currentIndex])
    this.timer = setTimeout(this.nextVideo, seconds*1000)
  }
  handleClick(event){
    event.preventDefault();
    this.nextVideo();


  }
  setNextVideo(){
    if (this.state.currentIndex == this.props.sentences.length) {
      return;
    }
    var seconds = getSentenceSeconds(this.props.sentences[this.state.currentIndex])
    console.log(seconds);
    this.timer = setTimeout(this.nextVideo, (1000*seconds));
  }
  nextVideo(){
    clearTimeout(this.timer)
    if (this.state.currentIndex == this.props.sentences.length) {
      return;
    }

    this.setState((prevState) => {
      return {currentIndex: prevState.currentIndex + 1 };
    }, this.setNextVideo);
  }
  render(){
    if (this.state.currentIndex == this.props.sentences.length) {
      return(
        <div>
          <p>Save it to get a share link or download an mp4.</p>
        </div>

      );
    }
    return(
      <div className='view-border'
          onClick={this.handleClick}>
        <video  className="view-story"
                src={this.props.urls[this.state.currentIndex]}
                autoPlay loop>

        </video>
        <p className="view-caption">{this.props.sentences[this.state.currentIndex]}</p>
      </div>
    );
  }
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



export default Player;
