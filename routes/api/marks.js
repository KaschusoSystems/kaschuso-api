const { getMarks } = require('../../services/kaschuso-api');

var router = require('express').Router();

router.get('/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    getMarks(mandator, username, password).then(marks => {
        return res.json({
            mandator: mandator,
            username: username,
            marks: marks 
        });
    }).catch(next);
});

module.exports = router;
