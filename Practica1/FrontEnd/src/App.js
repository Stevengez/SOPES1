import React, {Component} from 'react';
import logo from './logo.svg';
import {API_SERVER, API_PORT} from './Config/credentials';

import './App.css';

export default class App extends Component {

  constructor(){
    super();
    this.message = <p>Edit <code>src/App.js</code> and save to reload.</p>;
  }

  componentDidMount() {
    this.callApi().then((res) => {
      console.log(res);
    });
  }

  callApi = async () => {
    const requestOpions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json'}
    };
    console.log(`Sending request to: ${API_SERVER}:${API_PORT}/getRecords/`);
    const response = await fetch(`${API_SERVER}:${API_PORT}/getRecords/`,requestOpions);
    const body = await response.json();

    if(response.status !== 200){
      throw Error(body.message)
    }
    return body;

  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.message}
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    )
  }
}
