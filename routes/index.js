


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
    res.status(200).render("login");
});

// Login
router.post("/login", passport.authenticate("local", 
    {   failureRedirect: "/login",
        failureFlash: true,
    }), function(req, res){
        req.flash("success","Welcome " + req.user.username + "!");
        res.status(200).redirect("/user/" + req.user._id);
    }
);

// Logout
router.get("/logout", function(req,res) {
     req.logout();
     res.status(200).redirect("/events"); 
});




/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */


module.exports = router;