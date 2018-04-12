var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
var passportLM = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	password: String,
	joinedDate: {type: Date, default: Date.now},
	isAdmin: { type: Boolean, default: false},
	displayName: String,
	location: String,
	wrestlers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Wrestler"
		}
	],
	accomplishments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Accomplishment"
		}
	]
});

UserSchema.plugin(passportLM);

module.exports = mongoose.model("User", UserSchema);