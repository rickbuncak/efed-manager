var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res){
	res.render("home");
});

// registration form
router.get("/register", function(req, res){
	res.render("register");
});

// registration post
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("back");
		});
	});
});

// login form
router.get("/login", function(req, res){
	res.render("login");
});

// login post
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/",
		failureRedirect: "/login"
	}), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

module.exports = router;