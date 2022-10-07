import React from "react";
import {Alert, Button, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import axios from "axios";
import {useNavigate} from "react-router-dom";

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {error: "", email: "", username: "", password: ""};

        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleFormSubmission = this.handleFormSubmission.bind(this);
    }

    handleEmailChange(event) {
        this.setState({email: event.target.value});
    }

    handleUsernameChange(event) {
        this.setState({username: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleFormSubmission(event) {
        let data = {
            email: this.state.email,
            username: this.state.username,
            password: this.state.password
        }

        if(data.username === "Guest") {
            this.setState({error: "This username is reserved."});
            event.preventDefault();
            return;
        }

        if(data.password.includes(data.username)) {
            this.setState({error: "Your password cannot contain your username!"});
            event.preventDefault();
            return;
        }

        if(data.password.includes(data.email.split("@")[0])) {
            this.setState({error: "Your password cannot contain your email id!"});
            event.preventDefault();
            return;
        }

        axios.post("http://localhost:8000/u/register", data)
            .then(res => {
                if(res.status === 201) {
                    this.setState({error: ""});
                    this.props.navigate("../login");
                } else if(res.status === 206) {
                    this.setState({error: "User with this email already exists!"});
                } else if (res.status === 207) {
                    this.setState({error: "User with this username already exists!"});
                }
            }).catch(err => console.log(err));
        event.preventDefault();
    }


    render() {
        let err = this.state.error ? <Alert variant={"danger"}>{this.state.error}</Alert> : null;
        return (
            <Form onSubmit={this.handleFormSubmission}>
                {err}
                <FormGroup controlId={"formEmail"}>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl type={"email"} name={"email"} onChange={this.handleEmailChange} required/>
                </FormGroup>

                <FormGroup controlId={"formUsername"}>
                    <FormLabel>Username</FormLabel>
                    <FormControl type={"username"} name={"username"} onChange={this.handleUsernameChange} required/>
                </FormGroup>

                <FormGroup controlId={"formPassword"}>
                    <FormLabel>Password</FormLabel>
                    <FormControl type={"password"} name={"password"} onChange={this.handlePasswordChange} required/>
                </FormGroup>

                <Button variant={"primary"} type={"submit"}>Register</Button>
            </Form>
        );
    }
}

export default function RegisterContainer(props) {
    const navigate = useNavigate();
    return <Register navigate={navigate} />
}