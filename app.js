/***************************************************/
/********************* SETUP ***********************/
/***************************************************/

var express             = require("express"),
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    localStrategy       = require("passport-local"),
    expressSession      = require("express-session"),
    Event               = require("./models/event"),
    User                = require("./models/user");
    
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

// Run Express Session

app.use(expressSession({
    secret: "The cat sat on the mat", 
    resave: false,
    saveUninitialized: false
}));

// Set up passport

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set up middleware. app.use calls this function on every route
// passport is what creates req.user, it puts id in it
app.use(function(req,res, next) {
    res.locals.currentUser = req.user; // whatever we put in res.locals is what is available in our template. this is empty if no one is logged in
    next(); // move on to next code
})


/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});