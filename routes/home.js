// routes/home.js

import express from "express";
import passport from "../config/passport";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home/welcome");
});

router.get("/about", (req, res) => {
  res.render("home/about");
});

// Login
router.get("/login", (req, res) => {
  const username = req.flash("username")[0];
  const errors = req.flash("errors")[0] || {};

  res.render("home/login", {
    username,
    errors,
  });
});

// Post Login
router.post(
  "/login",
  (req, res, next) => {
    let errors = {};
    let isValid = true;

    if (!req.body.username) {
      isValid = false;
      errors.username = "Username is required!";
    }
    if (!req.body.password) {
      isValid = false;
      errors.password = "Password is required!";
    }

    if (isValid) {
      next();
    } else {
      req.flash("errors", errors);
      res.redirect("/login");
    }
  },
  passport.authenticate("local-login", {
    successRedirect: "/posts",
    failureRedirect: "/login",
  })
);

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
