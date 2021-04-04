const { getAbsences } = require('../../services/kaschuso-api');

var router = require('express').Router();

router.get('/', function(req, res, next) {
    const mandator = req.query.mandator;
    const username = req.query.username;
    const password = req.query.password;
    getAbsences(mandator, username, password).then(absences => {
        return res.json({
            mandator: mandator,
            username: username,
            absences: absences
        });
    }).catch(next);
});

module.exports = router;
