import React, {useContext} from "react";
import {Alert, Button, ButtonGroup, Spinner, Table, Toast, ToastBody} from "react-bootstrap";
import {Navigate, Link, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../UserContext";
import CommentList from "./CommentList";

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class AnswerListContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {answers: this.props.answers,
            downvoteProcessing: false, upvoteProcessing: false,
            error: undefined};

        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }

    handleUpvote(id) {
        if(this.props.user === "Guest") {
            this.setState({error:
                    <Alert variant={"danger"}>
                        You must be logged in to vote!
                    </Alert>});
            return;
        }
        this.setState({upvoteProcessing: true});
        axios.post('http://localhost:8000/answer/upvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.answers.length; i++) {
                        if(this.state.answers[i]._id === id) {
                            this.state.answers[i].score = res.data;
                            break;
                        }
                    }
                    this.setState({error: undefined})
                }
                this.setState({upvoteProcessing: false})
            }).catch(err =>  this.setState({error:
                <Alert variant={"danger"}>
                    Server Error
                </Alert>}));
    }

    handleDownvote(id) {
        if(this.props.user === "Guest") {
            this.setState({error:
                    <Alert variant={"danger"}>
                        You must be logged in to vote!
                    </Alert>});
            return;
        }
        this.setState({downvoteProcessing: true});
        axios.post('http://localhost:8000/answer/downvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.answers.length; i++) {
                        if(this.state.answers[i]._id === id) {
                            this.state.answers[i].score = res.data;
                            break;
                        }
                    }
                    this.setState({error: undefined})
                }
                this.setState({downvoteProcessing: false})
            }).catch(err =>  this.setState({error:
                <Alert variant={"danger"}>
                    Server Error
                </Alert>}));
    }



    render() {
        if(!this.props.user) {
            return <Navigate to={"../"} />
        }

        if(this.state.answers.length === 0) {
            return <Alert variant={"info"}>No Questions</Alert>
        }

        this.state.answers.forEach(a => {
            if(a.ansOn) return;
            let d = new Date(Date.parse(a.ans_date_time));
            a.ansOn = monthNames[d.getMonth()] + " " + d.getDate() + " ," + d.getFullYear();
            a.ansAt = d.getHours() + ":" + d.getMinutes();
        });
        const questionEntries = this.state.answers.map((ans) =>
            <tr className={"tableRow"}>
                <td key={this.state.answers.score}>
                    <button className={"arrow-up"} onClick={() => this.handleUpvote(ans._id)} disabled={this.state.upvoteProcessing}/>
                    <br />
                    {ans.score}
                    <br />
                    <button className={"arrow-down"} onClick={() => this.handleDownvote(ans._id)} disabled={this.state.downvoteProcessing}/>
                </td>
                <td className={"tableCell"} key={ans.ansAt} colSpan={2}>
                    {ans.text}
                </td>
                <td className={"tableCell"} key={ans.ans_by_name} colSpan={1}>
                    <CommentList id={ans._id} isQuestion={false}/> <br />
                    Ans By {ans.ans_by_name} <br/>
                    On {ans.ansOn} <br/>
                    At {ans.ansAt}
                </td>
            </tr>);
        return(
            questionEntries
        );
    }

}

export default function AnswerList(props) {
    const navigate = useNavigate();
    const [user] = useContext(UserContext);
    return <AnswerListContainer navigate={navigate} user={user} answers={props.answerList}/>
}