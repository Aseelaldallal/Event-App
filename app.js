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
    User                = require("./models/user"),
    moment              = require("moment"),
    favicon             = require('serve-favicon');
    


// favicon ignore
app.use(favicon(__dirname + '/public/favicon.ico'));

// Require routes

var indexRoutes         = require("./routes/index"),
    eventRoutes         = require("./routes/event"),
    userRoutes          = require("./routes/user");

// DB Connect
mongoose.connect(process.env.DATABASEURL);
//mongodb://localhost/event_app

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
app.use("/user", userRoutes);


// Moment
app.locals.moment = moment; 

// Error Handling

app.use(function(req, res) {
   res.render("error")
});
  
app.use( function(err, req, res, next) {
  var statusCode = err.status || 500;
  var statusText = '';
  var errorDetail = (process.env.NODE_ENV === 'production') ? 'Sorry about this error' : err.stack;

  switch (statusCode) {
  case 400:
    statusText = 'Bad Request: ' + err.message;
    break;
  case 401:
    statusText = 'Unauthorized';
    break;
  case 403:
    statusText = 'Forbidden';
    break;
  case 500:
    statusText = 'Internal Server Error';
    break;
  }

  res.status(statusCode);

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.log(errorDetail);
  }

  if (req.accepts('html')) {
    res.render('error/', { title: statusCode + ': ' + statusText, error: errorDetail, url: req.url });
    return;
  }

  if (req.accepts('json')) {
    res.send({ title: statusCode + ': ' + statusText, error: errorDetail, url: req.url });
  }
});


/***************************************************/
/********************* LISTEN **********************/
/***************************************************/

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Event App Server Has Started!");
});