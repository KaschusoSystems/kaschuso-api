const { authenticate } = require('../../services/kaschuso-api');

var router = require('express').Router();

// whether the user is authenticated
router.get('/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    authenticate(mandator, username, password).then(() => {
        return res.json({
            mandator: mandator,
            username: username,
            authenticated: true
        });
    }).catch(() => {
        return res.status(422).json({
            mandator: mandator,
            username: username,
            authenticated: false 
        });
    });
});

module.exports = router;
