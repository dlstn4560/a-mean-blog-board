import express from "express";
import Post from "../models/Post";
import util from "../util";

const router = express.Router();

// Index
router.get("/", (req, res) => {
  Post.find({})
    .populate("author")
    .sort("-createdAt")
    .exec((err, posts) => {
      if (err) {
        return res.json(err);
      }
      res.render("posts/", { posts });
    });
});

// New
router.get("/new", (req, res) => {
  const post = req.flash("post")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("posts/new", { post, errors });
});

// create
router.post("/", (req, res) => {
  req.body.author = req.user._id;
  Post.create(req.body, (err) => {
    if (err) {
      req.flash("post", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/posts/new");
    }
    res.redirect("/posts");
  });
});

// show
router.get("/:id", (req, res) => {
  const { id } = req.params;

  Post.findOne({ _id: id })
    .populate("author")
    .exec((err, post) => {
      if (err) {
        return res.json(err);
      }
      res.render("posts/show", { post });
    });
});

// edit
router.get("/:id/edit", (req, res) => {
  const { id } = req.params;
  const post = req.flash("post")[0];
  const errors = req.flash("errors")[0] || {};

  if (!post) {
    Post.findOne({ _id: id }, (err, post) => {
      if (err) {
        return res.json(err);
      }
      res.render("posts/edit", { post, errors });
    });
  } else {
    // form action 경로에 사용될 값
    // action="/posts/<%= post._id %>?_method=put"
    post._id = id;
    res.render("posts/edit", { post, errors });
  }
});

// update
router.put("/:id", (req, res) => {
  req.body.updatedAt = Date.now();
  const { id } = req.params;

  Post.findOneAndUpdate(
    { _id: id },
    req.body,
    { runValidators: true },
    (err) => {
      if (err) {
        req.flash("post", req.body);
        req.flash("errors", util.parseError(err));
        return res.redirect(`/posts/${id}/edit`);
      }
      res.redirect(`/posts/${id}`);
    }
  );
});

// delete
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  Post.deleteOne({ _id: id }, (err) => {
    if (err) {
      return res.json(err);
    }
    res.redirect("/posts");
  });
});

module.exports = router;
