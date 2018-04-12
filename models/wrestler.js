var mongoose = require("mongoose"),
	Schema = mongoose.Schema,
	URLSlugs = require('mongoose-url-slugs');

var WrestlerSchema = new mongoose.Schema({
	name: String,
	nickname: String,
	debutDate: { type: Date, default: Date.now },
	controller: {
		id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        displayName: String
	},
	isActive: {type: Boolean, default: true},
	weight: String,
	hometown: String,
	finisher: String,
	themeMusic: String,
	accomplishments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Accomplishment"
		}
	]
});

WrestlerSchema.plugin(URLSlugs('name'));

module.exports = mongoose.model("Wrestler", WrestlerSchema);