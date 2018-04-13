var User = require("../models/user");
var Wrestler = require("../models/wrestler");
var Roleplay = require("../models/roleplay");


// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkUserIdentity = function(req, res, next) {
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, foundUser){
            if(err || !foundUser){
                req.flash("error", "User not found.");
                res.redirect("back");
            } else {
                // does user own campground
                if(foundUser.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObj.checkWrestlerController = function(req, res, next) {
    if(req.isAuthenticated()){
        Wrestler.findOne({slug: req.params.slug}, function(err, foundWrestler){
            if(err || !foundWrestler){
                req.flash("error", "Character not found.");
                res.redirect("back");
            } else {
                // does user own comment
                if(foundWrestler.controller.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObj.checkRoleplayAuthor = function(req, res, next) {
    if(req.isAuthenticated()){
        Roleplay.findOne({slug: req.params.slug}, function(err, foundRP){
            if(err || !foundRP){
                req.flash("error", "Roleplay not found.");
                res.redirect("back");
            } else {
                // does user own comment
                if(foundRP.controller.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that.");
    res.redirect("/login");
};

module.exports = middlewareObj;