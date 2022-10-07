const router = require('express').Router();
const Comment = require('../models/comment');
const User = require('../models/User');

router.route('/add').post((req, res) => {
   const newText = req.body.text;

   User.find({username: req.session.userid})
       .then(userRes => {
           if(userRes.length > 0) {
               const user = userRes[0];

               const newComment = new Comment({
                  text: newText,
                  by: user._id
               });

               newComment.save()
                   .then(() => res.status(200).json(newComment._id))
                   .catch(err => res.sendStatus(500));
           }
       });
});

router.route('/upvote/:id').post((req, res) => {
    User.find({username: req.session.userid})
        .then(userRes => {
            if(userRes.length > 0) {
                Comment.findById(req.params.id)
                    .then(commentRes => {
                        User.findById(commentRes.by)
                            .then(commenter => {
                                if(commentRes.upvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(commentRes.downvoteUserList.includes(userRes[0]._id)) {
                                        commentRes.downvoteUserList.remove(userRes[0]._id);
                                        commenter.reputation += 10;
                                    }
                                    commenter.reputation += 5;
                                    commenter.save();
                                    commentRes.upvoteUserList.push(userRes[0]._id);
                                    commentRes.save().then(() => res.status(200).json(commentRes.upvoteUserList.length - commentRes.downvoteUserList.length));
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
                Comment.findById(req.params.id)
                    .then(commentRes => {
                        User.findById(commentRes.by)
                            .then(commenter => {
                                if(commentRes.upvoteUserList.includes(userRes[0]._id)) {
                                    res.sendStatus(206);
                                } else {
                                    if(commentRes.downvoteUserList.includes(userRes[0]._id)) {
                                        commentRes.downvoteUserList.remove(userRes[0]._id);
                                        commenter.reputation -= 5;
                                    }
                                    commenter.reputation -= 10;
                                    commenter.save();
                                    commentRes.upvoteUserList.push(userRes[0]._id);
                                    commentRes.save().then(() => res.status(200).json(commentRes.upvoteUserList.length - commentRes.downvoteUserList.length));
                                }
                            })
                    })
            }
        }).catch(err => res.sendStatus(500));
});

router.route('/score/:id').get((req, res) => {
    Comment.findById(req.params.id)
        .then(comment => {
            res.status(200).json(comment.upvoteUserList.length - comment.downvoteUserList.length);
        })
})

module.exports = router;
