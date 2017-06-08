import React, { Component } from 'react';
import axios from 'axios'

class ImportStory extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.createStory = this.createStory.bind(this);
    this.state = {isLoading : false,
                  isLoaded : false,
                  text : ''};
  }

  handleSubmit(event) {
    event.preventDefault();
    generateStory(this.state.text, this.createStory)
    this.setState({isLoading : true})
  }
  handleChange(event) {
    event.preventDefault();
    this.setState({text: event.target.value});

  }
  createStory(object) {
    var sentences = object['sentences']
    var urls = object['urls']
    this.props.createStory(sentences, urls)
    this.setState({isLoading : false,
                   isLoaded : true,
                   text : ''})
  }


  render() {
    var showInput = (<input type="submit" value="generate story" />)
    var showSpinner = (<p></p>);
    var showGuide = (<p>Copy and paste your story here.</p>);
    if (this.state.isLoading) {
      showGuide = (<div></div>);
      showSpinner = (<p>Loading... this may take a minute or two</p>);
    }
    if (this.state.isLoaded) {
      return (<div></div>)
    }
    if (this.state.text == ''){
      showInput = (<div></div>)
    }
    return (
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



function generateStory(textBlob, callback) {
  axios.post('/api/generate', {
    story: textBlob,
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



export default ImportStory;
