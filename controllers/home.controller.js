const express = require('express');
const router = express.Router();

router.get('/', getUserProfile, getHome);

module.exports = router;

function getHome(req, res, next){
	res.render('home');
};


function getUserProfile(req, res, next){
	if (req.isAuthenticated()){
		res.redirect('../users/' + req.user.urlName)
	}
	else{
		next()
	}
}