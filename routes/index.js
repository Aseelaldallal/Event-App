


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


// Logout


/* ------------------------- REGISTER ROUTES -------------------------- */

// Show Register Form
router.get("/Register", function(req,res) {
    res.render("register");
});

// Register


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */


module.exports = router;