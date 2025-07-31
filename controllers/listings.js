const geocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res) => {
    const Alllistings = await Listing.find({});
    res.render("./listings/index.ejs", { Alllistings });
}

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient.forwardGeocode({
    query : req.body.listing.location,
    limit:1
  }).send()

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image= {url,filename};
  newListing.geometry = response.body.features[0].geometry;
  let savedList = await newListing.save();
  // console.log(savedList);
  req.flash("success", "New listing created");
  res.redirect("/listings");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for doesn't exist!");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listings/show.ejs", { listing });
}

module.exports.renderEdit = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for doesn't exist!");
      return res.redirect("/listings");
    }
    let original = listing.image.url;
    original = original.replace("/upload","/upload/h_300,w_250");
    res.render("./listings/edit.ejs", { listing, original});
}

module.exports.UpdateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !== "undefined") {
    let url = req.file.path;
  let filename = req.file.filename;
  listing.image = {url,filename};
  await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.searchListings = async (req, res) => {
  const query = req.query.q || '';
  try {
    const listings = await Listing.find({
      location: { $regex: query, $options: 'i' }
    });

    res.render('listings/searchResults', { query, listings });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).send("Server error during search");
  }
};
