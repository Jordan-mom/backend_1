const mongoose = require('mongoose');


// User Model

mongoose.model("User", {
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: false
	},
	orders: {
		type: Array,
		required: true
	}

})