


/* ------------------------------------------------------------------- */
/* -------------------------- INDEX ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    router          = express.Router(),
    passport        = require("passport"),
    User            = require("../models/user");



/* -------------------------- LANDING PAGE --------------------------- */

router.get("/", function(req,res) {
   res.render("landing"); 
});


/* -------------------------- LOGIN ROUTES --------------------------- */

// Show Login Form
router.get("/login", function(req,res) {
    res.render("login");
});

// Login
router.post("/login", passport.authenticate("local", 
    {   successRedirect: "/events",
        failureRedirect: "/login"
    }), function(req, res){
});


// Logout
router.get("/logout", function(req,res) {
     req.logout();
     res.redirect("/events"); 
});


/* ------------------------- REGISTER ROUTES -------------------------- */

// Show Register Form
router.get("/register", function(req,res) {
    res.render("register");
});

// Register
router.post("/register", function(req,res) {
    var newUser = new User({
        username: req.body.username
    });
    console.log(newUser);
    User.register(newUser, req.body.password, function(err, response) {
        if(err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate('local')(req,res, function() {
            res.redirect("/events");
        });
    });
});


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */


module.exports = router;