import React, {useContext} from "react";
import {Button} from "react-bootstrap";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import {UserContext} from "../../UserContext";

class Home extends React.Component{
    constructor(props) {
        super(props);
        this.state = {redirect: ""};

        this.handleGuest = this.handleGuest.bind(this);
    }

    componentDidMount() {
        axios.get('http://localhost:8000/u/getUser', {withCredentials: true})
            .then(res => {
                if(res.data.username) {
                    this.props.setUser(res.data.username);
                    this.setState({redirect: "../user/" + res.data.username})
                } else {
                }
            }).catch(err => console.log(err));
    }

    handleGuest() {
        this.props.setUser("Guest");
        this.setState({redirect: "../questions"});
    }

    render() {
        if(this.state.redirect) {
            this.props.navigate(this.state.redirect);
        }
        return (
            <div>
                <Button variant={"primary"} size={"lg"} as={Link} to={"../login"}>Log-In</Button>
                <Button variant={"primary"} size={"lg"} as={Link} to={"../register"}>Register</Button>
                <Button variant={"secondary"} size={"lg"} onClick={this.handleGuest}>Continue as Guest</Button>
            </div>
        );
    }
}

export default function HomeContainer() {
    const navigate = useNavigate();
    const [user, setUser] = useContext(UserContext);
    return <Home navigate={navigate} setUser={setUser}/>
}