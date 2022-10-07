const router = require('express').Router();
const Question = require('../models/question');
const Tag = require('../models/tag');
const User = require("../models/User");

router.route('/').get((req, res) => {
    Question.find()
        .sort({_id: -1})
        .limit(5)
        .then( questions => res.status(200).json(questions))
        .catch(err => res.status(500).json(err));
});

router.route('/search/:searchWords').get((req, res) => {
    let words = req.params.searchWords.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(5)
        .then( questions => {
            let ret = [];
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j=0;j<words.length;j++) {
                    if(!(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j]))) {
                        questionValid &= false;
                    }
                }
                if(questionValid) ret.push(questions[i])
            }
            if(ret.length > 0) res.status(200).json(ret);
            else res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/search/:searchWords/tags/:searchTags').get((req, res) => {
    let words = req.params.searchWords.split(",");
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(5)
        .then( questions => {
            let ret = [];
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j=0;j<words.length;j++) {
                    if(!(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j]))) {
                        questionValid &= false;
                    }
                }
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid &= false;
                    }
                }
                if(questionValid) ret.push(questions[i])
            }
            if(ret.length > 0) res.status(200).json(ret);
            else res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/tags/:searchTags').get((req, res) => {
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(5)
        .then( questions => {
            let ret = [];
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid &= false;
                    }
                }
                if(questionValid) ret.push(questions[i])
            }
            if(ret.length > 0) res.status(200).json(ret);
            else res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/first').get((req, res) => {
    Question.find()
        .sort({_id: -1})
        .limit(1)
        .then(question => res.status(200).json(question[0]._id))
        .catch(err => res.status(500).json(err));
});

router.route('/first/search/:searchWords').get((req, res) => {
    let words = req.params.searchWords.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(1)
        .then(questions => {
            for (let i = 0; i < questions.length; i++) {
                let questionValid = false;
                for (let j=0;j<words.length;j++) {
                    if(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j])) {
                        questionValid = true;
                    }
                }
                if(questionValid) {
                    res.status(200).json(questions[i]._id);
                    return;
                }
            }

            res.sendStatus(206);
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        });
});

router.route('/first/search/:searchWords/tags/:searchTags').get((req, res) => {
    let words = req.params.searchWords.split(",");
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(1)
        .then( questions => {
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j=0;j<words.length;j++) {
                    if(!(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j]))) {
                        questionValid &= false;
                    }
                }
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid &= false;
                    }
                }
                if(questionValid) res.status(200).json(questions[i]._id)
            }
            res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/first/tags/:searchTags').get((req, res) => {
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: -1})
        .limit(1)
        .then( questions => {
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid = false;
                    }
                }
                if(questionValid) {
                    res.status(200).json(questions[i]._id);
                    return;
                }
            }
            res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/last').get((req, res) => {
    Question.find()
        .sort({_id: 1})
        .limit(1)
        .then(question => res.status(200).json(question[0]._id))
        .catch(err => res.status(500).json(err));
});

router.route('/last/search/:searchWords').get((req, res) => {
    let words = req.params.searchWords.split(",");
    Question.find()
        .sort({_id: 1})
        .limit(1)
        .then(questions => {
            for (let i = 0; i < questions.length; i++) {
                let wordValid = false;
                for (let j=0;j<words.length;j++) {
                    if(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j])) {
                        wordValid = true;
                    }
                }
                if(wordValid) {
                    res.status(200).json(questions[i]._id);
                    return;
                }
            }

            res.sendStatus(206);
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        });
});

router.route('/last/search/:searchWords/tags/:searchTags').get((req, res) => {
    let words = req.params.searchWords.split(",");
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: 1})
        .limit(1)
        .then( questions => {
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j=0;j<words.length;j++) {
                    if(!(questions[i].title.includes(words[j]) ||
                        questions[i].summary.includes(words[j]) ||
                        questions[i].text.includes(words[j]))) {
                        questionValid &= false;
                    }
                }
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid &= false;
                    }
                }
                if(questionValid) res.status(200).json(questions[i]._id)
            }
            res.sendStatus(206);
        })        .catch(err => res.status(500).json(err));
});

router.route('/last/tags/:searchTags').get((req, res) => {
    let tags = req.params.searchTags.split(",");
    Question.find()
        .sort({_id: 1})
        .limit(1)
        .then( questions => {
            for (let i = 0; i < questions.length; i++) {
                let questionValid = true;
                for (let j = 0; j < tags.length; j++) {
                    if(!questions[i].tags.includes(tags[j])) {
                        questionValid = false;
                    }
                }
                if(questionValid) {
                    res.status(200).json(questions[i]._id);
                    return;
                }
            }
            res.sendStatus(206);
        })
        .catch(err => res.status(500).json(err));
});

router.route('/getAfter/:id').get((req, res) => {
    Question.find({_id: {$lt: req.params.id}})
        .sort({ask_date_time: -1})
        .limit(5)
        .then(questions => res.status(200).json(questions))
        .catch(err => res.status(500).json(err));
});

