// routes/home.js

import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("home/welcome");
});

router.get("/about", (req, res) => {
  res.render("home/about");
});

module.exports = router;
