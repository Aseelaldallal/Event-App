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
    

// Route Setup

var indexRoutes = require("./routes/index"),
    eventRoutes = require("./routes/event");

app.use("/", indexRoutes);
app.use("/events", eventRoutes);

// DB Setup

mongoose.connect("mongodb://localhost/event_app");



/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});