import React, {useContext} from "react";
import {Alert, Table} from "react-bootstrap";
import {Navigate, Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {UserContext} from "../../UserContext";

class TagList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {tags: []};
    }

    componentDidMount() {
        axios.get('http://localhost:8000/tag/').then(r => {
            if(r.status === 200) {
                for (let i = 0; i < r.data.tags.length; i++) {
                    r.data.tags[i].count = r.data.count[i];
                }
                this.setState({tags: r.data.tags});
            }
        })
    }

    render() {
        if(!this.props.user) {
            return <Navigate to={"../"}/>
        }

        if(this.state.tags.length === 0) {
            return <Alert variant={"info"}>No tags</Alert>
        }
        return (
            <Table>
                <TagEntries tagList={this.state.tags}/>
            </Table>
        );
    }
}

function TagEntries(props) {
    let arrays = [];
    for (let i = 0; i < props.tagList.length; i += 3)
        arrays.push(props.tagList.slice(i, i + 3));
    return (
        <tbody>
        {arrays.map(lst => {
            return(
                <tr>
                    {lst.map(entry => {
                        return (
                            <TagElement name={entry.name} _id={entry._id} count={entry.count}/>
                        )
                    })}
                </tr>
            )
        })}
        </tbody>
    );
}

function TagElement(props) {
    return (
        <td className={"tagElement"}>
            <Link to={`/questions?tags=${props.name}`}>{props.name}</Link>
            <p>{props.count} question(s)</p>
        </td>
    );
}

export default function TagListContainer() {
    const navigate = useNavigate();
    const [user] = useContext(UserContext);
    return <TagList navigate={navigate} user={user}/>
}
