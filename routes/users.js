var express = require("express");
var router = express.Router();
var passport = require("passport");
const db = require('../db.js');
var dateOption = { year: 'numeric', month: 'long', day: 'numeric' };
var middleware = require("../middleware");

// index user route
router.get("/", function(req, res){
	// get users from database
	db.query('SELECT * FROM users', function(err, allUsers, fields){
		if(err){
			console.log(err);
		} else {
			res.render("users/",{users: allUsers});
		}
	});
});

// show user route
router.get("/:email", function(req, res){
	db.query('SELECT * FROM users WHERE email = ?', [req.params.email], function(err, foundUser, fields){
		if(err || !foundUser){
			console.log(err);
		} else {
			res.render("users/show", {user: foundUser[0], dateOption: dateOption});
		}
	});
});

// edit user route
router.get("/:email/edit", middleware.checkUserIdentity, function(req, res) {
    db.query('SELECT * FROM users WHERE email = ?', [req.params.email], function(err, foundUser, fields){
        res.render("users/edit", {user: foundUser[0]}); 
    });
});

// update user route
router.put("/:email",  middleware.checkUserIdentity, function(req, res){
    db.query('UPDATE users SET displayName = ?, location = ? WHERE email = ?', [req.body.displayName, req.body.location, req.params.email], function(err, foundUser, fields){
        if(err) {
        	console.log(err);
            res.redirect("/members");
        } else {
            res.redirect("/members/" + req.params.email);
        }
    });
});

module.exports = router;