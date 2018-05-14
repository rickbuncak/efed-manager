const express = require('express');
const router = express.Router();
const passport = require("passport");
const db = require('../db.js');
const expressValidator = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const middleware = require("../middleware");

// router.get('/createusertable', (req,res) => {
// 	let sql = 'CREATE TABLE users (user_id INT AUTO_INCREMENT, email VARCHAR(255) NOT NULL, password BINARY(60), joinDate DATE, displayName VARCHAR(255), isAdmin BOOLEAN NOT NULL DEFAULT 0, location VARCHAR(255), PRIMARY KEY (user_id))';
// 	db.query(sql, (err, result) => {
// 		if(err) throw err;
// 		console.log(result);
// 		res.send('User table created');
// 	});
// });

router.use(function(req, res, next) {
    if(req.isAuthenticated()){
    	db.query('SELECT * FROM roster WHERE user_id = ?', [req.user.user_id], function(err, foundWrestler, fields){
    		if(err || !foundWrestler){
    			console.log(err);
			} else if(foundWrestler.length==0) {
				db.query('UPDATE users SET hasWrestler = false WHERE user_id = ?', [req.user.user_id], function(err, updatedUser, fields){
					if(err){ console.log(err); }
				});
            } else {
            	db.query('UPDATE users SET hasWrestler = true WHERE user_id = ?', [req.user.user_id], function(err, updatedUser, fields){
					if(err){ console.log(err); }
				});
            }
        });
    }
    next();
});

// root route
router.get('/', (req, res) => {
	res.render('home');
});

// registration form
router.get('/register', (req, res) => {
	res.render('register');
});

// registration post
router.post('/register', (req, res, next) => {
	req.check('email', 'Email address is invalid, please try again.').isEmail();
	req.check("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
	req.check('reEnterPassword', 'Password do not match, please try again.').equals(req.body.password);
	const errors = req.validationErrors();
	if(errors) {
		res.render('register', {errors: errors});
	} else {
		let email = req.body.email;
		let password = req.body.password;
		bcrypt.hash(password, saltRounds, (err, hash) => {
			db.query('INSERT INTO users (email, password, joinDate) VALUES (?, ?, now())', [email, hash], (err, results, fields) =>{
				if(err) throw err;
				db.query('SELECT LAST_INSERT_ID() as user_id', function(err, results, fields) {
					if(err) throw err;
					const user_id = results[0];
					console.log(results[0]);
					req.login(user_id, function(err) {
						if (err) throw err;
  						return res.redirect('/');
					});
				});
			});
		});	
	}
});

// login form
router.get("/login", (req, res) => {
    res.render("login");
});

// login post
router.post('/login', passport.authenticate('local', { 
	successRedirect: '/', successFlash:  true,
	failureRedirect: '/login', failureFlash: true
}), function(req, res) {});

// logout route
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged out");
	res.redirect("/");
});

module.exports = router;