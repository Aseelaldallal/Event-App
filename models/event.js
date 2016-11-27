


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT MODEL ---------------------------- */
/* ------------------------------------------------------------------- */


var mongoose = require("mongoose");


// SCHEMA SETUP
var eventSchema = new mongoose.Schema({
   name: String,
   date: Date,
   location: String,
   image: String,
   description: String
});


// EXPORT
module.exports = mongoose.model("Event", eventSchema);

