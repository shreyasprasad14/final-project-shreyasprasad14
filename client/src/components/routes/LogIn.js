import React, {useContext} from "react";
import {Alert, Button, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {UserContext} from "../../UserContext";

class LogIn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error: "", email: "", password: "", username: ""};

        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleFormSubmission = this.handleFormSubmission.bind(this);
    }

    handleEmailChange(event) {
        this.setState({email: event.target.value});
    }

    handlePasswordChange(event) {
        this.setState({password: event.target.value});
    }

    handleFormSubmission(event) {
        let data = {
            email: this.state.email,
            password: this.state.password
        }
        axios.post("http://localhost:8000/u/login", data, {withCredentials: true})
            .then(res => {
                this.setState({error: ""});
                this.setState({username: res.data.username})
                this.props.setUser(res.data.username);
                this.props.navigate("../questions");
            }).catch(err => this.setState({error: "Incorrect Username or Password!"}));

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

                <FormGroup controlId={"formPassword"}>
                    <FormLabel>Password</FormLabel>
                    <FormControl type={"password"} name={"password"} onChange={this.handlePasswordChange} required/>
                </FormGroup>

                <Button variant={"primary"} type={"submit"}>Log In</Button>
            </Form>
        );
    }
}

export default function LogInContainer(props) {
    const navigate = useNavigate();
    const [user, setUser] = useContext(UserContext);
    return <LogIn navigate={navigate} user={user} setUser={setUser}/>
}