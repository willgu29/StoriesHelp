import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var videoStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: '-180px 0 0 -240px'
}

var canvasStyle = {
  position: 'absolute',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  width: '100%',
  height: '100%'

}



function getSentenceTime(sentence) {
  var characters = sentence.length;
  var averageWordsByChar = characters/4.5;
  //2.6 = average spoken words per second
  var base = averageWordsByChar/2.2;
  var seconds = base;
  if (base < 1) {
      seconds = (seconds + 1.5);
  }
  if (base < 2) {
      seconds = (seconds + 0.5);
  }

  if (seconds > 4.5) {
      seconds =  4.5
  }
  return (seconds + 0.2)
}


//MUST be .mp4 files now
class Render extends Component {
  constructor(props){
    super(props);

    this.state = {url : '',
                  sentence : '',
                  index : -1,
                  isPlaying : false}
    this.startVideo = this.startVideo.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.triggerNext = this.triggerNext.bind(this);

  }
  startVideo() {
    this.state.isPlaying = true;
    var video = ReactDOM.findDOMNode(this.refs.video)
    video.play();
    this.triggerNext();
  }

  stopVideo() {
    clearInterval(this.triggerNext)
    var video = ReactDOM.findDOMNode(this.refs.video)
    video.pause();
    this.state.isPlaying = false;
  }
  triggerNext() {

    if (this.state.index < testURLS.length - 1 && this.state.isPlaying) {
      console.log("Next video");
      var milliseconds = getSentenceTime(testURLS[this.state.index + 1]) * 1000
      setTimeout(this.triggerNext, milliseconds)
      this.setState((prevState) => {
        return {
          url : testURLS[prevState.index + 1],
          sentence : testSentences[prevState.index + 1],
          index: prevState.index + 1,
          isPlaying: true
          };
      });

    } else {
      //finish video
      // this.setState({rendering : '',
      //                index : -1,
      //                isPlaying: false});
    }
  }
  render() {
    return (
      <div>
          <input type="submit" value="start video" onClick={this.startVideo} />
          <input type="submit" value="pause video" onClick={this.stopVideo} />
          <video loop autoPlay
              src={this.state.url}
              ref='video'>
          </video>
      </div>
    )
  }
}

var testSentences = [
    "First a thought, turned into a distant stare.",
    "The girl besides him only looks, what's to care?",
    "But still waters run deep.",
    "He's already made the leap.",
    "Dating they are, or rather, their first date you see.",
    "Most people would rather not think, they'd rather just be.",
    "But no, not he.",
    "He thinks much of we.",
    "First the goodnight kisses, then hand-holding and sleeping.",
    "Not the first thing, most guys would want after peeping.",
    "Then the cooking and cleaning, chores are reinvigorating.",
    "Not the most romantic thing to be communicating.",
    "A ring and three children, could it be any clearer?",
    "Not the worst thing to think, when the time comes nearer.",
    "Hello?",
    "Oh, Yellow!",
    "What are you thinking about?",
    "Oh, nothing worth talking about.",
    "I saw you smirking.",
    "Well are you flirting?",
    "You think I'll put out that quick?",
    "Only if I'm a dick.",
    "Then speak your mind you prick!",
    "Well, you're wearing some lipstick.",
    "And is that all?",
    "Well, at least until Fall."
];
var testURLS = [
    "https://media.giphy.com/media/sq1XuH2pUWzIY/giphy.mp4",
    "https://media.giphy.com/media/U6p8KBrQBi9Ta/giphy.mp4",
    "https://media.giphy.com/media/a5viI92PAF89q/giphy.mp4",
    "https://media.giphy.com/media/1x3LVhXaUdISA/giphy.mp4",
    "https://media0.giphy.com/media/3orieWBQ5vAXDwUHC0/giphy.mp4",
    "https://media.giphy.com/media/3oKIPfU57x9wdIpI64/giphy.mp4",
    "https://media.giphy.com/media/ULbomPn2HPSBq/giphy.mp4",
    "https://media.giphy.com/media/O1w2wSTriddUA/giphy.mp4",
    "http://media3.giphy.com/media/g65lsKd2n5gTC/giphy.mp4",
    "https://media.giphy.com/media/l0HlUHWbjYgK211zG/giphy.mp4",
    "https://media.giphy.com/media/3o7TKU8RvQuomFfUUU/giphy.mp4",
    "https://media.giphy.com/media/3DnDRfZe2ubQc/giphy.mp4",
    "https://media.giphy.com/media/UJG50B8TJD5Mk/giphy.mp4",
    "https://media.giphy.com/media/3og0IyoqVgp9YBrE2I/giphy.mp4",
    "https://media.giphy.com/media/ovbxjjVbmL0be/giphy.mp4",
    "https://media.giphy.com/media/zyMZjRaUsRxuw/giphy.mp4",
    "https://media.giphy.com/media/l0MYvfOW37flRrCCs/giphy.mp4",
    "http://media2.giphy.com/media/3o84sGuu6xfANJoNEs/giphy.mp4",
    "https://media.giphy.com/media/3oKIPjTOUeCGpdM5tS/giphy.mp4",
    "https://media.giphy.com/media/13aSSyJaI5NkTm/giphy.mp4",
    "https://media.giphy.com/media/3ohuAu7fLqjHLHHM6k/giphy.mp4",
    "http://media4.giphy.com/media/kMSyCATSq9SEw/giphy.mp4",
    "https://media.giphy.com/media/10kSYYbD0mcw9i/giphy.mp4",
    "https://media.giphy.com/media/RIS1sypJ2Vfwc/giphy.mp4",
    "https://media.giphy.com/media/xUySTWRlzyIKTMK7jq/giphy.mp4",
    "https://media.giphy.com/media/wrBURfbZmqqXu/giphy.mp4"
];

export default Render;
