const express = require('express');
const db = require('../_setup/db');
const passportConfig = require('../_setup/passportConfig')


const passport = require('passport')


const router = express.Router();

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', passportConfig.checkAuthentication, getCurrent);
router.get('/current_user_data', passportConfig.checkAuthentication, getCurrentUserData)
router.get('/logout', logMeOut)
router.get('/:url_name', passportConfig.checkAuthentication, getUser);
//router.put('/:id', update);
//router.delete('/:id', remove);

module.exports = router;


//months
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


//**********  authenticate  **********//

function authenticate(req, res, next) {
	//console.log("Inside")
	//if token present redirect to user directly
	//console.log('hey there!, authenticate')
	passport.authenticate("local", function(err, user, info) {
	    if (err) return next(err); 
	    if (!user) return res.redirect('../auth/sign_in'); 

	    req.logIn(user, function(err) {
	        if (err)  return next(err); 
	        return res.redirect(user.urlName);
	    });

	})(req, res, next);

}


//**********  register  *********//

function register(req, res, next) {
	//console.log(req)
	_register(req.body)
		.then((registered_user) => {
			//console.log("Printing id inside register")
			res.redirect('../auth/sign_in')
		})
		.catch(err => next(err));
}



async function _register(params){

	if (await db.models.User.findOne({ userName: params.username })) {
		throw 'Username "' + params.username + '" is already taken';
	}
	var registered_user = await db.models.User.createUser(params);
	registered_user = registered_user.toObject();
	return registered_user;
}


//**********    getById    *********//

function getUser(req, res, next){
	res.cookie('current_user',req.user.userName, { maxAge: 900000});
	res.render('user', {user_name: req.user.userName, 
					first_name: req.user.name.first,
					last_name: req.user.name.last, 
					month: monthNames[req.user.createdDate.getMonth()], 
					year: req.user.createdDate.getFullYear(),
					avatar_link: "/img/avatars/" + req.user.avatar + ".png", 
					total_rooms: req.user.myRooms.length,
					rooms_array: req.user.myRooms,
					})
} 





//***********   getAll   **********//

function getAll(req, res, next) {
	db.models.User.getAll()
		.then(users => res.json(users))
		.catch(err => next(err));
}




//***********   getCurrent   *********//

function getCurrent(req, res, next) {
	//console.log("Printing current user name")
	if (req.user){
		res.redirect(req.user.urlName);
	}
	else{
		res.redirect('../auth/sign_in');
	}
}


//********* logMeOut ******************//


function logMeOut(req, res, next){
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('../auth/sign_in');
      }
    });
  }
}


//********* getCurrentUserData ***********//
function getCurrentUserData(req, res, next){
	if (req.user === undefined) {
		//console.log("User is undefined")
		// The user is not logged in
		res.json({});
	} else {
		//console.log("User is defined")
	res.json({
	    username: req.user.userName
	});
	}
}



/*
function _update(req, res, next) {
	userService.update(req.params.id, req.body)
		.then(() => res.json({}))
		.catch(err => next(err));
}

function _delete(req, res, next) {
	userService.delete(req.params.id)
		.then(() => res.json({}))
		.catch(err => next(err));
}
*/