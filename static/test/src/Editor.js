import React, { Component } from 'react';
import axios from 'axios'

import ImportStory from './ImportStory.js'


class Editor extends Component {
  constructor(props) {
    super(props);
    this.handleInitialLoad = this.handleInitialLoad.bind(this);
    this.keepViews = this.keepViews.bind(this);
    this.updated = this.updated.bind(this);
    this.createStory = this.createStory.bind(this);
    this.replaceURL = this.replaceURL.bind(this);
    this.state = {
      selected : [],
      isRefreshing : false,
      sentences : [],
      urls : [],
      isLoaded : false

    }
  }
  handleInitialLoad(sentences, urls) {
    this.setState({
      sentences : sentences,
      urls  : urls,
      isLoaded : true
    })
  }
  keepViews(selected){
    updateStory(this.state.sentences, this.state.urls, selected, this.updated)
    this.setState({
      isRefreshing : true
    })
  }
  updated(object){
    this.setState({
      sentences : object['sentences'],
      urls : object['urls'],
      isRefreshing : false
    })
  }
  createStory(){
    this.props.createStory(this.state.sentences, this.state.urls)
  }
  replaceURL(url, index){
    var urls = this.state.urls;
    url = url.replace('.gif', '.mp4', 1);
    urls[index] = url;
    this.setState({
      urls : urls
    })
  }
  render() {
    var showTimeline = (<div></div>)
    var showLoader = (<p></p>)
    if (this.state.isLoaded) {
      showTimeline = (<Timeline
                                replaceURL={this.replaceURL}
                                createStory={this.createStory}
                                refresh={this.keepViews}
                                sentences={this.state.sentences}
                                urls={this.state.urls}></Timeline>);

    }
    if (this.state.isRefreshing){
      showLoader = (<p>Loading...</p>)
    }
    return(
      <div>
        {showLoader}
        {showTimeline}
        <ImportStory createStory={this.handleInitialLoad}></ImportStory>
      </div>
    );
  }


}

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.updateURL = this.updateURL.bind(this);
    this.state = {
      selected : new Array(this.props.sentences.length).fill(false),
      allSelected : false,
      lastSelected : -1
    }
  }

  handleSelect(index){
    var selected = this.state.selected;
    var isSelected = selected[index];
    var lastSelected = index;
    if (isSelected) {
      selected[index] = false;
    } else {
      selected[index] = true;
    }
    for (var i = 0; i < selected.length; i++) {
      if (selected[i]) {
        continue;
      } else {
        this.setState({
          selected : selected,
          allSelected : false,
          lastSelected : lastSelected
        });
        return;
      }
    }

    this.setState({
      selected : selected,
      allSelected : true,
      lastSelected : lastSelected
    })


  }
  handleRefresh(event) {
    event.preventDefault();
    this.props.refresh(this.state.selected)
  }
  handleLoad(event) {
    event.preventDefault();
    this.props.createStory();
  }
  updateURL(url){
    this.props.replaceURL(url, this.state.lastSelected)
  }
  render() {
    var views = loadViews(  this.props.sentences,
                            this.props.urls,
                            this.state.selected,
                            this.handleSelect);

    var showSave = (<div></div>)
    var showRefresh = (<input type="submit" value="refresh gifs"
                              onClick={this.handleRefresh} />)
    var showLoad = (<InsertVideo updateURL={this.updateURL}></InsertVideo>)
    var showGuide = (<p>Click video clips that represent the sentence. Refresh the rest. Repeat.</p>)
    if (this.state.allSelected) {
      showRefresh = (<div></div>)
      showLoad = (<div></div>)
      showSave = (<input type="submit" value="load story"
                         onClick={this.handleLoad} />)
      showGuide = (<p>Go ahead and load it.</p>)
    }
    return(
      <div>
        {showGuide}
        {showRefresh}
        <div>
          {views}
        </div>
        {showLoad}
        {showSave}
      </div>
    );
  }
}

class InsertVideo extends Component {
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      text : ''
    }
  }
  handleSubmit(event){
    event.preventDefault();
    this.props.updateURL(this.state.text)
  }
  handleChange(event){
    event.preventDefault();
    this.setState({
      text : event.target.value
    })
  }
  render() {
    return(
      <form className="reset-alignment" onSubmit={this.handleSubmit}>
        Load gif link: <input type="text" onChange={this.handleChange} value={this.state.text} />
        <input type="submit" value="load gif" />
      </form>
    );
  }
}


var selectedViewStyle = {
  border: '3px solid purple',
}
var nonSelectedViewStyle = {
  border: '0px solid purple',
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
    var selected = nonSelectedViewStyle;
    if (this.props.selected) {
      selected = selectedViewStyle;
    }

    return (
      <div className="board-row">
        <video className="Editor-video"
                onClick={this.onClick}
                style={selected} src={this.props.url} autoPlay loop muted>
        </video>
        <p className='caption'>{this.props.sentence}</p>
      </div>
    );
  }
}

function loadViews(sentences, urls, selected, onClickCallback){

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
                                  selected={selected[i]}
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

function updateStory(sentences, urls, selected, callback) {
  axios.post('/api/update', {
    sentences : sentences,
    urls : urls,
    selected : selected
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



export default Editor;
