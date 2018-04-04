var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
var passportLM = require("passport-local-mongoose");
var URLSlugs = require('mongoose-url-slugs');

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	password: String,

});

UserSchema.plugin(passportLM);
UserSchema.plugin(URLSlugs('username'));

module.exports = mongoose.model("User", UserSchema);