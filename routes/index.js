const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      campground    = require("../models/campground"),
      user          = require("../models/user");
router.get("/", function(req, res){
    res.render("landing");
});

router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});

router.post("/register", function(req, res){
    let newUser = new user({username : req.body.username});
    user.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect : "/login"
    }), function(req, res){
});

router.get("/logout", function(req, res){
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;