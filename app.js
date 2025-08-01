if(process.env.NODE_ENV != "production") {
  require('dotenv').config()
} 
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, './public')));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});

const dbUrl = process.env.ATLASDB_URL;

main()
  .then((data) => {
    console.log("Connected DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
// Mongo Session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter : 24*3600,
})
store.on("error",(err)=>{
  console.log("Error in Mongo Session store",err)
})
//express-Session 
const sessionOption = {
  store,
  secret :process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie : {
    expires : Date.now() + 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly : true
  }
};


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)


//for  Not Defined Paths 
app.use((req, res,next) => {
  next(new ExpressError(404,"Page Not Found"));
});

//Middeleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs",{ message});
});

