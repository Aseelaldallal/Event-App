
/* ------------------------------------------------------------------- */
/* --------------------------- USER MODEL ---------------------------- */
/* ------------------------------------------------------------------- */


var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose");



// SCHEMA SETUP
var userSchema = new mongoose.Schema({
   username: String,
   password: String, 
   email: String
});

userSchema.plugin(passportLocalMongoose);

// EXPORT
module.exports = mongoose.model("User", userSchema);
