const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');


var _default = function _default(app){
	passport.use('local', new LocalStrategy(
  {usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
  passwordField: 'password'},
  function(username, password, done) {
  	console.log(username)
  	console.log(password)
    db.models.User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.validatePassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
	done(null, user.userName);
});


passport.deserializeUser(async (user_name, done) => {
  try {
    var user = await db.models.User.getByName(user_name);
    if (!user) {
      return done(new Error('user not found'));
    }
    done(null, user);
  } catch (e) {
    done(e);
  }
});


app.use(passport.initialize());
app.use(passport.session());

}

var _checkAuthentication = function _checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("../auth/sign_in");
    }
}


exports.default = _default;
exports.checkAuthentication = _checkAuthentication;