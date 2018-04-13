var mongoose = require("mongoose"),
	Schema = mongoose.Schema,
	URLSlugs = require('mongoose-url-slugs');

var RoleplaySchema = new mongoose.Schema({
	title: String,
	wrestler: {
		id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wrestler"
        },
        name: String,
    },
	controller: {
		id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        displayName: String,
        username: String
    },
    datePosted: { type: Date, default: Date.now },
    isPublished: {type: Boolean, default: true},
    content: String
});

RoleplaySchema.plugin(URLSlugs('title', {update: true}));

module.exports = mongoose.model("Roleplay", RoleplaySchema);