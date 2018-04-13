var express = require("express");
var router = express.Router();
var passport = require("passport");
var moment = require("moment");
var User = require("../models/user");
var Wrestler = require("../models/wrestler");
var Roleplay = require("../models/roleplay");
var middleware = require("../middleware");

// index roleplay route
router.get("/", function(req, res){
	// get users from database
	Roleplay.find({isPublished: true}, null, {sort: {datePosted: -1}}, function(err, publishedRPs){
		if(err){
			console.log(err);
		} else {
			res.render("roleplay/", {roleplay: publishedRPs});
		}
	});
});

// roleplay form
router.get("/post", middleware.isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, user){
		if(err){
            console.log(err);
            res.redirect("/");
        } else {
        	res.render("roleplay/new", {user: req.user});
        }
    })
});

// roleplay post route
router.post("/", middleware.isLoggedIn, function(req, res){
	User.findById(req.user._id, function(err, user){
		if(err){
            console.log(err);
            res.redirect("/");
        } else {
			Roleplay.create(req.body.roleplay, function(err, roleplay){
		      	if(err){
					console.log(err);
				} else {
					// add username and id to comment
					roleplay.controller.id = req.user._id;
					roleplay.controller.displayName = req.user.displayName;
					roleplay.controller.username = req.user.username;
					var split = req.body.wrestler.split(",");
					roleplay.wrestler.id = split[0];
					roleplay.wrestler.name = split[1];
					// save comment
					roleplay.save();
					user.roleplays.push(roleplay);
					user.save();
					console.log(roleplay);
					// req.flash("success", "Successfully added comment.");
					res.redirect("/roleplays");
		        }
		   	})
		}
	});
});

// show roleplay route
router.get("/:username/:slug", function(req, res){
	Roleplay.findOne({slug: req.params.slug}, function(err, foundRP){
		if(err || !foundRP){
			console.log(err);
		} else {
			foundRP.date = moment(foundRP.datePublished).format("LL"); 
			res.render("roleplay/show", {roleplay: foundRP});

		}
	});
});

// edit profile route
router.get("/:username/:slug/edit", middleware.checkRoleplayAuthor, function(req, res) {
	User.findById(req.user._id, function(err, user){
		if(err){
            console.log(err);
            res.redirect("/");
        } else {
        	Roleplay.findOne({slug: req.params.slug}, function(err, foundRP){
		        res.render("roleplay/edit", {roleplay: foundRP, user: req.user}); 
		    });
        }
    })
});

// update profile route
router.put("/:username/:slug", middleware.checkRoleplayAuthor, function(req, res){
	var title = req.body.title;
	var split = req.body.wrestler.split(",");
	var wrestlerId = split[0];
	var wrestlerName = split[1];
	var wrestler = {
		id: wrestlerId,
		name: wrestlerName
	};
	var content = req.body.content;
	var roleplay = {title: title, wrestler: wrestler, content: content}
    Roleplay.findOneAndUpdate({slug: req.params.slug}, roleplay, function(err, updatedRP){
        if(err) {
            res.redirect("/roleplays");
        } else {

            res.redirect("/roleplays/" + req.params.username + "/" +  req.params.slug);
        }
    });
});

module.exports = router;