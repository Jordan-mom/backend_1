// Load express
const express  = require("express");
const app = express()
const bodyParser = require("body-parser");
const axios = require("axios");
const mongoDbUrl = "mongodb://localhost:27017/toolchain";
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 

// Load Mongoose
const mongoose = require("mongoose");
