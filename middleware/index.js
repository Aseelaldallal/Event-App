

/* ------------------------------------------------------------------- */
/* --------------------------- MIDDLEWARE ---------------------------- */
/* ------------------------------------------------------------------- */


var Event       = require("../models/event");
    
var middlewareObj = {}; 



/* ---------------------------- FUNCTIONS ----------------------------- */


// Checks whether user is logged in. Redirects to events if not logged in
middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

// Checks whether the event stored in the request belongs to the currently logged in user
middlewareObj.checkEventOwnership = function(req,res,next) {
    if(req.isAuthenticated()) {
        Event.findById(req.params.id, function(err, foundEvent) { // Find the event
           if(err) {
               console.log(err);
               req.flash("error", err);
               res.redirect("back");
           } else {
               if(foundEvent.author.id.equals(req.user._id)) { // Check if the event's author's id is the same as logged in user's ids
                   return next(); 
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("/events/" + foundEvent._id);
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
};

/* ------------------------------ EXPORT ------------------------------ */


module.exports = middlewareObj; 