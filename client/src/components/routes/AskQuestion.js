import React, {useContext} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {UserContext} from "../../UserContext";
import {Alert, Button, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap";
import axios from "axios";

const MAX_TITLE_LEN = 50;
const MAX_SUMMARY_LEN = 140;

class AskQuestion extends React.Component {
    constructor(props) {
        super(props);
        this.state = {title: "", summary: "", text: "", tags: "", submitError: ""}

        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleSummaryChange = this.handleSummaryChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);

        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleTitleChange(event) {
        this.setState({title: event.target.value});
    }

    handleSummaryChange(event) {
        this.setState({summary: event.target.value});
    }

    handleTextChange(event) {
        this.setState({text: event.target.value});
    }

    handleTagChange(event) {
        this.setState({tags: event.target.value});
    }

    async handleFormSubmit(event) {
        event.preventDefault()

        if (this.props.user === "Guest") {
            return;
        }

        if (this.state.title.length > MAX_TITLE_LEN) {
            this.setState({submitError: "Title length cannot be greater than 50 characters"});
            return;
        }

        if (this.state.summary.trim().length > MAX_SUMMARY_LEN) {
            this.setState({submitError: "Summary length cannot be greater than 140 characters"});
            return;
        }

        if (this.state.title.trim().length === 0) {
            this.setState({submitError: "You must have a title!"});
            return;
        }
        if (this.state.summary.trim().length === 0) {
            this.setState({submitError: "You must have a summary!"});
            return;
        }
        if (this.state.text.trim().length === 0) {
            this.setState({submitError: "You must have text!"});
            return;
        }
        if (this.state.tags.trim().length === 0) {
            this.setState({submitError: "You must have a tag!"});
            return;
        }

        let canMakeNewTags;

        let tagList = this.state.tags.split(" ");
        let tagIdList = [];
        await axios.get("http://localhost:8000/u/reputation", {withCredentials: true}).then(res => {
            if(res.status === 200) canMakeNewTags = res.data >= 100;
            else  {
                this.setState({submitError: "Server Error"});
            }
        }).catch(err => console.log(err));

        let promises = [];
        for (let i=0;i<tagList.length;i++) {
           promises.push(axios.get("http://localhost:8000/tag/name/" + tagList[i].toLowerCase()))
        }

        let reputationError = false;
        let tagsToAdd = [];
        await Promise.all(promises).then(results => {
            for (let i=0;i<results.length;i++) {
                console.log(results[i])
                if (results[i].status === 200) tagIdList.push(results[i].data);
                else {
                    if (!canMakeNewTags) {
                        reputationError = true;
                        return;
                    }
                    tagsToAdd.push(results[i].data);
                }
            }
        });

        if(reputationError) {
            this.setState({submitError: "You must have at least 100 reputation to make a new tag!"});
            return;
        }

        this.setState({submitError: ""});

        if(tagsToAdd.length > 0) {
            let tagPromises = [];
            tagsToAdd.forEach(name => {
                tagPromises.push(axios.post("http://localhost:8000/tag/add/" + name,{}, {withCredentials: true}));
            })

            console.log(tagPromises)

            Promise.all(tagPromises).then(results => {
                results.forEach(result => {
                    tagIdList.push(result.data);
                    console.log(result)
                });

                let question = {
                    title: this.state.title,
                    summary: this.state.summary,
                    text: this.state.text,
                    tagList: tagIdList
                }

                console.log(question)

                axios.post("http://localhost:8000/question/add", question, {withCredentials: true})
                    .then(res => {
                        this.props.navigate("../questions");
                    }).catch(err => console.log(err));
            });
        } else {
            let question = {
                title: this.state.title,
                summary: this.state.summary,
                text: this.state.text,
                tagList: tagIdList
            }

            console.log(question)

            axios.post("http://localhost:8000/question/add", question, {withCredentials: true})
                .then(res => {
                    this.props.navigate("../questions");
                }).catch(err => console.log(err));
        }



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

              <FormGroup controlId={"askQ.title"}>
                  <FormLabel>Question Title</FormLabel>
                  <FormControl disabled={isGuest} required onChange={this.handleTitleChange}/>
              </FormGroup>

              <FormGroup controlId={"askQ.summary"}>
                  <FormLabel>Question Summary</FormLabel>
                  <FormControl disabled={isGuest} as={"textarea"} required onChange={this.handleSummaryChange}/>
              </FormGroup>

              <FormGroup controlId={"askQ.text"}>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl disabled={isGuest} as={"textarea"} required onChange={this.handleTextChange}/>
              </FormGroup>

              <FormGroup controlId={"askQ.tags"}>
                  <FormLabel>Tags</FormLabel>
                  <FormControl disabled={isGuest} required onChange={this.handleTagChange}/>
              </FormGroup>

              <Button variant={"success"} type={"submit"}>Ask Question</Button>
          </Form>
        );
    }
}
export default function AskQuestionContainer() {
    const navigate = useNavigate();
    const [user] = useContext(UserContext);
    return <AskQuestion navigate={navigate} user={user}/>;
}