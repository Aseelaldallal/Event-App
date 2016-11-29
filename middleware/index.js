

/* ------------------------------------------------------------------- */
/* --------------------------- MIDDLEWARE ---------------------------- */
/* ------------------------------------------------------------------- */


var middlewareObj = {}; 




/* ---------------------------- FUNCTIONS ----------------------------- */


// Checks whether user is logged in. Redirects to events if not logged in
middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    console.log("Not logged in");
    res.redirect("/login");
}


/* ------------------------------ EXPORT ------------------------------ */


module.exports = middlewareObj; 