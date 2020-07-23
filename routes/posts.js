import express from "express";
import Post from "../models/Post";
import util from "../util";

const checkPermission = (req, res, next) => {
  Post.findOne({ _id: req.params.id }, (err, post) => {
    if (err) {
      return res.json(err);
    }
    if (post.author != req.user.id) {
      return util.noPermission(req, res);
    }
    next();
  });
};

const router = express.Router();

// Index
router.get("/", async (req, res) => {
  let page = Math.max(1, parseInt(req.query.page));
  let limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  let skip = (page - 1) * limit;
  let count = await Post.countDocuments({});
  let maxPage = Math.ceil(count / limit);
  let posts = await Post.find({})
    .populate("author")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .exec();

  res.render("posts/", {
    posts,
    currentPage: page,
    maxPage,
    limit,
  });
});

// New
router.get("/new", util.isLoggedin, (req, res) => {
  const post = req.flash("post")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("posts/new", { post, errors });
});

// create
router.post("/", util.isLoggedin, (req, res) => {
  req.body.author = req.user._id;
  Post.create(req.body, (err) => {
    if (err) {
      req.flash("post", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/posts/new" + res.locals.getPostQueryString());
    }
    res.redirect("/posts" + res.locals.getPostQueryString(false, { page: 1 }));
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
router.get("/:id/edit", util.isLoggedin, checkPermission, (req, res) => {
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
router.put("/:id", util.isLoggedin, checkPermission, (req, res) => {
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
        return res.redirect(
          `/posts/${id}/edit${res.locals.getPostQueryString()}`
        );
      }
      res.redirect(`/posts/${id}${res.locals.getPostQueryString()}`);
    }
  );
});

// delete
router.delete("/:id", util.isLoggedin, checkPermission, (req, res) => {
  const { id } = req.params;

  Post.deleteOne({ _id: id }, (err) => {
    if (err) {
      return res.json(err);
    }
    res.redirect("/posts" + res.locals.getPostQueryString());
  });
});

module.exports = router;
