import React, {Component} from 'react';
import {
    Toast,
    ToastHeader,
    ToastBody,
    Row,
    Col,
    Button,
    Container,
    Input
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_SERVER, API_PORT } from '../Config/credentials';


export default class Calculator extends Component {

    state = {
        left: "",
        right: "",
        operator: "",
        iswaiting: false,
        isresult: false
    };

    clearCalc = () => {
        this.setState({
            left: "",
            right: "",
            operator: "",
            iswaiting: false,
            isresult: false
        })
    }

    addDigit = (digit) =>{
        if(this.state.iswaiting){
            //Right
            this.setState({
                right: this.state.right+digit
            });
        }else{
            //Left
            this.setState({
                left: this.state.left+digit
            });
        }
    }

    setNegative = () => {
        if(this.state.iswaiting){
            //Right
            if(this.state.right === ""){
                this.addDigit("-");
                return false;
            }
            return true;
        }else{
            //Left
            if(this.state.left === ""){
                this.addDigit("-");
                return false;
            }
            return true;
        }
    }

    setOperator = (operator) => {
        if(this.state.operator === ""){
            if(operator === "-"){
                if(this.setNegative()){
                    this.setState({
                        operator: operator,
                        iswaiting: true
                    });
                }
            }else{
                if(this.state.left !== "" && this.state.left !== "-"){
                    this.setState({
                        operator: operator,
                        iswaiting: true
                    });
                }
            }
        }else{
            if(operator === "-" && this.state.right === ""){
                if(this.setNegative()){
                    this.setState({
                        operator: operator,
                        iswaiting: true
                    });
                }
            }else{
                if(this.state.right === ""){
                    this.setState({
                        operator: operator,
                        iswaiting: true
                    });
                }
            }
        }
    }

    setDecimal = () => {
        if(this.state.iswaiting){
            //right
            if(!this.state.right.includes(".")){
                this.addDigit(".");
            }
        }else{
            //left
            if(!this.state.left.includes(".")){
                this.addDigit(".");
            }
        }
    }

    setResult = () => {
        if(this.state.iswaiting){
            const l = parseFloat(this.state.left);
            const r = parseFloat(this.state.right);
            const o = this.state.operator;
            let result = "";

            switch(this.state.operator){
                case "+":
                    result = (l+r).toString();
                    break;
                case "-":
                    result = (l-r).toString();
                    break;
                case "*":
                    result = (l*r).toString();
                    break;
                case "/":
                    result = (l/r).toString(); 
                    break;
                default:
                    result = "0"; 
                    break;
            }

            this.pushResult(l, r, o);

            this.setState({
                left: result,
                right: "",
                operator: "",
                iswaiting: false,
                isresult: false
            });
        }
    }

    pushResult = async (left, right, operator) => {
        const body = {
            left: parseFloat(left),
            right: parseFloat(right),
            operator: operator
        };

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
        
        const response = await fetch(`${API_SERVER}:${API_PORT}/addOperation/`, requestOptions);
        const json = await response.json();

        if(json.InsertedID !== "" && this.props.addLocalData !== undefined){
            this.props.addLocalData({
                left: parseFloat(left),
                right: parseFloat(right),
                operator: operator,
                timestamp: Date()
            });
        }
    }

    render() {
        return <div className='bg-dark p-3 m-2 rounded'>
            <Toast>
                <ToastHeader className='bg-secondary'>
                    <Input 
                        bsSize='lg'
                        placeholder='0'
                        size={100} 
                        className='border-0 bg-secondary text-light'
                        disabled
                        value= { 
                            this.state.iswaiting ? (this.state.operator+" "+this.state.right) : this.state.left
                        }
                    />
                </ToastHeader>
                <ToastBody className='bg-danger'>
                    <Row className='align-items-center'>
                        <Col>
                            <Button color='danger' onClick={() => this.setOperator("+")}>+</Button>
                        </Col>
                        <Col>
                            <Button color='danger' onClick={() => this.setOperator("-")}>-</Button>
                        </Col>
                        <Col>
                            <Button color='danger' onClick={() => this.setOperator("*")}>*</Button>
                        </Col>
                        <Col>
                            <Button color='danger' onClick={() => this.setOperator("/")}>/</Button>
                        </Col>
                        <Col>
                            <Button color='danger' onClick={() => this.clearCalc()}>C</Button>
                        </Col>
                    </Row>
                </ToastBody>
                <ToastBody className='bg-secondary'>
                    <Container>
                        <Row>
                            <Col>
                                <Button block onClick={() => this.addDigit("1")}>1</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("2")}>2</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("3")}>3</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Button block onClick={() => this.addDigit("4")}>4</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("5")}>5</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("6")}>6</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Button block onClick={() => this.addDigit("7")}>7</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("8")}>8</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.addDigit("9")}>9</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Button block onClick={() => this.addDigit("0")}>0</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.setDecimal()}>.</Button>
                            </Col>
                            <Col>
                                <Button block onClick={() => this.setResult()}>=</Button>
                            </Col>
                        </Row>
                    </Container>
                </ToastBody>
            </Toast>
        </div>
    }
}