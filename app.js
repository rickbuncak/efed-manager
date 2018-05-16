const express = require('express'),
	mysql = 	require('mysql'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	cookieParser = require('cookie-parser');
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	flash = require('connect-flash'),
	expressValidator = require('express-validator'),
	bcrypt = require('bcrypt');
	require('dotenv').config();
	const db = require('./db.js');

// require routes
const rootRoutes = require('./routes/index'),
	userRoutes = require('./routes/users'),
	rosterRoutes = require("./routes/roster"),
	rpRoutes = require("./routes/roleplays");

// app setup
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(expressValidator());
app.use(methodOverride('_method'));
app.use(flash());

const session = require('express-session')
const mysqlStore = require('express-mysql-session');
const storeOptions = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
};
const sessionStore = new mysqlStore(storeOptions);

app.use(session({
    secret: "bobsmith",
    resave: false,
    store: sessionStore,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user_id, done) {
	done(null, user_id);
});
passport.deserializeUser(function(id, done) {
	db.query("SELECT user_id, email, displayName, hasWrestler, isAdmin FROM Users WHERE user_id=?",[id.user_id],function(err,rows){
		done(err,rows[0]); 
	});
});
passport.use(new LocalStrategy({usernameField: 'email'}, function(username, password, done) {
  	db.query("SELECT user_id, password FROM users WHERE email = ?", [username], function(err, results, fields) {
  		if(err) { done(err) };
  		if(results.length === 0) {
  			done(null, false, {message: 'Email does not exist.'});
  		} else {
	  		const hash = results[0].password.toString();
	  		bcrypt.compare(password, hash, function(err, response){
	  			if(response === true) {
	  				return done(null, {user_id: results[0].user_id, username: username}, {message: 'Successfully logged in as ' + username});
	  			} else {
	  				return done(null, false, {message: 'Password invalid.'});
	  			}
	  		});
	  	}
  	})
}));

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.errors = req.validationErrors() || [];
    next();
});

app.use("/", rootRoutes);
app.use("/members", userRoutes);
app.use("/roster", rosterRoutes);
app.use("/roleplays", rpRoutes);

app.listen('3000', () => {
	console.log('Server start');
});
