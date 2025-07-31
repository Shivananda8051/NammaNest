const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js")
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middelware.js");
const ReviewController = require("../controllers/review.js");


// Review Route .. POST ROUTE
router.post("/",isLoggedIn,validateReview, wrapAsync(ReviewController.createReview)); 
 

// Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync (ReviewController.destroyReview));

module.exports = router;