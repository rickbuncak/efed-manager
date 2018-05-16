const db = require('../db.js');

// all the middleware goes here
var middlewareObj = {};

middlewareObj.hasCharacter = function(req, res, next) {
    // check if user isAuthenticated and user is stored in session
    if(req.isAuthenticated() || req.user){
        db.query('SELECT * FROM roster WHERE user_id = ?', [req.user.user_id], function(err, foundWrestler, fields){
            if(err){ console.log(err);
            // if user has no wrestlers, set hasWrestlers to false
            } else if(foundWrestler.length==0) {
                db.query('UPDATE users SET hasWrestler = false WHERE user_id = ?', [req.user.user_id], function(err, updatedUser, fields){
                    if(err){ console.log(err); }
                });
            // if user has any wrestlers, set hasWrestlers to true
            } else {
                db.query('UPDATE users SET hasWrestler = true WHERE user_id = ?', [req.user.user_id], function(err, updatedUser, fields){
                    if(err){ console.log(err); }
                });
            }
        });
    }
    next();
};

middlewareObj.checkUserIdentity = function(req, res, next) {
    if(req.isAuthenticated()){
        db.query('SELECT * FROM users WHERE email = ?', [req.params.email], function(err, foundUser, fields){
            if(err || !foundUser){
                req.flash("error", "User not found.");
                res.redirect("back");
            } else {
                // does user own profile
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
                // does user play wrestler
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

middlewareObj.checkHasCharacter = function(req, res, next) {
    if(req.isAuthenticated() && req.user.hasWrestler == 1){
        next();
    } else {
        req.flash("error", "You must control a wrestler to do that.");
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