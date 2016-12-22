


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
    {   failureRedirect: "/login",
        failureFlash: true,
    }), function(req, res){
        req.flash("success", "Welcome " + req.user.username + "!" );
        res.redirect("/events");
    }
);



// Logout
router.get("/logout", function(req,res) {
     req.logout();
     req.flash("success", "Logged you out");
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
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            passport.authenticate('local')(req,res, function() {
                req.flash("success", "Thank you for registering " + newUser.username + ". You are now logged in");
                res.redirect("/events");
            });
        }
    });
});


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */


module.exports = router;