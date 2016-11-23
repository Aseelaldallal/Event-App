/***************************************************/
/********************* SETUP ***********************/
/***************************************************/

var express             = require("express"),
    bodyParser          = require("body-parser");

var app = express();

app.set("view engine", "ejs");
    

/***************************************************/
/********************* ROUTES **********************/
/***************************************************/


// LANDING PAGE
app.get("/", function(req,res) {
   res.render("landing"); 
});

// INDEX ROUTE - DISPLAY A LIST OF ALL EVENTS
app.get("/events", function(req,res) {
    res.render("events");
});

// NEW ROUTE - DISPLAY FORM TO CREATE A NEW EVENT
app.get("/events/new", function(req,res) {
    res.render("new"); 
});

// CREATE ROUTE
app.post("/events", function(req,res) {
    res.send("this is the create route");
});


// SHOW ROUTE
app.get("/events/:id", function(req,res) {
   res.send("This is the show route"); 
});

// EDIT ROUTE
app.get("/events/:id/edit", function(req,res) {
    res.send("this is the edit route");
});

// UPDATE ROUTE
app.put("/events/:id", function(req, res) {
    res.send("this is the update route");
});

// DESTROY ROUTE
app.delete("/events/:id", function(req,res) {
    res.send("this is the delete route");
});


/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});