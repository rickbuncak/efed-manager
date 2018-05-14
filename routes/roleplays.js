var express = require("express");
var router = express.Router();
var passport = require("passport");
const slugify = require('slugify');
const db = require('../db.js');
var dateOption = { year: 'numeric', month: 'long', day: 'numeric' };
var middleware = require("../middleware");

// router.get('/createtable', (req,res) => {
// 	let sql = 'CREATE TABLE roleplays (rp_id INT AUTO_INCREMENT, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, datePosted DATE, user_id INT, wrestler_id INT, isPublished BOOLEAN NOT NULL DEFAULT 0, content TEXT, PRIMARY KEY (rp_id), FOREIGN KEY (user_id) REFERENCES users(user_id), FOREIGN KEY (wrestler_id) REFERENCES roster(wrestler_id))';
// 	db.query(sql, (err, result) => {
// 		if(err) throw err;
// 		console.log(result);
// 		res.send('Roleplay table created');
// 	});
// });

// index roleplay route
router.get("/", function(req, res){
	// get users from database
	db.query('SELECT roleplays.title, roleplays.slug, users.displayName, users.email, roster.name FROM roleplays INNER JOIN users ON users.user_id=roleplays.user_id INNER JOIN roster ON roster.wrestler_id=roleplays.wrestler_id WHERE roleplays.isPublished = 1 ORDER BY roleplays.datePosted DESC LIMIT 10', function(err, publishedRPs, fields){
		if(err){
			console.log(err);
		} else {
			res.render("roleplay/", {roleplay: publishedRPs});
		}
	});
});

// roleplay form
router.get("/post", middleware.checkHasCharacter , function(req, res){
	let currentUser_id = req.user.user_id;
	db.query('SELECT wrestler_id, name FROM roster WHERE user_id = ?', [currentUser_id], function(err, foundWrestler, fields){
		if(err){
            console.log(err);
            res.redirect("/");
        } else {
        	console.log(foundWrestler);
        	res.render("roleplay/new", {wrestler: foundWrestler});
        }
    })
});

// application post route
router.post("/", middleware.checkHasCharacter , function(req, res){
	let title = req.body.title;
	let titleShort = req.body.title.split(" ").splice(0,6).join(" ");
	let slug = slugify(titleShort, {
  		replacement: '_',    // replace spaces with replacement
  		remove: null,        // regex to remove characters
  		lower: true          // result in lower case
	});
	let content = req.body.content;
	let wrestler_id = req.body.wrestler_id;
	let currentUser_id = req.user.user_id;
	console.log(wrestler_id);
	console.log(currentUser_id);
	db.query('INSERT INTO roleplays (title, slug, datePosted, user_id, wrestler_id, isPublished, content) VALUES (?, ?, now(), ?, ?, 1, ?)', [title, slug, currentUser_id, wrestler_id, content], (err, results, fields) =>{
		if(err){
			console.log(err);
		} else {
			res.redirect('/roleplays');
		}
	});
});


// show roleplay route
router.get("/:email/:slug", function(req, res){
	db.query('SELECT roleplays.title, roleplays.datePosted, roleplays.content, roleplays.user_id, roleplays.slug, roster.name, users.email, users.displayName FROM roleplays INNER JOIN users ON users.email=? INNER JOIN roster ON roster.wrestler_id=roleplays.wrestler_id WHERE roleplays.slug = ?', [req.params.email, req.params.slug], function(err, foundRP, fields){
		if(err || !foundRP.length > 0){
			console.log(foundRP);
			req.flash('error', 'No roleplay found');
			res.redirect('/roleplays');
		} else {
			res.render("roleplay/show", {roleplay: foundRP[0]});
		}
	});
});

// edit roleplay form
router.get("/:email/:slug/edit", middleware.checkRoleplayAuthor, function(req, res) {
	db.query('SELECT roleplays.title, roleplays.content, roleplays.user_id, roleplays.slug, roster.name, roleplays.wrestler_id, users.email FROM roleplays INNER JOIN users ON users.email=? INNER JOIN roster ON roster.wrestler_id=roleplays.wrestler_id WHERE roleplays.slug = ?', [req.params.email, req.params.slug], function(err, foundRP, fields){
		if(err || !foundRP.length > 0){
			console.log(err);
            req.flash('error', 'No roleplay found');
            res.redirect("/");
        } else {
        	db.query('SELECT wrestler_id, name FROM roster WHERE user_id = ?', [foundRP[0].user_id], function(err, foundWrestler, fields){
		   		res.render("roleplay/edit", {roleplay: foundRP[0], wrestler: foundWrestler}); 
		   	});
        }
    })
});

// update roleplay route
router.put("/:email/:slug", middleware.checkRoleplayAuthor, function(req, res){
	let titleShort = req.body.title.split(" ").splice(0,6).join(" ");
	let newSlug = slugify(titleShort, {
  		replacement: '_',    // replace spaces with replacement
  		remove: null,        // regex to remove characters
  		lower: true          // result in lower case
	});
    db.query('UPDATE roleplays SET title = ?, slug = ?, wrestler_id = ?, content = ? WHERE slug = ?', [req.body.title, newSlug, req.body.wrestler_id, req.body.content, req.params.slug], function(err, updatedRP, fields){
        if(err) {
            res.redirect("/roleplays");
        } else {
        	db.query('SELECT users.email FROM users INNER JOIN roleplays ON roleplays.slug=? WHERE roleplays.user_id=users.user_id', [newSlug], function(err, foundUser, fields){
            	res.redirect("/roleplays/" + foundUser[0].email + "/" + newSlug);
            });
        }
    });
});

module.exports = router;