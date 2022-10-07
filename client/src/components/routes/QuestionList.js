import React, {useContext} from "react";
import {Alert, Button, ButtonGroup, Spinner, Table, Toast, ToastBody} from "react-bootstrap";
import {Navigate, Link, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../../UserContext";

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class QuestionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {questions: [], questionsLoaded: false,
            firstQuestionId: "", lastQuestionId: "",
            downvoteProcessing: false, upvoteProcessing: false,
            error: undefined};

        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePreviousPage = this.handlePreviousPage.bind(this);
        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }

    async componentDidMount() {
        let searchParams = "";
        if (this.props.searchWords) searchParams = "/search/" + this.props.searchWords;
        if (this.props.searchTags) {
            let tagNames = this.props.searchTags.split(",");
            let promises = [];
            for (let i=0;i<tagNames.length;i++) {
                promises.push(axios.get('http://localhost:8000/tag/name/' + tagNames[i]));
            }

            let tagIdStr = "";
            await Promise.all(promises).then(results => {
                for (let i=0;i<results.length;i++) {
                    if(results[i].status > 200) {
                        this.setState({questionsLoaded: true});
                        return;
                    }
                    tagIdStr += results[i].data;
                    if(i !== results.length-1) tagIdStr += ",";
                }
            });

            searchParams += "/tags/" + tagIdStr;
        }
        axios.get("http://localhost:8000/question/first" + searchParams).then(r => {
            if (r.status === 200) this.setState({firstQuestionId: r.data});
        }).catch(err => this.setState({questionsLoaded: true}));

        axios.get("http://localhost:8000/question/last" + searchParams).then(r => {
            if (r.status === 200) this.setState({lastQuestionId: r.data});
        }).catch(err => this.setState({questionsLoaded: true}));

        axios.get('http://localhost:8000/question' + searchParams).then(r => {
            if (r.status === 200) {
                if (r.data.length === 0) return;
                let progress = [];

                r.data.forEach((q, i) => {
                    q.namedTags = [];
                    progress.push(false);
                    let promises = [];
                    q.tags.forEach(t => {
                        promises.push(
                            axios.get('http://localhost:8000/tag/' + t)
                        );
                    });

                    axios.get('http://localhost:8000/question/score/' + q._id)
                        .then(scoreData => {
                            q.score = scoreData.data
                        });

                    axios.get('http://localhost:8000/u/name/' + q.asked_by)
                        .then(name => {
                            q.asked_by_name = name.data;

                            Promise.all(promises).then(tags => {
                                tags.forEach(t => {
                                    if (t.status === 200) {
                                        q.namedTags.push(t.data);
                                    }
                                })
                            }).then(() => {
                                progress[i] = true;
                                let ret = true;
                                progress.forEach(e => {
                                    ret &= e;
                                })
                                this.setState({questionsLoaded: ret});
                            });
                        });
                });

                this.setState({questions: r.data});
            }
        }).catch(err => this.setState({questionsLoaded: true}));
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.searchWords !== prevProps.searchWords || this.props.searchTags !== prevProps.searchTags) {
            this.componentDidMount();
        }
    }

    handlePreviousPage() {
        if(this.state.questions[0]._id === this.state.firstQuestionId) {
            return;
        }

        this.setState({questionsLoaded: false});
        let firstId = this.state.questions[0]._id;
        axios.get('http://localhost:8000/question/getBefore/' + firstId)
            .then(r => {
                let progress = [];

                r.data.forEach((q, i) => {
                    q.namedTags = [];
                    progress.push(false);
                    let promises = [];
                    q.tags.forEach(t => {
                        promises.push(
                            axios.get('http://localhost:8000/tag/' + t)
                        );
                    });

                    Promise.all(promises).then(tags => {
                        tags.forEach(t => {
                            if(t.status === 200) {
                                q.namedTags.push(t.data);
                            }
                        })
                    }).then(() => {
                        progress[i] = true;
                        let ret = true;
                        progress.forEach(e => {
                            ret &= e;
                        })
                        this.setState({questionsLoaded: ret});
                    });

                });

                this.setState({questions: r.data});
            });
    }

    handleNextPage() {
        if(this.state.questions[this.state.questions.length - 1]._id === this.state.lastQuestionId) {
            return;
        }

        this.setState({questionsLoaded: false});
        let lastId = this.state.questions[this.state.questions.length - 1]._id
        axios.get('http://localhost:8000/question/getAfter/' + lastId)
            .then(r => {
                let progress = [];

                r.data.forEach((q, i) => {
                    q.namedTags = [];
                    progress.push(false);
                    let promises = [];
                    q.tags.forEach(t => {
                        promises.push(
                            axios.get('http://localhost:8000/tag/' + t)
                        );
                    });

                    Promise.all(promises).then(tags => {
                        tags.forEach(t => {
                            if(t.status === 200) {
                                q.namedTags.push(t.data);
                            }
                        })
                    }).then(() => {
                        progress[i] = true;
                        let ret = true;
                        progress.forEach(e => {
                            ret &= e;
                        })
                        this.setState({questionsLoaded: ret});
                    });

                });

                this.setState({questions: r.data});
            });
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
        axios.post('http://localhost:8000/question/upvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.questions.length; i++) {
                        if(this.state.questions[i]._id === id) {
                            this.state.questions[i].score = res.data;
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
        axios.post('http://localhost:8000/question/downvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.questions.length; i++) {
                        if(this.state.questions[i]._id === id) {
                            this.state.questions[i].score = res.data;
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

        if(!this.state.questionsLoaded) {
            return <Spinner animation="border" />
        }

        if(this.state.questions.length === 0) {
            return <Alert variant={"info"}>No Questions</Alert>
        }

        let isFirstPage = this.state.questions[0]._id === this.state.firstQuestionId;
        let isLastPage = this.state.questions[this.state.questions.length - 1]._id === this.state.lastQuestionId;

        this.state.questions.forEach(q => {
            if(q.askedOn) return;
            let d = new Date(Date.parse(q.ask_date_time));
            q.askedOn = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
            let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
            q.askedAt = d.getHours() + ":" + min;
        });

        const questionEntries = this.state.questions.map((question) =>
            <tr className={"tableRow"}>
                <td>
                    <button className={"arrow-up"} onClick={() => this.handleUpvote(question._id)} disabled={this.state.upvoteProcessing}/>
                    <br />
                        {question.score}
                    <br />
                    <button className={"arrow-down"} onClick={() => this.handleDownvote(question._id)} disabled={this.state.downvoteProcessing}/>
                </td>
                <td className={"tableCell"} key={question._id + String(question.views) + String(question.score)}>
                    {question.views} Views <br/>
                    {question.answers.length} Answers
                </td>
                <td className={"tableCell"} key={question._id}>
                    <Link to={`/question/${question._id}`}>{question.title}</Link>
                    <ul>
                        {(question.namedTags).map(tag => {
                            return <li className={"tag"}>{tag.name}</li>
                        })}
                    </ul>
                </td>
                <td className={"tableCell"} key={question.ask_date_time}>
                    Asked By {question.asked_by_name} <br/>
                    On {question.askedOn} <br/>
                    At {question.askedAt}
                </td>
            </tr>
        );

        return (
            <div>
                {this.state.error}
                <Table>
                    <tbody>
                        {questionEntries}
                    </tbody>
                </Table>

                <ButtonGroup>
                    <Button variant={"primary"} disabled={isFirstPage} onClick={this.handlePreviousPage}>Previous Page</Button>
                    <Button variant={"primary"} disabled={isLastPage} onClick={this.handleNextPage}>Next Page</Button>
                </ButtonGroup>
            </div>
        );
    }

}

export default function QuestionListContainer() {
    const navigate = useNavigate();
    const [user] = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const words = searchParams.get("words");
    const tags = searchParams.get("tags");
    return <QuestionList navigate={navigate} user={user} searchWords={words} searchTags={tags}/>
}