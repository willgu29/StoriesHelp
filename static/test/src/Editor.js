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
  render() {
    var showTimeline = (<div></div>)
    var showLoader = (<p></p>)
    if (this.state.isLoaded) {
      showTimeline = (<Timeline
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
    this.state = {
      selected : new Array(this.props.sentences.length).fill(false),
      allSelected : false
    }
  }

  handleSelect(i){
    var selected = this.state.selected;
    var isSelected = selected[i];
    if (isSelected) {
      selected[i] = false;
    } else {
      selected[i] = true;
    }
    for (var i = 0; i < selected.length; i++) {
      if (selected[i]) {
        continue;
      } else {
        this.setState({
          selected : selected,
          allSelected : false
        });
        return;
      }
    }

    this.setState({
      selected : selected,
      allSelected : true
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
  render() {
    var views = loadViews(  this.props.sentences,
                            this.props.urls,
                            this.state.selected,
                            this.handleSelect);

    var showSave = (<div></div>)
    var showRefresh = (<input type="submit" value="refresh gifs"
                              onClick={this.handleRefresh} />)
    if (this.state.allSelected) {
      showRefresh = (<div></div>)
      showSave = (<input type="submit" value="load story"
                         onClick={this.handleLoad} />)
    }
    return(
      <div>
        {showRefresh}
        <div>
          {views}
        </div>
        {showSave}
      </div>
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
  for (var i = 0 ; i < urls.length; i++) {
    var typeDisplay = (<div></div>);
    var url = urls[i];
    url = url.replace('.gif', '.mp4', 1)
    if (url.indexOf('.mp4') !== -1) {
      typeDisplay = (<VideoDisplay
                                  index={i}
                                  key={i}
                                  url={url}
                                  selected={selected[i]}
                                  onClick={onClickCallback}
                                  sentence={sentences[i]}>
                                      </VideoDisplay>);
    } else {
      typeDisplay = (<div></div>)
    }
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
