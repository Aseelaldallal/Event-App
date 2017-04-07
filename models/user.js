
/* ------------------------------------------------------------------- */
/* --------------------------- USER MODEL ---------------------------- */
/* ------------------------------------------------------------------- */


var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");



// SCHEMA SETUP
var userSchema = new mongoose.Schema({
   username: String,
   password: String, 
   events: [{
        id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event"
            }
   }]
});

userSchema.plugin(passportLocalMongoose);

// EXPORT
module.exports = mongoose.model("User", userSchema);
