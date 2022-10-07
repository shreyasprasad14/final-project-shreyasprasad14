import React, {useContext} from 'react';
import {Link, Outlet, useNavigate} from "react-router-dom";
import {Button, Container, Form, FormControl, Nav, Navbar, NavbarBrand, NavLink} from "react-bootstrap";
import {UserContext} from "../UserContext";
import axios from "axios";

class NavMenu extends React.Component{
    constructor(props) {
        super(props);
        this.state = {searchQuery:"", user: ""}

        this.handleQueryChanged = this.handleQueryChanged.bind(this);
        this.searchQuery = this.searchQuery.bind(this);

        this.handleLogOut = this.handleLogOut.bind(this);
        this.handleLogInRoute = this.handleLogInRoute.bind(this);
    }

    handleQueryChanged(event) {
        this.setState({searchQuery: event.target.value})
    }

    searchQuery(event) {
        let words = this.state.searchQuery.split(" ");

        let searchWords = []
        let searchTags = []

        words.forEach(w => {
            if(w[0] === '[' && w[w.length-1] === ']') {
                searchTags.push(w.slice(1, -1).toLowerCase());
            } else {
                searchWords.push(w);
            }
        });

        let searchParams = "";
        if(searchWords.length > 0 && searchWords[0] !== '') {
            searchParams = "?words=" + searchWords.toString();
            if(searchTags.length > 0) searchParams += "&tags=" + searchTags.toString();
        }else if(searchTags.length > 0) {
            searchParams = "?tags=" + searchTags.toString();
        }

        this.props.navigate("../questions/" + searchParams);

        event.preventDefault();
    }

    handleLogOut(event) {
        axios.get('http://localhost:8000/u/logout', {withCredentials: true})
            .then(res => {
                this.props.setUser("");
                this.setState({user: ""});
                this.props.navigate("./")
            });

        event.preventDefault();
    }

    handleLogInRoute(event) {
        this.props.navigate("../");
        event.preventDefault();
    }

    render() {
        let signIn = (
            <Form className={"d-flex"} onSubmit={this.handleLogInRoute}>
                <Navbar.Text>
                    Not Logged In
                </Navbar.Text>
                <Button variant={"primary"} type={"submit"}>
                    Log In/Register
                </Button>
            </Form>

        );
        let logOutButton = undefined;
        if(this.props.user) {
            if(this.props.user !== "Guest") {
                let userLink = <Link to={"../user/" + this.props.user}>{this.props.user}</Link>
                signIn = (
                    <Navbar.Text>
                        Signed in as: {userLink}
                    </Navbar.Text>
                );

                logOutButton = (
                    <Form className={"d-flex"} onSubmit={this.handleLogOut}>
                        <Button variant={"outline-danger"} type={"submit"}>
                            Logout
                        </Button>
                    </Form>
                );
            } else {
                signIn = (
                    <Form className={"d-flex"} onSubmit={this.handleLogInRoute}>
                        <Navbar.Text>
                            Signed in as: Guest
                        </Navbar.Text>
                        <Button variant={"primary"} type={"submit"}>
                            Log In/Register
                        </Button>
                    </Form>
                );
            }
        }
        return (
            <div>
                <Navbar className={"light"} expand={"lg"}>
                    <Container>
                        <NavbarBrand>Fake StackOverflow</NavbarBrand>
                        <Nav className={"me-auto"}>
                            <NavLink as={Link} to={"/questions"}>Questions</NavLink>
                            <NavLink as={Link} to={"/tags"}>Tags</NavLink>
                            <NavLink as={Link} to={"/askQuestion"}>Ask Question</NavLink>
                        </Nav>
                        <Form className={"d-flex"} onSubmit={this.searchQuery}>
                            <FormControl type={"search"} placeholder={"Search"} className={"me-2"} onChange={this.handleQueryChanged}/>
                            <Button variant={"outline-success"} type={'submit'}>Search</Button>
                        </Form>
                        {signIn}
                        {logOutButton}
                    </Container>
                </Navbar>
                <Outlet />
            </div>
        );
    }
}

export default function NavbarContainer() {
    const navigate = useNavigate();
    const [user, setUser] = useContext(UserContext);
    return <NavMenu navigate={navigate} user={user} setUser={setUser}/>
}