const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//get the User variable from the models/user file
const User = require('../models/user')

//Register route
router.get('/register', function(req,res){
    res.render('register');
});

//Login route
router.get('/login', function(req,res){
    res.render('login');
});

//Register route
router.post('/register', function(req,res){
    //get all of the information from the user
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    //validation of the form to make sure its not empty
    req.checkBody('name', 'name is required').notEmpty();
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email is required').isEmail();
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password2', 'confirm password is required').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors){
        res.render('register', {
            errors:errors
        })
    } else {
        const newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        User.createUser(newUser, function(err,user){
            if(err) throw err;
            console.log(user)
        });

        req.flash('success_msg', 'you are registered and now loin');
        res.redirect('/users/login');
    }
});

// copy and paste from passport
passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));
    // copy from website
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.getUserById(id, function(err, user) {
          done(err, user);
        });
      });


// get it from passport website
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
        res.redirect('/');
    res.redirect('/users/' + req.user.username);
  });

router.get('/logout', function(req, res){
    req.logout();

    req.flash('success_msg', 'you are logged out');

    res.redirect('/users/login');
});


module.exports = router;