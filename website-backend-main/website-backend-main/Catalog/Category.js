const mongoose = require('mongoose');


// Category Model

mongoose.model("Category",{
	name: {
		type: String,
		required: true
	},
})