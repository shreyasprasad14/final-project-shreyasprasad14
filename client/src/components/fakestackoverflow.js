import React from 'react';
import Navbar from "./Navbar";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import QuestionPage from "./routes/QuestionPage";
import QuestionList from "./routes/QuestionList";
import TagList from "./routes/TagList";
import Home from "./routes/Home";
import LogIn from "./routes/LogIn";
import Register from "./routes/Register";
import {UserContextProvider} from "../UserContext";
import AskQuestionContainer from "./routes/AskQuestion";
import AddAnswerContainer from "./routes/AddAnswer";
import UserPageContainer from "./routes/UserPage";
import AddCommentContainer from "./routes/AddComment";

export default class FakeStackOverflow extends React.Component {
  render() {
    return (
        <UserContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path={""} element={<Navbar/>}>
                    <Route path={"/"} element={<Home />}/>
                    <Route path={"login"} element={<LogIn/>}/>
                    <Route path={"register"} element={<Register/>}/>
                    <Route path={"questions"} element={<QuestionList/>}/>
                    <Route path={"/question/:questionId"} element={<QuestionPage/>}/>
                    <Route path={"tags"} element={<TagList/>}/>
                    <Route path={"askQuestion"} element={<AskQuestionContainer/>}/>
                    <Route path={"addAnswer/:questionId"} element={<AddAnswerContainer/>}/>
                    <Route path={"/user/:username"} element={<UserPageContainer/>}/>
                    <Route path={"/addComment/:id/"} element={<AddCommentContainer />}/>
                    <Route path={"*"}
                            element={
                                    <main style={{padding: "1rem"}}>
                                        <p>Error 404</p>
                                    </main>
                            }
                    />
                </Route>
              </Routes>
            </BrowserRouter>
        </UserContextProvider>
    );
  }
}
