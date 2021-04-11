const { getMandators } = require('../../services/kaschuso-api');

var router = require('express').Router();

router.get('/', function(req, res, next) {
    getMandators().then(mandators => {
        return res.json({
            mandators: mandators
        });
    }).catch(next);
});

module.exports = router;
