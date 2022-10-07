import React, {useContext} from "react";
import {Alert, Button, Spinner, Table} from "react-bootstrap";
import {Link, Navigate, useParams} from "react-router-dom";
import axios from "axios";
import {forEach} from "react-bootstrap/ElementChildren";
import {UserContext} from "../../UserContext";
import AnswerList from "../AnswerList";
import CommentList from "../CommentList";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class QuestionPageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {questionData: {}, dataLoaded: false, answers: []};

        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }

    componentDidMount() {
        axios.post('http://localhost:8000/question/incrementView/' + this.props.questionId);
        axios.get('http://localhost:8000/question/' + this.props.questionId)
            .then((r) => {
                if(r.status === 200) {
                    this.setState({questionData: r.data}, () => {
                        axios.get('http://localhost:8000/question/score/' + this.props.questionId)
                            .then(scoreData => {
                                this.state.questionData.score = scoreData.data
                            });
                        let d = new Date(Date.parse(this.state.questionData.ask_date_time));
                        this.state.questionData.askedOn = monthNames[d.getMonth()] + " " + d.getDate() + " ," + d.getFullYear();
                        this.state.questionData.askedAt = d.getHours() + ":" + d.getMinutes();

                        let promises = []
                        for(let i=0;i<this.state.questionData.answers.length;i++) {
                            promises.push(
                                axios.get('http://localhost:8000/answer/' + this.state.questionData.answers[i])
                            );
                        }
                        axios.get('http://localhost:8000/u/name/' + this.state.questionData.asked_by)
                            .then(name =>  {
                                this.state.questionData.asked_by_name = name.data

                                Promise.all(promises).then((results) => {
                                    results.forEach(r => {
                                        if(r.status === 200) {
                                            this.state.answers.push(r.data);
                                        }
                                    })

                                    let ansUsersPromises = [];
                                    this.state.answers.forEach(a => {
                                        ansUsersPromises.push(
                                            axios.get("http://localhost:8000/u/name/" + a.ans_by)
                                        );
                                    });

                                    Promise.all(ansUsersPromises).then(results => {
                                        for (let i = 0; i < results.length; i++) {
                                            this.state.answers[i].ans_by_name = results[i].data;
                                        }
                                    }).then(() => this.setState({dataLoaded: true}));
                                })
                            });

                    });


                }
            });
    }

    handleUpvote() {
        if(this.props.user === "Guest") {
            this.setState({error:
                    <Alert variant={"danger"}>
                        You must be logged in to vote!
                    </Alert>});
            return;
        }
        this.setState({upvoteProcessing: true});
        axios.post('http://localhost:8000/question/upvote/' + this.props.questionId,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    this.state.questionData.score = res.data;
                    this.setState({error: undefined})
                }
                this.setState({upvoteProcessing: false})
            }).catch(err =>  this.setState({error:
                <Alert variant={"danger"}>
                    Server Error
                </Alert>}));
    }

    handleDownvote() {
        if(this.props.user === "Guest") {
            this.setState({error:
                    <Alert variant={"danger"}>
                        You must be logged in to vote!
                    </Alert>});
            return;
        }
        this.setState({downvoteProcessing: true});
        axios.post('http://localhost:8000/question/downvote/' + this.props.questionId,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    this.state.questionData.score = res.data;
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
            return <Navigate to={"../"}/>
        }
        if(!this.state.dataLoaded) {
            return <Spinner animation="border" />
        }

        return (
            <Table>
                <thead>
                    <tr>
                        <th className={"tableSide"}>{this.state.questionData.answers.length} Answers</th>
                        <th className={"tableMain"}>{this.state.questionData.title}</th>
                        <th className={"tableSide"}>
                            <Button as={Link} to={"../addAnswer/" + this.props.questionId} variant={"primary"}>Add Answer</Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={"tableRow"}>
                        <td key={this.state.questionData.score}>
                            <button className={"arrow-up"} onClick={() => this.handleUpvote()} disabled={false}/>
                            <br />
                            {this.state.questionData.score}
                            <br />
                            <button className={"arrow-down"} onClick={() => this.handleDownvote()} disabled={false}/>
                        </td>
                        <td className={"tableCell"}>{this.state.questionData.views} Views</td>
                        <td className={"tableCell"}>{this.state.questionData.text}</td>
                        <td className={"tableCell"}>
                            Asked By {this.state.questionData.asked_by_name} <br/>
                            On {this.state.questionData.askedOn} <br/>
                            At {this.state.questionData.askedAt}
                        </td>
                    </tr>
                    <div className={"commentSection"}>
                        <CommentList id={this.props.questionId} isQuestion={true}/>
                    </div>
                    <AnswerList answerList={this.state.answers}/>
                </tbody>
            </Table>
        )
    }
}

export default function QuestionPage() {
    const [user] = useContext(UserContext);
    let params = useParams();
    let questionId = params.questionId;
    return (
        <QuestionPageContainer questionId={questionId} user={user}/>
    );
}