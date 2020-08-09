const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware"),
      comment       = require("../models/comment"),
      campground    = require("../models/campground");
router.get("/", function(req, res){
    campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds : campgrounds});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    let name = req.body.name;
    let price = req.body.price;
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newCampground = {name: name, price: price, image: image, description: desc, author: author};
    campground.create(newCampground, function(err, newCamp){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
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

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
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