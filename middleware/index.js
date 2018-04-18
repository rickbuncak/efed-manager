const db = require('../db.js');

// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkUserIdentity = function(req, res, next) {
    if(req.isAuthenticated()){
        db.query('SELECT * FROM users WHERE email = ?', [req.params.email], function(err, foundUser, fields){
            if(err || !foundUser){
                req.flash("error", "User not found.");
                res.redirect("back");
            } else {
                // does user own campground
                if(foundUser[0].user_id == req.user.user_id){
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
        db.query('SELECT * FROM roster WHERE slug = ?', [req.params.slug], function(err, foundWrestler, fields){
            if(err || !foundWrestler){
                req.flash("error", "Character not found.");
                res.redirect("back");
            } else {
                // does user own comment
                if(foundWrestler[0].user_id == req.user.user_id){
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
        db.query('SELECT * FROM roleplays WHERE slug = ?', [req.params.slug], function(err, foundRP, fields){
            if(err || !foundRP){
                req.flash("error", "Roleplay not found.");
                res.redirect("back");
            } else {
                // does user own comment
                if(foundRP[0].user_id == req.user.user_id){
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