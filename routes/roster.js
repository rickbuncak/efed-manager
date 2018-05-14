var express = require("express");
var router = express.Router();
var passport = require("passport");
const slugify = require('slugify');
const db = require('../db.js');
var dateOption = { year: 'numeric', month: 'long', day: 'numeric' };
var middleware = require("../middleware");

// router.get('/createtable', (req,res) => {
// 	let sql = 'CREATE TABLE roster (wrestler_id INT AUTO_INCREMENT, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, nickname VARCHAR(255), debutDate DATE, user_id INT, isActive BOOLEAN NOT NULL DEFAULT 1, weight VARCHAR(255), hometown VARCHAR(255), finisher VARCHAR(255), themeMusic VARCHAR(255), PRIMARY KEY (wrestler_id), FOREIGN KEY (user_id) REFERENCES users(user_id))';
// 	db.query(sql, (err, result) => {
// 		if(err) throw err;
// 		console.log(result);
// 		res.send('Roster table created');
// 	});
// });

// index roster route
router.get("/", function(req, res){
	// get users from database
	db.query('SELECT * FROM roster WHERE isActive = 1 ORDER BY name', function(err, activeRoster, fields){
		if(err){
			console.log(err);
		} else {
			res.render("roster/", {roster: activeRoster});
		}
	});
});

// wrestler application form
router.get("/apply", middleware.isLoggedIn, function(req, res){
	res.render("roster/contract");
	console.log(req.user);
});

// application post route
router.post("/", middleware.isLoggedIn, function(req, res){
	let name = req.body.name;
	let slug = slugify(req.body.name, {
  		replacement: '_',    // replace spaces with replacement
  		remove: null,        // regex to remove characters
  		lower: true          // result in lower case
	});
	let nickname = req.body.nickname;
	let weight = req.body.weight;
	let hometown = req.body.hometown;
	let finisher = req.body.finisher;
	let themeMusic = req.body.themeMusic;
	let currentUser_id = req.user.user_id;
	db.query('INSERT INTO roster (name, slug, nickname, debutDate, user_id, weight, hometown, finisher, themeMusic) VALUES (?, ?, ?, now(), ?, ?, ?, ?, ?)', [name, slug, nickname, currentUser_id, weight, hometown, finisher, themeMusic], (err, results, fields) =>{
		if(err){
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

// show profile route
router.get("/:slug", function(req, res){
	db.query('SELECT * FROM roster WHERE slug = ?', [req.params.slug], function(err, foundWrestler, fields){
		if(err || !foundWrestler){
			console.log(err);
		} else {
			db.query('SELECT users.user_id, users.email, users.displayName FROM users INNER JOIN roster ON users.user_id=roster.user_id', function(err, foundUser, fields){
				if(err){
					console.log(err);
				} else {
					res.render("roster/profile", {wrestler: foundWrestler[0], user: foundUser[0], dateOption: dateOption});
				}
			});
		}
	});
});

// edit profile route
router.get("/:slug/edit", middleware.checkWrestlerController, function(req, res) {
	db.query('SELECT * FROM roster WHERE slug = ?', [req.params.slug], function(err, foundWrestler, fields){
		console.log(foundWrestler);
        res.render("roster/edit", {wrestler: foundWrestler[0]}); 
    });
});

// update profile route
router.put("/:slug", middleware.checkWrestlerController, function(req, res){
    db.query('UPDATE roster SET name = ?, nickname = ?, weight = ?, hometown = ?, finisher = ?, themeMusic = ? WHERE slug = ?', [req.body.name, req.body.nickname,  req.body.weight, req.body.hometown, req.body.finisher, req.body.themeMusic ,req.params.slug], function(err, foundWrestler, fields){
        if(err) {
            res.redirect("/roster");
        } else {
            res.redirect("/roster/" + req.params.slug);
        }
    });
});

module.exports = router;