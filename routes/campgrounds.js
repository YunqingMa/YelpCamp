const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware"),
      comment       = require("../models/comment"),
      campground    = require("../models/campground");

const NodeGeocoder = require('node-geocoder');
 
const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
       
const geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
    campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds : campgrounds, page: "campgrounds"});
        }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      campground.create(newCampground, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
              res.redirect("/campgrounds");
          }
      });
    });
  });

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

router.get("/:id", function(req,res){
    campground.findById(req.params.id).populate("comments").exec(function(err, foundCamp){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCamp});
        }
    });
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
    });
  });

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
        if(err){
            res.redirect("/campgrounds");
            req.flash("error", "Something went wrong!");
        } else {
            //delete comments of removed campground
            comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, function(err){
                if (err) {
                    req.flash("error", "Something went wrong!");
                    return res.redirect("/campgrounds");
                }
                req.flash("success", "Sucessfully deleted campground!");
                res.redirect("/campgrounds");
            });
        }
    });
});

module.exports = router;