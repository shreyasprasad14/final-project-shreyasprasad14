import React, {useContext} from "react";
import {Navigate, useNavigate, useParams, useSearchParams} from "react-router-dom";
import {UserContext} from "../../UserContext";
import {Alert, Button, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import axios from "axios";

class AddComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: "", submitError: ""}

        this.handleTextChange = this.handleTextChange.bind(this);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleTextChange(event) {
        this.setState({text: event.target.value});
    }

    handleFormSubmit(event) {
        event.preventDefault()

        if (this.props.user === "Guest") {
            return;
        }

        if (this.state.text.trim().length === 0) {
            this.setState({submitError: "You must have text!"});
            return;
        }

        this.setState({submitError: ""});

        let comment = {
            text: this.state.text
        }
        let isQ = this.props.isQuestion;
        console.log(isQ)
        let url = "http://localhost:8000/answer/addComment/" + this.props.id;
        if(isQ) {
            url = "http://localhost:8000/question/addComment/" + this.props.id;
        }

        console.log(url)

        axios.post("http://localhost:8000/comment/add", comment, {withCredentials: true})
            .then(res => {
                axios.post(url + "/comment/" + res.data)
                    .then(r => {
                        this.props.navigate("../questions/");
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
            error = <Alert variant={"danger"}>Comments cannot be posted by Guest users!</Alert>
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
                    <FormLabel>Comment Text</FormLabel>
                    <FormControl disabled={isGuest} as={"textarea"} required onChange={this.handleTextChange}/>
                </FormGroup>

                <Button variant={"success"} type={"submit"}>Add Answer</Button>
            </Form>
        );
    }
}
export default function AddCommentContainer() {
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const isQuestion = searchParams.get("isQuestion");
    const id = params.id;
    const [user] = useContext(UserContext);
    return <AddComment navigate={navigate} user={user} id={id} isQuestion={isQuestion}/>;
}