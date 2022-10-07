import React, {useContext} from "react";
import {Alert, Button, ButtonGroup, Spinner, Table, Toast, ToastBody} from "react-bootstrap";
import {Navigate, Link, useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../UserContext";

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class CommentListContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {comments: [],
            downvoteProcessing: false, upvoteProcessing: false,
            error: undefined, commentsLoaded: false};

        this.handleUpvote = this.handleUpvote.bind(this);
        this.handleDownvote = this.handleDownvote.bind(this);
    }

    componentDidMount() {
        let url = 'http://localhost:8000/';
        if(this.props.isQuestion) {
            url += 'question/'
        } else {
            url += 'answer/'
        }
        url += this.props.id;
        axios.get(url).then(res => this.setState({comments: res.data, commmentsLoaded: true}));
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
        axios.post('http://localhost:8000/comment/upvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.comments.length; i++) {
                        if(this.state.comments[i]._id === id) {
                            this.state.comments[i].score = res.data;
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
        axios.post('http://localhost:8000/comment/downvote/' + id,{}, {withCredentials: true})
            .then(res => {
                if(res.status > 200) {
                    //this.setState({error: <Alert variant={"danger"}>You cannot vote twice!</Alert>});
                } else if(res.status === 200) {
                    for (let i = 0; i < this.state.comments.length; i++) {
                        if(this.state.comments[i]._id === id) {
                            this.state.comments[i].score = res.data;
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
        if(this.state.comments.length === 0 || !this.state.commentsLoaded) {
            return <AddCommentButton isQuestion={this.props.isQuestion} id={this.props.id}/>
        }



        const commentEntries = this.state.comments.map((comment) =>
            <tr className={"tableRow"}>
                <td key={this.state.answers.score}>
                    <button className={"arrow-up"} onClick={() => this.handleUpvote(comment._id)} disabled={this.state.upvoteProcessing}/>
                    <br />
                    {comment.score}     {comment.by}
                    <br />
                    <button className={"arrow-down"} onClick={() => this.handleDownvote(comment._id)} disabled={this.state.downvoteProcessing}/>
                </td>
                <td className={"tableCell"} colSpan={2}>
                    {comment.text}
                </td>
            </tr>);

        return(
            <div>
                <AddCommentButton isQuestion={this.props.isQuestion} id={this.props.id}/>
                {commentEntries}
            </div>

        );
    }
}

function AddCommentButton(props) {
    return(
        <Button variant={"primary"} as={Link} to={"../addComment/" + props.id + "/?isQuestion=" + props.isQuestion}>
            Add Comment
        </Button>
    );
}

export default function CommentList(props) {
    const navigate = useNavigate();
    const [user] = useContext(UserContext);
    return <CommentListContainer navigate={navigate} user={user} id={props.id} isQuestion={props.isQuestion} />
}