const express = require('express');
const router = express.Router();

router.get('/sign_in', getSignIn);
router.get('/sign_up', getSignUp);

module.exports = router;

function getSignUp(req, res, next){
	res.render('sign_up');
};

function getSignIn(req, res, next){
	res.render('sign_in');
};