router.route('/getBefore/:id').get((req, res) => {
    Question.find({_id: {$gt: req.params.id}})
        .sort({_id: -1})
        .limit(5)
        .then(questions => res.status(200).json(questions))
        .catch(err => res.status(500).json(err));
});

router.route('/add').post((req, res) => {
    const newTitle = req.body.title;
    const newSummary = req.body.summary;
    const newText = req.body.text;
    const newTags = req.body.tagList;

    User.find({username: req.session.userid})
        .then(ret => {
            if(ret.length > 0)  {
                const newQuestion = new Question({
                    title: newTitle,
                    summary: newSummary,
                    text: newText,
                    tags: newTags,
                    answers: [],
                    comments: [],
                    asked_by: ret[0]._id
                });

                newQuestion.save()
                    .then(() => res.status(200).json(newQuestion._id))
                    .catch(err => res.status(500).json(err));
            }
        }).catch(err => res.sendStatus(206));


});

router.route('/:id').get((req, res) => {
    Question.findById(req.params.id)
        .then(question => res.status(200).send(question))
        .catch(err => res.status(500).json(err));
});

router.route('/:id').delete((req, res) => {
    Question.findByIdAndDelete(req.params.id)
        .then(question => res.status(200).json('Question Deleted'))
        .catch(err => res.status(400).json('ERROR: ' + err));
});

router.route('/update/:id').post((req, res) => {
    Question.findById(req.params.id)
        .then(question => {
            question.title = req.body.title;
            question.text = req.body.text;
            question.tags = req.body.tags;
            question.answers = req.body.answers;
            question.asked_by = req.body.asked_by;
            question.ask_date_time = Date.parse(req.body.date);
            question.views = Number(req.body.views);

            question.save()
                .then(() => res.status(200).send("Question Updated"))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

router.route('/incrementView/:id').post((req, res) => {
    Question.findById(req.params.id)
        .then(question => {
            question.views = question.views + 1;

            question.save()
                .then(() => res.sendStatus(200))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

router.route('/addTag/:questionId/tag/:tagId').post((req, res) => {
    Question.findById(req.params.questionId)
        .then(question => {
            question.tags.push(req.params.tagId);

            question.save()
                .then(() => res.status(200).json("Tags Updated"))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

router.route('/addAnswer/:questionId/ans/:ansId').post((req, res) => {
    Question.findById(req.params.questionId)
        .then(question => {
            question.answers.push(req.params.ansId);

            question.save()
                .then(() => res.status(200).send("Answer Added to Question"))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

router.route('/upvote/:id').post((req, res) => {
   User.find({username: req.session.userid})
       .then(userRes => {
           if(userRes.length > 0) {
               Question.findById(req.params.id)
                    .then(qstnRes => {
                        User.findById(qstnRes.asked_by)
                            .then(asker => {
                                if(qstnRes.upvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(qstnRes.downvoteUserList.includes(userRes[0]._id)) {
                                        qstnRes.downvoteUserList.remove(userRes[0]._id);
                                        asker.reputation += 10;
                                    }
                                    asker.reputation += 5;
                                    asker.save();
                                    qstnRes.upvoteUserList.push(userRes[0]._id);
                                    qstnRes.save().then(() => res.status(200).json(qstnRes.upvoteUserList.length - qstnRes.downvoteUserList.length));
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
                Question.findById(req.params.id)
                    .then(qstnRes => {
                        User.findById(qstnRes.asked_by)
                            .then(asker => {
                                if(qstnRes.downvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(qstnRes.upvoteUserList.includes(userRes[0]._id)) {
                                        qstnRes.upvoteUserList.remove(userRes[0]._id);
                                        asker.reputation -= 5;
                                    }
                                    asker.reputation -= 10;
                                    asker.save();
                                    qstnRes.downvoteUserList.push(userRes[0]._id);
                                    qstnRes.save().then(() => res.status(200).json(qstnRes.upvoteUserList.length - qstnRes.downvoteUserList.length));
                                }
                            })
                    })
            }
        });
});

router.route('/score/:id').get((req, res) => {
    Question.findById(req.params.id)
        .then(question => {
            res.status(200).json(question.upvoteUserList.length - question.downvoteUserList.length);
        })
})

router.route('/by/:username').get((req, res) => {
    User.find({username: req.params.username})
        .then(users => {
            if(users.length > 0) {
                Question.find({asked_by: users[0]._id})
                    .then(questions => {
                        let ret = [];
                        questions.forEach(q => {
                            ret.push(
                                {
                                    id: q._id,
                                    title: q.title
                                }
                            );
                        });
                        res.status(200).json(ret);
                    });
            }
        }).catch(err => {
            console.log(err)
            res.sendStatus(500)
    });
});

router.route('/comments/:id').get((req, res) => {
    Question.findById(req.params.id)
        .then(res => res.status(200).json(res.comments));
});

router.route('/addComment/:questionId/comment/:commentId').post((req, res) => {
    Question.findById(req.params.questionId)
        .then(question => {
            question.comments.push(req.params.commentId);

            question.save()
                .then(() => res.sendStatus(200))
                .catch(err => res.status(500).json(err));
        })
        .catch(err => res.status(500).json(err));
});

module.exports = router;