/***************************************************/
/********************* SETUP ***********************/
/***************************************************/

var express             = require("express"),
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    mongoose            = require("mongoose"),
    Event               = require("./models/event");
    
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
    
mongoose.connect("mongodb://localhost/event_app");




/***************************************************/
/********************* ROUTES **********************/
/***************************************************/


// LANDING PAGE
app.get("/", function(req,res) {
   res.render("landing"); 
});

// INDEX ROUTE - DISPLAY A LIST OF ALL EVENTS
app.get("/events", function(req,res) {
    Event.find({}, function(err, foundEvents) {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {events: foundEvents}); // Change to index later 
        }
    });
});

// NEW ROUTE - DISPLAY FORM TO CREATE A NEW EVENT
app.get("/events/new", function(req,res) {
    res.render("new"); 
});

// CREATE ROUTE
app.post("/events", function(req,res) {
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


// SHOW ROUTE
app.get("/events/:id", function(req,res) {
   Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.render("show", {event: foundEvent});
       }
   });
});

// EDIT ROUTE
app.get("/events/:id/edit", function(req,res) {
       Event.findById(req.params.id, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.render("edit", {event: foundEvent});
       }
   });
});

// UPDATE ROUTE
app.put("/events/:id", function(req, res) {
    Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, foundEvent) {
       if(err) {
           console.log(err);
       } else {
           res.redirect("/events/" + req.params.id);
       }
    });
});

// DESTROY ROUTE
app.delete("/events/:id", function(req,res) {
    Event.findByIdAndRemove(req.params.id, function(err, removedEvent) {
       if(err) {
           console.log(err);
       } else {
           res.redirect("/events")
       }
    });
});


/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});