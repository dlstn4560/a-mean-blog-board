import express from "express";
import User from "../models/User";

const router = express.Router();

// Index
router.get("/", (req, res) => {
  User.find({})
    .sort({ username: 1 })
    .exec((err, users) => {
      if (err) {
        return res.json(err);
      }
      res.render("users/", { users });
    });
});

// New
router.get("/new", (req, res) => {
  res.render("users/new");
});

// create
router.post("/", (req, res) => {
  User.create(req.body, (err) => {
    if (err) {
      return res.json(err);
    }
    res.redirect("/users");
  });
});

// show
router.get("/:username", (req, res) => {
  const { username } = req.params;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.json(err);
    }

    res.render("users/show", { user });
  });
});

// edit
router.get("/:username/edit", (req, res) => {
  const { username } = req.params;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.json(err);
    }

    res.render("users/edit", { user });
  });
});

// update
router.put("/:username", (req, res, next) => {
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
      console.log(user);

      // save updated user
      user.save((err, user) => {
        if (err) {
          return res.json(err);
        }
        res.redirect("/users/" + user.username);
      });
    });
});

// delete
router.delete("/:username", (req, res) => {
  const { username } = req.params;

  User.deleteOne({ username }, (err) => {
    if (err) {
      return res.json(err);
    }

    res.redirect("/users");
  });
});

module.exports = router;
