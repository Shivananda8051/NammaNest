const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    console.log(req.originalUrl);
    req.flash("error", "You must be logged in to add listing");
    return res.redirect("/login");
  }
  next();
};


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next) =>{
     let {id} = req.params;
      let listing = await Listing.findById(id);
      if(res.locals.currUser && !listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error","You are not owner of this listing!");
        return res.redirect(`/listings/${id}`);
      }
      next();
}

// Validation for listings
module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  } 
}

// Validation for Review
module.exports.validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

// for reviews
module.exports.isReviewAuthor = async(req,res,next) =>{
     let {id,reviewId} = req.params;
      let review = await Review.findById(reviewId);
      if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You did not author of this Review!");
        return res.redirect(`/listings/${id}`);
      }
      next();
}