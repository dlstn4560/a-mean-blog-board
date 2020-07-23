import express from "express";
import User from "../models/User";
import util from "../util";

const checkPermission = (req, res, next) => {
  User.findOne({ username: req.params.username }, (err, user) => {
    if (err) {
      return res.json(err);
    }
    if (user.id != req.user.id) {
      return util.noPermission(req, res);
    }
    next();
  });
};

const router = express.Router();

// New
router.get("/new", (req, res) => {
  const user = req.flash("user")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("users/new", { user, errors });
});

// create
router.post("/", (req, res) => {
  User.create(req.body, (err) => {
    if (err) {
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/users/new");
    }
    res.redirect("/login");
  });
});

// show
router.get("/:username", util.isLoggedin, checkPermission, (req, res) => {
  const { username } = req.params;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.json(err);
    }

    res.render("users/show", { user });
  });
});

// edit
router.get("/:username/edit", util.isLoggedin, checkPermission, (req, res) => {
  const { username } = req.params;
  const user = req.flash("user")[0];
  const errors = req.flash("errors")[0] || {};

  if (!user) {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return res.json(err);
      }
      res.render("users/edit", { username, user, errors });
    });
  } else {
    res.render("users/edit", { username, user, errors });
  }
});

// update
router.put("/:username", util.isLoggedin, checkPermission, (req, res, next) => {
  const { username } = req.params;
  const { newPassword } = req.body;

  User.findOne({ username })
    .select("password")
    .exec((err, user) => {
      if (err) {
        return res.json(err);
      }

      // update user object
      user.originalPassword = user.password;
      user.password = newPassword ? newPassword : user.password;
      for (const p in req.body) {
        user[p] = req.body[p];
      }

      // save updated user
      user.save((err, user) => {
        if (err) {
          req.flash("user", req.body);
          req.flash("errors", util.parseError(err));
          return res.redirect("/users/" + username + "/edit");
        }
        res.redirect("/users/" + user.username);
      });
    });
});

module.exports = router;
