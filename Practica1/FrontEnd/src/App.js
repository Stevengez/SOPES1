import React, {Component} from 'react';
import Calculator from './Components/Calculator';
import Records from './Components/Records';
import 'bootstrap/dist/css/bootstrap.min.css'

export default class App extends Component {

  state = {
    recordsHandler: undefined
  }

  setRecordsHandler = (childHanlder) => {
    this.setState({
      recordsHandler: childHanlder
    });
  }

  render(){
    return (
      <div className='bg-dark'>
        <Calculator addLocalData={this.state.recordsHandler}/>
        <Records setLocalHandler={this.setRecordsHandler}/>
      </div>
    )
  }
}
