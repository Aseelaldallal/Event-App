


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    Event           = require("../models/event"),
    middleware      = require("../middleware"); // If we require a directory, it automatically requires index.js

var router          = express.Router();

/* --------------------------- INDEX ROUTE --------------------------- */

// DISPLAY A LIST OF ALL EVENTS

router.get("/", function(req,res) {
    Event.find({}, function(err, foundEvents) {
        if(err) {
            console.log(err);
        } else {
            res.render("event/index", {events: foundEvents}); 
        }
    });
});

/* ---------------------------- NEW ROUTE ---------------------------- */

// DISPLAY FORM TO CREATE A NEW EVENT
// Only logged in user can see this form

router.get("/new", middleware.isLoggedIn, function(req,res) {
    res.render("event/new"); 
});

/* --------------------------- CREATE ROUTE -------------------------- */

// UPDATE DATABASE WITH NEWLY CREATED EVENT
// Only logged in user can create event

router.post("/", middleware.isLoggedIn, function(req,res) {
    var newEvent = {
        name: req.body.name,
        date: req.body.date,
        location: req.body.location,
        image: req.body.image,
        description: req.body.description,
        author: {
            id: req.user._id, 
            username: req.user.username
        }
    };
    Event.create(newEvent, function(err, newEvent) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/events/" + newEvent._id);
        }
    });
});





/* ---------------------------- SHOW ROUTE --------------------------- */

// DISPLAY DETAILS OF SPECIFIC EVENT

router.get("/:id", function(req,res) {
   Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.render("event/show", {event: foundEvent});
       }
   });
});

/* ---------------------------- EDIT ROUTE --------------------------- */

// EDIT DETAILS OF SPECIFIC EVENT
// Only user who owns the event can see edit form for this event
router.get("/:id/edit", middleware.checkEventOwnership, function(req,res) {
       Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.render("event/edit", {event: foundEvent});
       }
   });
});

/* --------------------------- UPDATE ROUTE -------------------------- */

// UPDATE SPECIFIC EVENT IN DATABASE
// Only user who owns the event can edit the event in the db
router.put("/:id", middleware.checkEventOwnership, function(req, res) {
    Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.redirect("/events/" + req.params.id);
       }
    });
});

/* --------------------------- DESTROY ROUTE ------------------------- */

// REMOVE SPECIFIC EVENT FROM DATABASE
// Only user who owns the event can delete it in the db
router.delete("/:id", middleware.checkEventOwnership, function(req,res) {
    Event.findByIdAndRemove(req.params.id, function(err, removedEvent) {
       if(err) {
           console.log(err);
       } else {
           res.redirect("/events")
       }
    });
});


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */

module.exports = router;