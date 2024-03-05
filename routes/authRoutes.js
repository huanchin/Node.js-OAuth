const express = require("express");
const router = express.Router();
const passport = require("passport");
const { signup } = require("./../controllers/authController");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// router.post("/login", login);
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "Wrong email or password!", // error 會自動送進res.locals.error
  }),
  (req, res) => {
    res.redirect("/profile");
  }
);

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.post("/signup", signup);

router.get("/logout", (req, res, next) => {
  console.log("logging out...");
  req.logOut();
  res.redirect("/");
});

router.get(
  "/google",
  // 1) kick-start this authentication process thru passport
  // scope is to declare what we want to retrieve from the user's profile
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 4) callback route for Google to redirect to
// get code from google and exchange the code for profile info
// comes back with profile information
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  // 6) render the page
  (req, res) => {
    console.log("redirecting...");
    res.redirect("/profile");
  }
);

module.exports = router;
