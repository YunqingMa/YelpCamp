const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require('mongoose'),
      flash         = require("connect-flash"),
      passport      = require("passport"),
      localStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      campground    = require("./models/campground"),
      comment       = require("./models/comment"),
      user          = require("./models/user"),
      seedDB        = require("./seed");

const commentRoutes    = require("./routes/comments"),
      campgroundRoutes = require("./routes/campgrounds"),
      indexRoutes      = require("./routes/index");

const url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp";

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to yelp_camp!'))
.catch(error => console.log(error.message));

mongoose.set('useFindAndModify', false);
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// passport configuration
app.use(require("express-session")({
    secret: "bla bla bla",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use(indexRoutes);

const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("The YelpCamp Server Has Started!");
});