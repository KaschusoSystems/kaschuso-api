const { getUserInfo } = require('../../services/kaschuso-api');

var router = require('express').Router();

// returns the user info
router.get('/info/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    getUserInfo(mandator, username, password).then(userInfo => {
        return res.json({userInfo: userInfo });
    }).catch(next);
});

module.exports = router;
