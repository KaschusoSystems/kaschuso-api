const { getGrades } = require('../../services/kaschuso-api');

var router = require('express').Router();

router.get('/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    getGrades(mandator, username, password).then(grades => {
        return res.json({
            mandator: mandator,
            username: username,
            subjects: subjects 
        });
    }).catch(next);
});

module.exports = router;
