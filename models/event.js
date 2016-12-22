


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT MODEL ---------------------------- */
/* ------------------------------------------------------------------- */


var mongoose = require("mongoose");


// SCHEMA SETUP
var eventSchema = new mongoose.Schema({
   name: String,
   date: Date,
   starttime: String,
   endtime: String,
   location: String,
   image: String,
   description: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});


// EXPORT
module.exports = mongoose.model("Event", eventSchema);

