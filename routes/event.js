


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    Event           = require("../models/event");

var router          = express.Router();

/* --------------------------- INDEX ROUTE --------------------------- */

// DISPLAY A LIST OF ALL EVENTS

router.get("/", function(req,res) {
    Event.find({}, function(err, foundEvents) {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {events: foundEvents}); 
        }
    });
});

/* ---------------------------- NEW ROUTE ---------------------------- */

// DISPLAY FORM TO CREATE A NEW EVENT

router.get("/new", function(req,res) {
    res.render("new"); 
});

/* --------------------------- CREATE ROUTE -------------------------- */

// UPDATE DATABASE WITH NEWLY CREATED EVENT

router.post("/", function(req,res) {
    var newEvent = {
        name: req.body.name,
        date: req.body.date,
        location: req.body.location,
        image: req.body.image,
        description: req.body.description
    };
    Event.create(newEvent, function(err, newEvent) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/events");
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
           res.render("show", {event: foundEvent});
       }
   });
});

/* ---------------------------- EDIT ROUTE --------------------------- */

// EDIT DETAILS OF SPECIFIC EVENT

router.get("/:id/edit", function(req,res) {
       Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.render("edit", {event: foundEvent});
       }
   });
});

/* --------------------------- UPDATE ROUTE -------------------------- */

// UPDATE SPECIFIC EVENT IN DATABASE

router.put("/:id", function(req, res) {
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

router.delete("/:id", function(req,res) {
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