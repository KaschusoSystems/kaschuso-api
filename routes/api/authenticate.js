const { authenticate } = require('../../services/kaschuso-api');

var router = require('express').Router();

// whether the user is authenticated
router.get('/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    authenticate(mandator, username, password).then(cookies => {
        const authenticated = cookies && !!cookies.SCDID_S;
        return res.json({
            mandator: mandator,
            username: username,
            authenticated: authenticated 
        });
    }).catch(error => {
        return res.json({
            mandator: mandator,
            username: username,
            authenticated: false 
        });
    });
});

module.exports = router;
