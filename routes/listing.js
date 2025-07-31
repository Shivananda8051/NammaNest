const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middelware.js");
const listingController = require("../controllers/listings");
const multer = require("multer");
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});
router.get('/search', listingController.searchListings);
// New & Create Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/")
  //Index Route
  .get(wrapAsync(listingController.index))
  // Create Route 
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );
  

router.route("/:id")
// Showroute
.get(wrapAsync(listingController.showListing))
//update route
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.UpdateListing)
)
//DeleteRoute
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
)
  
//edit specific hotel detail
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEdit)
);




module.exports = router; 
