


/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    Event           = require("../models/event"),
    middleware      = require("../middleware"), // If we require a directory, it automatically requires index.js
    multer          = require("multer"),
    fs              = require('fs'),
    router          = express.Router(),    
    moment          = require("moment");


var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/eventImages');
  },
  filename: function (req, file, callback) {
    callback(null, req.user._id + Date.now());
  }
});

var upload = multer({storage: storage});

/* --------------------------- INDEX ROUTE --------------------------- */

// DISPLAY A LIST OF ALL EVENTS

router.get("/", function(req,res) {
    
    var reqDate;
    
    console.log("REQ FLASH:", req);
    
    if( !req.query.dateToFind ) {
        // redirecting to get usertime - avoid errors in calculation
        res.render("event/index", {date: undefined, events: undefined}); 
    } else {
        reqDate = req.query.dateToFind;
        console.log("Req date: ", reqDate);
        Event.find({date: reqDate}, function(err, foundEvents) {
            if(err) {
                console.log(err);
            } else {
                res.render("event/index", {date: reqDate, events: foundEvents}); 
            }
        });
    }
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
// User input is sanitized

router.post("/", middleware.isLoggedIn, upload.single('image'),middleware.validateNewEvent,  middleware.sanitizeUserInput, function(req,res) { 

    var filepath = undefined;
    
    if(req.file) {
        filepath = req.file.path.substr(6); // Substr to remove "/public"
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
        eventCost: req.body.eventCost,
        registerationURL: req.body.regURL,
        organizerName: req.body.organizerName,
        organizerEmail: req.body.organizerEmail,
        author: {
            id: req.user._id, 
            username: req.user.username
        }
    };
    
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
router.put("/:id", upload.single('image'), middleware.checkEventOwnership, middleware.validateNewEvent, middleware.sanitizeUserInput, function(req, res) {

    console.log("----------------- IN UPDATE ROUTE --------------------");
    
    if(req.file) { // Case 2 or 5
        console.log("Case 2 or Case 5");
        req.body.image = req.file.path.substr(6); // Path of uploaded file
        console.log("Checking previousImage: ", req.body.previousImage);
        if(req.body.previousImage !== undefined) {
            console.log("Case 5: Image. Edit. New Image --> Must delete previous image from db");
            var imagePath = "public" + req.body.previousImage;
            fs.unlink(imagePath, function(err) {
                if(err) {
                    console.log("Couldn't Delete image File: ", err);
                } else {
                    console.log("Successfully deleted previous image");
                }
            });
        } else {
            console.log("Case 2: No Image. Edit. New Image");
        }
    } else if(req.body.imageRemoved === "true") {
        console.log("Case 3: Image. Edit. Image Removed --> must delete previous image from db");
        var imagePath = "public" + req.body.previousImage;
        fs.unlink(imagePath, function(err) {
            if(err) {
                console.log("Couldn't Delete image File: ", err);
            } else {
                console.log("Successfully deleted previous image");
            }
        });
        req.body.image = undefined;
        console.log("Setting Request.body.image to undefined: ", req.body.image);
        
    }
     
    req.body.mapCenter = req.body.showMap; 
    
    console.log("------REQ.BODY ------");
    console.log(req.body);
    
    Event.findByIdAndUpdate(req.params.id, req.body, function(err, foundEvent) {
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
           if(removedEvent.image) { // If there is an associated image
               var imagePath = "public" + removedEvent.image;
               fs.unlink(imagePath, function(err) {
                   if(err) {
                       console.log("Couldn't Delete image File: ", err);
                   }
                    req.flash("success", "Your event has been deleted");
                    res.redirect("/events");
               });
           } else {
                req.flash("success", "Your event has been deleted");
                res.redirect("/events");
           }
       }
    });
});


/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */

module.exports = router;