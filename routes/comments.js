import express from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import util from "../util";

const commentRouter = express.Router();

const checkPostId = (req, res, next) => {
  const { postId } = req.query;

  Post.findOne({ _id: postId }, (err, post) => {
    if (err) {
      return res.json(err);
    }
    res.locals.post = post;
    next();
  });
};

// private functions
const checkPermission = (req, res, next) => {
  const { id } = req.params;

  Comment.findOne({ _id: id }, (err, comment) => {
    if (err) {
      return res.json(err);
    }
    if (comment.author != req.user.id) {
      return util.noPermission(req, res);
    }
    next();
  });
};

// create
commentRouter.post("/", util.isLoggedin, checkPostId, (req, res) => {
  let post = res.locals.post;

  req.body.author = req.user._id;
  req.body.post = post._id;

  Comment.create(req.body, (err) => {
    if (err) {
      req.flash("commentForm", { _id: null, form: req.body });
      req.flash("commentError", { _id: null, errors: util.parseError(err) });
    }
    return res.redirect("/posts/" + post._id + res.locals.getPostQueryString());
  });
});

// update
commentRouter.put(
  "/:id",
  util.isLoggedin,
  checkPermission,
  checkPostId,
  (req, res) => {
    let post = res.locals.post;
    const { id } = req.params;

    req.body.updatedAt = Date.now();
    Comment.findOneAndUpdate(
      { _id: id },
      req.body,
      { runValidators: true },
      (err, comment) => {
        if (err) {
          req.flash("commentForm", { _id: id, form: req.body });
          req.flash("commentError", { _id: id, errors: util.parseError(err) });
        }

        return res.redirect(
          `/posts/${post._id + res.locals.getPostQueryString()}`
        );
      }
    );
  }
);

// destroy
commentRouter.delete(
  "/:id",
  util.isLoggedin,
  checkPermission,
  checkPostId,
  (req, res) => {
    let post = res.locals.post;
    const { id } = req.params;

    Comment.findOne({ _id: id }, (err, comment) => {
      if (err) {
        return res.json(err);
      }

      // save updated comment
      comment.isDeleted = true;
      comment.save((err, comment) => {
        if (err) {
          return res.json(err);
        }

        return res.redirect(
          `/posts/${post._id + res.locals.getPostQueryString()}`
        );
      });
    });
  }
);

module.exports = commentRouter;
