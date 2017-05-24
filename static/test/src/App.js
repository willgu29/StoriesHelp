import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <ContentViews></ContentViews>
      </div>
    );
  }
}

class TypeStory extends Component {
  constructor(props) {
   super(props);
   this.state = {storyText: ''};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
      this.setState({storyText: event.target.value});
  }
  handleSubmit(event) {
   event.preventDefault();
   //Fetch 3 contentURLS, abstract a "slide"
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <textarea value={this.state.storyText} onChange={this.handleChange}></textarea>
        </label>
        <input type="submit" value="add sentence" />
      </form>

    );
  }
}

class GifView extends Component {

  render() {
    return (

      <img class="gifDisplay" style="border-color : purple;" width="340"
        onClick={() => this.props.onClick()}
        src={this.props.url} />
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
    this.state = {contentURLS : Array(3).fill(null), };
    this.handleSelect = this.handleSelect.bind(this);
  }
  componentWillMount() {
    axios.get('localhost:5000/api/gifs?searchText={this.state.searchText}')
       .then(res => {
         const contentURLS = res.data
         alert(contentURLS)
         this.setState({contentURLS : contentURLS});
       });
  }

  renderURL(i) {
    var url = this.state.contentURLS[i];
    if (url == null) {
      return (<div></div>)
    }
    if (url.indexOf('.gif') !== -1) {
      return (<GifView   url={this.state.contentURLS[i]}
              onClick={() => this.handleSelect(i)} />);

    } else if (url.indexOf(".mp4") !== -1) {
      //is video
    } else {
      //is image
      return (<div></div>);
    }

  }
  handleSelect(i) {
    alert(i)
  }

  render() {
    return (
    <div className="board-row">
      {this.renderURL(0)}
      {this.renderURL(1)}
      {this.renderURL(2)}
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
   this.state = {searchText: ''};
   this.handleChange = this.handleChange.bind(this);
   this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
      this.setState({searchText: event.target.value});
  }
  handleSubmit(event) {
   event.preventDefault();
   axios.get('https://penguinjeffrey.herokuapp.com/api/gifs?searchText={this.state.searchText}')
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
          <input type="text" value={this.state.searchText} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default App;
