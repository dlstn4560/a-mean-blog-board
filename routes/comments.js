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

module.exports = commentRouter;
