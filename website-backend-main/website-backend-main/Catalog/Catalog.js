// Load express
const express  = require("express");
const app = express()
const bodyParser = require("body-parser");
const axios = require("axios");

// Format de commande avec les variables d'environnements
// HOST_API=localhost HOST_DB=localhost PORT_API=5252 PORT_DB=27017 DB_NAME=toolchain node Catalog.js

// hosts
const hostApi = process.env.HOST_API || "localhost";
const hostDb = process.env.HOST_DB || "localhost";

// ports
// 5252 is the port for production on local
let portApi = process.env.PORT_API || 5252;
if (process.env.NODE_ENV && process.env.NODE_ENV == 'test') {
	// 5200 is the port for tests
	portApi = 5200;
}
const portDb = process.env.PORT_DB || 27017;

// database name
const dbName = process.env.DB_NAME || "toolchain";

const mongoDbUrl = `mongodb://${hostDb}:${portDb}/${dbName}`;
const cors = require('cors');
const fs = require('fs');
var multer  = require('multer');


const Functions = require("./functions")
functions = new Functions;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 
app.use(express.static('public'));

// Load Mongoose
const mongoose = require("mongoose");

// Global Article Object which will be the instance of MongoDB document
var Article;
var Category;
async function connectMongoose() {
	// await mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology:true }).then(() =>{
	// 	console.log("mongoose connected..")
	// });
	await mongoose.connect(mongoDbUrl, {
		promiseLibrary: require('bluebird'),
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	}).then(() =>{
		console.log("mongoose connected..")
	});
	require("./Article");
	require("./Category");
	Article = mongoose.model("Article");
	Category = mongoose.model("Category");
}


// Load initial modules
async function initialLoad() {
	await connectMongoose();
}

initialLoad();

let dirImages = __dirname + '/public/images';

if (process.env.NODE_ENV && process.env.NODE_ENV == 'test') {
	dirImages = __dirname + '/test/images_tests';
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dirImages);
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

var upload = multer({storage: storage});



/**
 * IMPROVEMENT: Each API can sit in a different file if we want to scale the application to perform larger operations
 */

// Main endpoint
app.get("/", (req, res) => {
	res.send("This is our main endpoint")
})

// GET all articles
app.get("/articles",async (req, res) => {
	Article.find().then((articles) => {
		res.send(articles)
	}).catch((err) => {
		if(err) {
			throw err
		}
	})
})

// GET all the articles of one category
app.get("/articles/category/:category_id",async (req, res) => {
	Article.find({idCategory: req.params.category_id}).then((articles) => {
		res.send(articles)
	}).catch((err) => {
		if(err) {
			throw err
		}
	})
})

// DELETE one article
app.delete("/article/:id_article", async (req, res) => {
	const article = await Article.findOne({_id: req.params.id_article});

	let fileToDelete = functions.convertUrlImageToPath(article.imageUrl, dirImages);

	await Article.deleteMany({_id: req.params.id_article});

	fs.unlinkSync(fileToDelete);

	res.send({message: "Article deleted"});
});



// GET all categories
app.get("/categories",async (req, res) => {
	Category.find().then((categories) => {
		res.send(categories)
	}).catch((err) => {
		if(err) {
			throw err
		}
	})
})


// GET single article
app.get("/articles/:aid",async (req, res) => {
	Article.findById(req.params.aid).then((article) => {
		if(article){
			res.json(article)
		} else {
			res.sendStatus(404)
		}
	}).catch( err => {
		if(err) {
			throw err
		}
	})
});


// Create new article
app.post('/article', upload.single('file'), function(req, res, next) {
    if(!req.file) {
        return res.status(500).send({ message: 'Upload fail'});
    } else {
        //req.body.price = parseFloat(req.body.price);
        //req.body.imageUrl = `http://${hostApi}:${portApi}/images/${req.file.filename}`;
        req.body.imageUrl = req.file.filename;
		req.body.dateArticleCreated = new Date();
		
        Article.create(req.body, function (err, article) {
            if (err) {
                console.log(err);
                return next(err);
            }
            res.json(article);
        });
    }
});

// Update an article
app.put('/article/:article_id', upload.single('file'), async function(req, res, next) {
	const article = await Article.findOne({_id: req.params.article_id});

	article.title = req.body.title;
	article.description = req.body.description;
	article.idCategory = req.body.idCategory;
	article.price = req.body.price;
	let oldImageUrl = article.imageUrl;
	if(req.file) {
		//article.imageUrl = `http://${hostApi}:${portApi}/images/${req.file.filename}`;;
		article.imageUrl = req.file.filename;
	}

	await article.save();

	if(req.file) {
		let oldImageToDelete = functions.convertUrlImageToPath(oldImageUrl, dirImages);
		fs.unlinkSync(oldImageToDelete);
	}

	res.send(article);
});

// Create new category
app.post("/category", async (req, res) => {
	const newCategory = {
		"name":req.body.name,
	}
	
	// Create new Category instance..
	const category = new Category(newCategory)
	category.save().then((categoryObj) => {
		res.send(categoryObj);
	}).catch( (err) => {
		if(err) {
			throw err
		}
	})
});


// APP listening 
app.listen(portApi, () => {
	console.log("Up and running on port "+ portApi + " ! -- This is our Catalog service")
})

module.exports = app; // for testing
