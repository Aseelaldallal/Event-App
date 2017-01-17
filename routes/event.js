


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    Event           = require("../models/event"),
    middleware      = require("../middleware"), // If we require a directory, it automatically requires index.js
    multer          = require("multer"),
    router          = express.Router();


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/eventImages');
  },
  filename: function (req, file, callback) {
    callback(null, req.user._id + Date.now() + file.originalname);
  }
});

var upload = multer({storage: storage});

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

//router.get("/new", middleware.isLoggedIn, function(req,res) {  
router.get("/new", function(req,res) { 
    res.render("event/new"); 
});

/* --------------------------- CREATE ROUTE -------------------------- */

// UPDATE DATABASE WITH NEWLY CREATED EVENT
// Only logged in user can create event

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req,res) { 
    
    console.log("REQUEST BODY: " , req.body);
    // Remove Empty Fields
    for(var key in req.body) {
        if(req.body[key] == "") {
            req.body[key] = undefined;
        } 
    }
    
    var filepath = undefined;
    if(req.file) {
        filepath = req.file.path.substr(7); // Substr to remove "/public"
    }
    
    var newEvent = {
        name: req.body.name,
        date: req.body.date,
        starttime: req.body.starttime,
        endtime: req.body.endtime,
        venueName: req.body.venueName,
        address: req.body.address,
        city: req.body.city,
        unit: req.body.unit,
        province: req.body.province,
        postalCode: req.body.postalCode,
        image: filepath, 
        mapCenter: req.body.showMap,
        description: req.body.description,
        eventURL: req.body.eventURL,
        ticketURL: req.body.ticketURL,
        organizerName: req.body.organizerName,
        organizerPhone: req.body.organizerPhone,
        organizerEmail: req.body.organizerEmail,
        author: {
            id: req.user._id, 
            username: req.user.username
        }
    };
    
    console.log("NEW EVENT: ", newEvent);
    
    Event.create(newEvent, function(err, newEvent) {
        if(err) {
            req.flash("error", err);
            res.redirect("/events");
        } else {
            req.flash("success", "Successfully created your event");
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
           req.flash("error", err);
           res.redirect("/events");
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
               req.flash("error", err);
               res.redirect("back");
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
           req.flash("error", err);
       } else {
           req.flash("success", "Successfully edited your event");
       }
       res.redirect("/events/" + req.params.id);
    });
});

/* --------------------------- DESTROY ROUTE ------------------------- */

// REMOVE SPECIFIC EVENT FROM DATABASE
// Only user who owns the event can delete it in the db
router.delete("/:id", middleware.checkEventOwnership, function(req,res) {
    Event.findByIdAndRemove(req.params.id, function(err, removedEvent) {
       if(err) {
           console.log(err);
           req.flash("error", err);
           res.redirect("back");
       } else {
           req.flash("success", "Your event has been deleted");
           res.redirect("/events");
       }
    });
});


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */

module.exports = router;