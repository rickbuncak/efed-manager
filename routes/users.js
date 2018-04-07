var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// index user route
router.get("/", function(req, res){
	// get users from database
	User.find({}, function(err, allUsers){
		if(err){
			console.log(err);
		} else {
			res.render("users/",{users: allUsers});
		}
	});
});

// show user route
router.get("/:username", function(req, res){
	User.findOne({username: req.params.username}, function(err, foundUser){
		if(err || !foundUser){
			console.log(err);
		} else {
			res.render("users/show", {user: foundUser});
		}
	});
});

// edit user route
router.get("/:username/edit", function(req, res) {
    User.findOne({username: req.params.username}, function(err, foundUser){
        res.render("users/edit", {user: foundUser}); 
    });
});

// update user route
router.put("/:username", function(req, res){
    User.findOneAndUpdate({username: req.params.username}, req.body.user, function(err, updatedUser){
        if(err) {
            res.redirect("/members");
        } else {
            res.redirect("/members/" + req.params.username);
        }
    });
});



module.exports = router;