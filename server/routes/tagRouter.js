const router = require('express').Router();
const Tag = require('../models/tag');
const Question = require('../models/question');
const User = require('../models/User');
const session = require("express-session");

router.route('/').get((req, res) => {
    Tag.find()
        .then(tags => {
            let promises = []
            tags.forEach(t => {
                promises.push(Question.count({"tags" : t._id}));
            });
            Promise.all(promises).then((results) => {
                let ret = {
                    tags: tags,
                    count: results
                }
                res.status(200).json(ret)
            })

        })
        .catch(err => res.status(500).json(err));
});

router.route('/add/:name').post(async (req, res) => {
    const newName = req.params.name;
    let creatorId;
    await User.find({username: req.session.userid})
        .then(users => {
            if (users.length > 0) {
                creatorId = users[0]._id;
            }
        })

    const newTag = new Tag({
        name: newName,
        creator: creatorId
    });

    newTag.save()
        .then(() => res.status(201).json(newTag._id))
        .catch(err => res.status(500).json(err));
});

router.route('/:id').get((req, res) => {
    Tag.findById(req.params.id)
        .then(tag => res.status(200).json(tag))
        .catch(err => res.status(500).json(err));
});

router.route('/name/:name').get((req, res) => {
    Tag.find({name: req.params.name})
        .then(tag => {
            if(tag.length > 0) res.status(200).json(tag[0]._id);
            else res.status(206).json(req.params.name);
        }).catch(err => res.status(206).json(err));
});

router.route('/by/:username').get((req, res) => {
    User.find({username: req.params.username})
        .then(users => {
            if(users.length > 0) {
                Tag.find({creator: users[0]._id})
                    .then(tags => {
                        res.status(200).json(tags);
                    })
            }
        }).catch(() =>res.sendStatus(500));
});

module.exports = router;