const express = require('express');
const app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

const port = 8000;
const serverPath = "http://localhost:8000";

const cors = require("cors");

const mongoose = require("mongoose");

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect("mongodb://127.0.0.1:27017/fake_so", {useNewUrlParser: true});
mongoose.connection.once('once', () => {
    console.log("MongoDB Init");
});

app.use(express.urlencoded({extended:false}));

app.use(
    session({
        secret: "RANDOMSTRING",
        cookie: {maxAge: 1000 * 60 * 60 * 24},
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({mongoUrl: "mongodb://127.0.0.1:27017/fake_so"})
    })
);

const userRouter = require('./routes/userRouter');
app.use('/u', userRouter);

const questionRouter = require('./routes/questionRouter');
const answerRouter = require('./routes/answerRouter');
const tagRouter = require('./routes/tagRouter');
const commentRouter = require('./routes/commentRouter');

app.use('/question', questionRouter);
app.use('/answer', answerRouter);
app.use('/tag', tagRouter);
app.use('/comment', commentRouter);

app.listen(port, () => console.log("Express Server Running @ " + port));