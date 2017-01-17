


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
      venueName: String,
      address: String,
      unit: String,
      city: String,
      province: String,
      postalCode: String,
      mapCenter: String,
      image: String, 
      description: String,
      eventURL: String,
      ticketURL: String,
      organizerName: String,
      organizerPhone: String,
      organizerEmail: String,
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

