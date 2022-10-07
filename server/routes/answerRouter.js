const router = require('express').Router();
const Answer = require('../models/answer');
const User = require('../models/User');
const Question = require("../models/question");

router.route('/').get((req, res) => {
    Answer.find()
        .then(answers => res.status(200).json(answers))
        .catch(err => res.status(500).json(err));
});

router.route('/add').post((req, res) => {
    const newText = req.body.text;
    const newAnswer_by = req.session.userid;

    User.find({username: req.session.userid})
        .then(ret => {
            console.log(ret)
            const newAnswer = new Answer({
                text: newText,
                ans_by: ret[0]._id
            });

            newAnswer.save()
                .then(() => res.status(200).json(newAnswer._id))
                .catch(err => res.status(500).json(err));
        })

});

router.route('/:id').get((req, res) => {
    Answer.findById(req.params.id)
        .then(answer => res.status(200).json(answer))
        .catch(err => res.status(500).json(err));
});

router.route('/by/:username').get((req, res) => {
    User.find({username: req.params.username})
        .then(users => {
            if(users.length > 0) {
                Answer.find({ans_by: users[0]._id})
                    .then(async answers => {
                        let ret = [];
                        for (let i = 0; i < answers.length; i++) {
                            await Question.find()
                                .sort({_id: 1})
                                .then(questions => {
                                    for (let j = 0; j < questions.length; j++) {
                                        console.log(questions[j].answers + " " + answers[j]._id)
                                        if (questions[j].answers.includes(answers[i]._id)) {
                                            ret.push({
                                                id: questions[j]._id,
                                                title: questions[j].title
                                            });
                                            break;
                                        }
                                    }
                                });
                        }

                        res.status(200).json(ret);
                    });
            }
        }).catch(err => {
        res.sendStatus(500)
    });
});

router.route('/upvote/:id').post((req, res) => {
    User.find({username: req.session.userid})
        .then(userRes => {
            if(userRes.length > 0) {
                Answer.findById(req.params.id)
                    .then(ansRes => {
                        User.findById(ansRes.ans_by)
                            .then(user => {
                                if(ansRes.upvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(ansRes.downvoteUserList.includes(userRes[0]._id)) {
                                        ansRes.downvoteUserList.remove(userRes[0]._id);
                                        user.reputation += 10;
                                    }
                                    user.reputation += 5;
                                    user.save();
                                    ansRes.upvoteUserList.push(userRes[0]._id);
                                    ansRes.save().then(() => res.status(200).json(ansRes.upvoteUserList.length - ansRes.downvoteUserList.length));
                                }
                            })
                    })
            }
        }).catch(err => res.sendStatus(500));
});

router.route('/downvote/:id').post((req, res) => {
    User.find({username: req.session.userid})
        .then(userRes => {
            if(userRes.length > 0) {
                Answer.findById(req.params.id)
                    .then(ansRes => {
                        User.findById(ansRes.ans_by)
                            .then(user => {
                                if(ansRes.downvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(ansRes.upvoteUserList.includes(userRes[0]._id)) {
                                        ansRes.upvoteUserList.remove(userRes[0]._id);
                                        user.reputation -= 5;
                                    }
                                    user.reputation -= 10;
                                    user.save();
                                    ansRes.downvoteUserList.push(userRes[0]._id);
                                    ansRes.save().then(() => res.status(200).json(ansRes.upvoteUserList.length - ansRes.downvoteUserList.length));
                                }
                            })
                    })
            }
        }).catch(err => res.sendStatus(500));
});

router.route('/score/:id').get((req, res) => {
    Answer.findById(req.params.id)
        .then(answer => {
            res.status(200).json(answer.upvoteUserList.length - answer.downvoteUserList.length);
        })
});

router.route('/comments/:id').get((req, res) => {
    Answer.findById(req.params.id)
        .then(res => res.status(200).json(res.comments));
});

router.route('/addComment/:answerId/comment/:commentId').post((req, res) => {
    Answer.findById(req.params.answerId)
        .then(answer => {
            answer.comments.push(req.params.commentId);

            answer.save()
                .then(() => res.sendStatus(200))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

module.exports = router;