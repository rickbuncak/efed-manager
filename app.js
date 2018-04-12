var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	flash = require("connect-flash");

// required models
var User = require("./models/user"),
	Wrestler = require("./models/wrestler");

// required routes
var rootRoutes = require("./routes/index"),
	userRoutes = require("./routes/users"),
	rosterRoutes = require("./routes/roster");

// app setup
var app = express();
mongoose.connect("mongodb://localhost/efed-manage");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// passport config
app.use(require("express-session")({
    secret: "wrestling manager 2018",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/", rootRoutes);
app.use("/members", userRoutes);
app.use("/roster", rosterRoutes)

app.listen(3000, process.env.IP, function(){
    console.log("Server start");
});