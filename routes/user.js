const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

const { saveRedirectUrl } = require("../middelware.js");
const UserController = require("../controllers/user.js");

router
  .route("/signup")
  .get(UserController.renderSignup)
  .post(wrapAsync(UserController.signup));

router
  .route("/login")
  .get(UserController.renderLogin)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.login
  );

router.get("/logout", UserController.destroyUser);
module.exports = router;
