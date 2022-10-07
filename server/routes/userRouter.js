const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.get("/getUser", (req, res) => {
    let ret;
    if (!req.session.userid) {
        ret = {};
    } else {
        ret = {username: req.session.userid};
    }
    res.status(200).json(ret);
});

router.get("/id/:name", (req, res) => {
    User.find({name: req.params.name})
        .then(ret => {
           if(ret.length > 0)  res.status(200).json(ret[0]._id);
           else res.sendStatus(206);
        }).catch(err => res.sendStatus(206));
});

router.get("/name/:id", (req, res) => {
    User.findById(req.params.id)
        .then(ret => {
            res.status(200).json(ret.username);
        }).catch(err => res.sendStatus(206));
});

router.get("/createTime/:name", (req, res) => {
    User.find({username: req.params.name})
        .then(user => {
            if(user.length > 0) res.status(200).json(user[0].account_date_time);
            else res.sendStatus(500);
        }).catch(err => res.sendStatus(500));
});

router.get("/reputation", (req, res) => {
    User.find({username: req.session.userid})
        .then(user => { //TODO: Change back to commented
            res.status(200).json(100);//user[0].reputation);
        })
        .catch(err => res.status(500).json(err));
});

router.get("/plusRep/:id", (req, res) => {
    User.findById(req.params.id)
        .then(user =>  {
            user.reputation+=5;
            user.save()
                .then(() => res.status(200).json(user.reputation))
                .catch(err => res.status(500).json(err));
        });
});

router.get("/minusRep/:id", (req, res) => {
    User.findById(req.params.id)
        .then(user =>  {
            user.reputation-=10;
            user.save()
                .then(() => res.status(200).json(user.reputation))
                .catch(err => res.status(500).json(err));
        });
});

router.post("/register", (req, res) => {
    User.findOne({email: req.body.email}, (error, result) => {
        User.findOne({username: req.body.username}, (userError, userResult) => {
            if(!result && !userResult) {
                bcrypt.hash(req.body.password, 10).then((hash) => {
                    const user = new User({
                        email: req.body.email,
                        username: req.body.username,
                        password: hash
                    });
                    user.save().then(response => {
                        res.status(201).json({username: req.body.username});
                    }).catch(error => {
                        res.sendStatus(500);
                    });
                });
            } else if(result) {
                res.sendStatus(206);
            } else {
                res.sendStatus(207);
            }
        });

    });
});

router.post("/login", (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if(!user) {
            res.sendStatus(401);
        } else {
            bcrypt.compare(req.body.password, user.password, (err, response) => {
                if(err || !response) {
                    res.sendStatus(401);
                } else if(response) {
                    req.session.userid = user.username;
                    req.session.save();
                    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                    // res.cookie('user', authToken, {
                    //     httpOnly: true,
                    //     maxAge: 50000,
                    //     secure: false
                    // });
                    res.status(200).json({username: user.username});
                }
            });
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send({redirect: "/"})
})

module.exports = router;
