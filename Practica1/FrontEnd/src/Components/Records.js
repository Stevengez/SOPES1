import React, {Component} from 'react';
import simpletime from 'simpletime';
import DataTable from 'react-data-table-component';
import { API_SERVER, API_PORT } from '../Config/credentials';



export default class Records extends Component {

    state = {
        data: []
    };

    constructor(props){
        super(props);

        this.columns = [
            {
                name: 'Timestamp',
                selector: row => simpletime.applyFormatDate(row.timestamp, "d/M/yy h:mm")
            },
            {
                name: 'Left',
                selector: row => row.left
            },
            {
                name: 'Operation',
                selector: row => row.operator
            },

            {
                name: 'Right',
                selector: row => row.right
            },
            {
                name: 'Result',
                selector: row => {
                    switch(row.operator){
                        case "+":
                            return (row.left+row.right).toString();
                        case "-":
                            return (row.left-row.right).toString();
                        case "*":
                            return (row.left*row.right).toString();
                        case "/":
                            return (row.left/row.right).toString();
                        default:
                            return "Syntax Error";
                    }
                }
            },
            
        ];

        this.getRecordsFromAPI().then((result) => {
            let opList = [];
            result.forEach((item) => {
                opList.unshift({
                    left: item.left,
                    right: item.right,
                    operator: item.operator,
                    timestamp: item.timestamp
                });
            });

            this.setState({
                data: opList
              });
        });
    }



    componentDidMount(){
        this.props.setLocalHandler(this.addLocalOperation);
    }

    getRecordsFromAPI = async () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type':'application/json'}
        }

        const response = await fetch(`${API_SERVER}:${API_PORT}/getRecords/`, requestOptions);
        const result = await response.json();
        return result;
    }

    addLocalOperation = (newOperation) => {
        console.log("new entry:", newOperation);
        let newData = [...this.state.data];
        newData.unshift(newOperation);
        
        this.setState({
            data: newData
        })
    }

    render(){
        return(
            <div>
                <DataTable pagination columns={this.columns} data={this.state.data}/>
            </div>
        );
    }
}