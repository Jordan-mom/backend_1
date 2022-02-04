const mongoose = require('mongoose');


// Article Model

mongoose.model("Article",{
	// name: {
	// 	type: String,
	// 	required: true
	// },
	title: {
		type: String,
		required: true
	},
	subtitle: {
		type: String,
		required: false
	},
	imageUrl: {
		type: String,
		required: true
	},
	price: {
		// type: mongoose.Decimal128,
		type: String,
		required: false
	},
	description: {
		type: String,
		required: true
	},
	idCategory: {
		type: String,
		required: true
	},
	details: {
		type: String,
		required: false
	},
	dateArticleCreated: {
		type: Date,
		required: true,
	},

	// imageTitle: {
	// 	type: String,
	// 	required: false
	// },
	// imageDesc: {
	// 	type: String,
	// 	required: false
	// },
	// dateImageUploaded: {
	// 	type: Date,
	// 	required: false,
	// 	default: Date.now
	// },

	// orders: {
	// 	type: Array,
	// 	required: true
	// }



})