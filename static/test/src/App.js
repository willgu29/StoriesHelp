import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <SearchBar></SearchBar>
      </div>
    );
  }
}

//
// class ContentPicker extends Component {
//   render() {
//
//   }
// }
//
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
   this.state = {searchText: ''};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
      this.setState({searchText: event.target.value});
  }
  handleSubmit(event) {
   event.preventDefault();
   //search for gifs/content/yehh this.state.searchText
  }
  render() {
    return (<form onSubmit={this.handleSubmit}>
        <label>
          Search:
          <input type="text" value={this.state.searchText} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>);
  }
}

export default App;
