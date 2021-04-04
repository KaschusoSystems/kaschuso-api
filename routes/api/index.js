var router = require('express').Router();

router.use('/authenticate', require('./authenticate'));
router.use('/user', require('./user'));
router.use('/marks', require('./marks'));
router.use('/absences', require('./absences'));

router.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
        return res.status(422).json({
        errors: Object.keys(err.errors).reduce(function(errors, key){
            errors[key] = err.errors[key].message;
            return errors;
        }, {})
        });
    } else if (err.name === 'AuthenticationError') {
        return res.status(401).json({ error: err.message });
    }
    return next(err);
});

module.exports = router;