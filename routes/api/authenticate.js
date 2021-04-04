const { authenticate } = require('../../services/kaschuso-api');

var router = require('express').Router();

// whether the user is authenticated
router.get('/', function(req, res, next) {
    authenticate(req.query.mandator, req.query.username, req.query.password).then(cookies => {
        console.log(cookies.SCDID_S)
        var authenticated = cookies && cookies.SCDID_S;
        return res.json({authenticated: authenticated });
    }).catch(next);
});

module.exports = router;
