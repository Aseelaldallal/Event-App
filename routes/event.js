/* ------------------------------------------------------------------- */
/* -------------------------- EVENT ROUTES --------------------------- */
/* ------------------------------------------------------------------- */


var express         = require("express"),
    Event           = require("../models/event"),
    User            = require("../models/user"),
    middleware      = require("../middleware"), // If we require a directory, it automatically requires index.js
    aws             = require('aws-sdk'),
    multer          = require("multer"),
    multerS3        = require('multer-s3'),
    fs              = require('fs'),
    router          = express.Router(),
    moment          = require("moment"),
    momentTZ        = require("moment-timezone"),
    ipLocation      = require("iplocation");

        
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ca-central-1'
});

var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        key: function (req, file, cb) {
            var fileExtension = file.originalname.split(".")[1];
            var path = "uploads/" + req.user._id + Date.now() + "." + fileExtension;
            cb(null, path); 
        }
    })
});

/*var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/eventImages');
  },
  filename: function (req, file, callback) {
    callback(null, req.user._id + Date.now());
  }
});*/

/*var upload = multer({storage: storage});*/


/* --------------------------- INDEX ROUTE --------------------------- */

// DISPLAY A LIST OF ALL EVENTS

router.get("/", middleware.sanitizeUserInput, middleware.validateDate, function(req,res,next) {
    if(!req.query.dateToFind) {
        ipLocation(getUserIPAddress(req), function (error, ipres) {
            var today = moment().format("YYYY-MM-DD"); // server today
            if(!error) { 
                today = momentTZ().tz(ipres.timezone).format("YYYY-MM-DD"); // user today
            }
            fetchEventsOnDate(today,res,next); 
        });
    } else {
        fetchEventsOnDate(req.query.dateToFind, res, next);
    }
});

function fetchEventsOnDate(today, res,next) {
        Event.find({date: today}, function(err, foundEvents) {
        if(err) {
            next(err); 
        } else {
            res
               .status(200)
               .render("event/index", {date: today, events: foundEvents}); 
        }
    });
}

/* ---------------------------- NEW ROUTE ---------------------------- */

// DISPLAY FORM TO CREATE A NEW EVENT
// Only logged in user can see this form

router.get("/new", middleware.isLoggedIn, function(req,res) {  
    res
        .status(200)
        .render("event/new"); 
});

/* --------------------------- CREATE ROUTE -------------------------- */

// UPDATE DATABASE WITH NEWLY CREATED EVENT
// Only logged in user can create event
// User input is sanitized

//router.post("/", middleware.isLoggedIn, upload.single('image'),middleware.validateNewEvent, middleware.sanitizeUserInput, function(req,res,next) { 

router.post("/", middleware.isLoggedIn, upload.array('image',1),middleware.validateNewEvent, middleware.sanitizeUserInput, function(req,res,next) { 
    
    var filepath = undefined;

    if(req.files[0]) {
        filepath = req.files[0].key; // 'uploads/xxxxx.extension'
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
            next(err);
        } else {
            // Update User: add event id to User.events
            User.findByIdAndUpdate(newEvent.author.id , { $push: {events: {_id: newEvent._id} } }, function(err, updatedUser) {
                if(err) {
                    next(err);
                } else {
                    req.flash("success", "Successfully created your event");
                    res.status(200)
                       .redirect("/events/" + newEvent._id);
                }
            });
        }
    });
    
});

/* ---------------------------- SHOW ROUTE --------------------------- */

// DISPLAY DETAILS OF SPECIFIC EVENT

router.get("/:id", function(req,res,next) {
   Event.findById(req.params.id, function(err, foundEvent) {
        if(err) {
           next(err);
        } else {
            res
                .status(200)
                .render("event/show", {event: foundEvent});
        }
    });
});


/* ---------------------------- EDIT ROUTE --------------------------- */

// EDIT DETAILS OF SPECIFIC EVENT
// Only user who owns the event can see edit form for this event
router.get("/:id/edit", middleware.checkEventOwnership, function(req,res,next) {
       
    Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           next(err);
       } else {
           ipLocation(getUserIPAddress(req), function (error, ipres) {
               if(error) {
                    // route based on server date
                    routeBasedOnDate(req, res,foundEvent,moment());
               } else {
                    // route based on user date
                    routeBasedOnDate(req, res,foundEvent,momentTZ().tz(ipres.timezone));
               }
           });
       }
    });
});

// Returns user's IP Address
function getUserIPAddress(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
}

// If foundEvent date is before today, render edit page.
// Otherwise, go back
// today is a moment object
function routeBasedOnDate(req, res, foundEvent, today) {
    if(canEditEvent(moment(foundEvent.date), today)) {
        res
            .status(200)
            .render("event/edit", {event: foundEvent});
    } else {
        req.flash("error", "Sorry, you can't edit events happening today or in the past");
        res.redirect("back");
    }
}


// Returns true if eventDate is the same day as todayDate or before
// Returns false otherwise
function canEditEvent(eventDate, todayDate) {
    if(eventDate.isSameOrBefore(todayDate)) {
        return false;
    }
    return true;
}

/* --------------------------- UPDATE ROUTE -------------------------- */

// UPDATE SPECIFIC EVENT IN DATABASE 
// Only user who owns the event can edit the event in the db
router.put("/:id", upload.array('image',1), middleware.checkEventOwnership, middleware.validateNewEvent, middleware.sanitizeUserInput, function(req, res,next) {
    if(req.files[0]) { 
        req.body.image = req.files[0].key; // Path of uploaded file
        if(req.body.previousImage !== undefined) {
            deleteFiles(req.body.previousImage);
        } 
    } else if(req.body.imageRemoved === "true") {
        deleteFiles(req.body.previousImage);
        req.body.image = undefined;
    }
    req.body.mapCenter = req.body.showMap; 
    Event.findByIdAndUpdate(req.params.id, req.body, function(err, foundEvent) {
       if(err) {
           next(err);
       } 
       req.flash("success", "Successfully updated your event!");
       res
          .status(200)
          .redirect("/events/" + req.params.id);
    });
});

/* --------------------------- DESTROY ROUTE ------------------------- */

// REMOVE SPECIFIC EVENT FROM DATABASE
// Only user who owns the event can delete it in the db
router.delete("/:id", middleware.checkEventOwnership, function(req,res, next) {
    Event.findByIdAndRemove(req.params.id, function(err, removedEvent) {
       if(err) {
           next(err);
       } else {
           // If event has an associated image, delete it from server
            if(removedEvent.image) { 
               deleteFiles(removedEvent.image);
            }
            // Update user - remove event from user
            User.findByIdAndUpdate(removedEvent.author.id , { $pull: {events: {_id: removedEvent._id} } }, function(err, updatedUser) {
                if(err) {
                    next(err);
                } else {
                    req.flash("success", "Successfully deleted your event");
                    res
                      .status(200)
                      .redirect("/user/" + removedEvent.author.id);
                }
            });
       }
    });
});

function deleteFiles(imagePath) {
    console.log("removing: " + imagePath);
    s3.deleteObjects({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
            Objects: [
                 { Key: imagePath },
            ]
        }
    }, function(err, data) {
        if (err) {
            console.log("Couldn't delete image file: " + err);
        }
    });
}



/* ------------------------------------------------------------------ */
/* ----------------------------- EXPORT ----------------------------- */
/* ------------------------------------------------------------------ */

module.exports = router;