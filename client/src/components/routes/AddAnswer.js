import React, {useContext} from "react";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {UserContext} from "../../UserContext";
import {Alert, Button, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import axios from "axios";

const MAX_TITLE_LEN = 50;
const MAX_SUMMARY_LEN = 140;

class AddAnswer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: "", submitError: ""}

        this.handleTextChange = this.handleTextChange.bind(this);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleTextChange(event) {
        this.setState({text: event.target.value});
    }

    async handleFormSubmit(event) {
        event.preventDefault()

        if (this.props.user === "Guest") {
            return;
        }

        if (this.state.text.trim().length === 0) {
            this.setState({submitError: "You must have text!"});
            return;
        }

        this.setState({submitError: ""});

        let answer = {
            text: this.state.text
        }

        axios.post("http://localhost:8000/answer/add", answer, {withCredentials: true})
            .then(res => {
                axios.post("http://localhost:8000/question/addAnswer/" + this.props.questionId + "/ans/" + res.data)
                    .then(r => {
                        this.props.navigate("../question/" + this.props.questionId);
                    })
            }).catch(err => console.log(err));
    }

    render() {
        if(!this.props.user) {
            return <Navigate to={"../"} />
        }

        const isGuest = this.props.user === "Guest";

        let error = undefined;
        if(isGuest) {
            error = <Alert variant={"danger"}>Questions cannot be posted by Guest users!</Alert>
        }

        let submitError = undefined;
        if(this.state.submitError) {
            submitError = <Alert variant={"danger"}>{this.state.submitError}</Alert>
        }

        return (
            <Form onSubmit={this.handleFormSubmit}>
                {submitError}
                {error}

                <FormGroup controlId={"askQ.text"}>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl disabled={isGuest} as={"textarea"} required onChange={this.handleTextChange}/>
                </FormGroup>

                <Button variant={"success"} type={"submit"}>Add Answer</Button>
            </Form>
        );
    }
}
export default function AddAnswerContainer() {
    const navigate = useNavigate();
    const params = useParams();
    const questionId = params.questionId;
    const [user] = useContext(UserContext);
    return <AddAnswer navigate={navigate} user={user} questionId={questionId} />;
}