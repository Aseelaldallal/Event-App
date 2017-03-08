/***************************************************/
/********************* SETUP ***********************/
/***************************************************/

var express             = require("express"),
    app                 = express(), 
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    mongoose            = require("mongoose"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    localStrategy       = require("passport-local"),
    expressSession      = require("express-session"),
    Event               = require("./models/event"),
    User                = require("./models/user");
    
// Require routes

var indexRoutes         = require("./routes/index"),
    eventRoutes         = require("./routes/event");

// DB Connect
mongoose.connect("mongodb://localhost/event_app");

// Configure

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

    
// Configure passport

app.use(expressSession({
    secret: "Helo is the cutest baby",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Middleware -- Should I move this?
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

// Use Routes

app.use("/", indexRoutes);
app.use("/events", eventRoutes);


/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});