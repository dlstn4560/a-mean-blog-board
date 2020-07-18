import express from "express";
import Post from "../models/Post";

const router = express.Router();

// Index
router.get("/", (req, res) => {
  Post.find({})
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
  res.render("posts/new");
});

// create
// Test : post 매개변수 없애보기(성공)
router.post("/", (req, res) => {
  Post.create(req.body, (err) => {
    if (err) {
      return res.json(err);
    }
    res.redirect("/posts");
  });
});

// show
router.get("/:id", (req, res) => {
  const { id } = req.params;

  Post.findOne({ _id: id }, (err, post) => {
    if (err) {
      return res.json(err);
    }
    res.render("posts/show", { post });
  });
});

// edit
router.get("/:id/edit", (req, res) => {
  const { id } = req.params;

  Post.findOne({ _id: id }, (err, post) => {
    if (err) {
      return res.json(err);
    }
    res.render("posts/edit", { post });
  });
});

// update
// Test : post 매개변수 없애보기(성공)
router.put("/:id", (req, res) => {
  req.body.updatedAt = Date.now();
  const { id } = req.params;

  Post.findOneAndUpdate({ _id: id }, req.body, (err) => {
    if (err) {
      return res.json(err);
    }
    res.redirect(`/posts/${id}`);
  });
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
