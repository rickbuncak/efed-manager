var express = require("express");
var router = express.Router();
var passport = require("passport");
var moment = require("moment");
var User = require("../models/user");
var Wrestler = require("../models/wrestler");

// index roster route
router.get("/", function(req, res){
	// get users from database
	Wrestler.find({isActive: true}, function(err, activeRoster){
		if(err){
			console.log(err);
		} else {
			res.render("roster/", {roster: activeRoster});
		}
	});
});

// wrestler application form
router.get("/apply", function(req, res){
	res.render("roster/contract");
	console.log(req.user);
});

// application post route
router.post("/", function(req, res){
	User.findById(req.user._id, function(err, user){
		if(err){
            console.log(err);
            res.redirect("/");
        } else {
			Wrestler.create(req.body.wrestler, function(err, wrestler){
		      	if(err){
					console.log(err);
				} else {
					// add username and id to comment
					wrestler.controller.id = req.user._id;
					wrestler.controller.displayName = req.user.display;
					// save comment
					wrestler.save();
					user.wrestlers.push(wrestler);
					user.save();
					console.log(wrestler);
					// req.flash("success", "Successfully added comment.");
					res.redirect("/roster");
		        }
		   	})
		}
	});
});

// show profile route
router.get("/:slug", function(req, res){
	Wrestler.findOne({slug: req.params.slug}, function(err, foundWrestler){
		if(err || !foundWrestler){
			console.log(err);
		} else {
			foundWrestler.debut = moment(foundWrestler.debutDate).format("LL"); 
			res.render("roster/profile", {wrestler: foundWrestler});

		}
	});
});

// edit profile route
router.get("/:slug/edit", function(req, res) {
    Wrestler.findOne({slug: req.params.slug}, function(err, foundWrestler){
        res.render("roster/edit", {wrestler: foundWrestler}); 
    });
});

// update profile route
router.put("/:slug", function(req, res){
    Wrestler.findOneAndUpdate({slug: req.params.slug}, req.body.wrestler, function(err, updatedWrestler){
        if(err) {
            res.redirect("/roster");
        } else {
            res.redirect("/roster/" + req.params.slug);
        }
    });
});

module.exports = router;