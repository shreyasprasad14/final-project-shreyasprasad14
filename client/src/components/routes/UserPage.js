import React, {useContext} from "react";
import {UserContext} from "../../UserContext";
import {Link, useParams} from "react-router-dom";
import {Alert} from "react-bootstrap";
import axios from "axios";

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reputation: 0, questions: [], tags: [], createDate: undefined,
            createTime: undefined, questionsAnswered: [], tagsCreated: []}
    }

    componentDidMount() {
        axios.get("http://localhost:8000/u/createTime/" + this.props.username)
            .then(res => {
                if(res.status === 200) {
                    let d = new Date(Date.parse(res.data));
                    let date = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
                    let min = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
                    let time = d.getHours() + ":" + min;
                    this.setState({createDate: date, createTime: time});
                }
            });

        axios.get("http://localhost:8000/u/reputation", {withCredentials: true})
            .then(res => {
                if(res.status === 200) this.setState({reputation: res.data});
            });

        axios.get("http://localhost:8000/question/by/" + this.props.username)
            .then(res => {
                if(res.status === 200) this.setState({questions: res.data});
            }).catch(err => console.log(err));

        axios.get("http://localhost:8000/answer/by/" + this.props.username)
            .then(res => {
                if(res.status === 200) {
                    this.setState({questionsAnswered: res.data})
                }
            }).catch(err => console.log(err));

        axios.get("http://localhost:8000/tag/by/" + this.props.username)
            .then(res => {
                if(res.status === 200) {
                    this.setState({tagsCreated: res.data})
                }
            }).catch(err => console.log(err));

    }

    render() {
        if(this.props.loggedInUser !== this.props.username) {
            return <Alert variant={"danger"}>You are not authorized to view this page!</Alert>
        }

        const questionList = this.state.questions.map(q => {
            return(
            <li>
                <Link to={"../question/" + q.id}>{q.title}</Link>
            </li>
            );
        });

        const answerList = this.state.questionsAnswered.map(q => {
            return(
                <li>
                    <Link to={"../question/" + q.id}>{q.title}</Link>
                </li>
            );
        });

        const tagList = this.state.tagsCreated.map(t => {
            return(
                <li>
                    <Link to={"../questions?tags=" + t.name}>{t.name}</Link>
                </li>
            );
        });

        return (
            <div>
                <h1>{this.props.username}</h1>
                <h3>Since {this.state.createDate} @ {this.state.createTime}</h3>
                <h3>{this.state.reputation}</h3>

                <br />

                <h3>Questions</h3>
                <ul>
                    {questionList}
                </ul>

                <br />

                <h3>Questions Answered</h3>
                <ul>
                    {answerList}
                </ul>

                <br />

                <h3>Tags Created</h3>
                <ul>
                    {tagList}
                </ul>


            </div>
        );
    }
}




export default function UserPageContainer() {
    const [user] = useContext(UserContext);
    let params = useParams();
    let username = params.username;
    return <UserPage username={username} loggedInUser={user}/>;
}