import express from "express";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import util from "../util";

// 접근 권한 체크 (글 수정, 글 삭제)
// 즉, 글 작성자 본인에게만 수정 버튼과 삭제버튼이 보이며,
// 마찬가지로 글 작성자 본인만 글의 수정 또는 삭제를 할 수 있다
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

const createSearchQuery = async (queries) => {
  let searchQuery = {};
  if (
    queries.searchType &&
    queries.searchText &&
    queries.searchText.length >= 3
  ) {
    let searchTypes = queries.searchType.toLowerCase().split(",");
    let postQueries = [];

    if (searchTypes.indexOf("title") >= 0) {
      postQueries.push({
        title: { $regex: new RegExp(queries.searchText, "i") },
      });
    }
    if (searchTypes.indexOf("body") >= 0) {
      postQueries.push({
        body: { $regex: new RegExp(queries.searchText, "i") },
      });
    }

    if (searchTypes.indexOf("author!") >= 0) {
      let user = await User.findOne({ username: queries.searchText }).exec();
      if (user) {
        postQueries.push({ author: user._id });
      }
    } else if (searchTypes.indexOf("author") >= 0) {
      let users = await User.find({
        username: { $regex: new RegExp(queries.searchText, "i") },
      }).exec();
      let userIds = [];

      for (let user of users) {
        userIds.push(user._id);
      }

      if (userIds.length > 0) {
        postQueries.push({ author: { $in: userIds } });
      }
    }

    if (postQueries.length > 0) {
      searchQuery = { $or: postQueries };
    } else {
      searchQuery = null;
    }
  }

  return searchQuery;
};

const router = express.Router();

// Index
router.get("/", async (req, res) => {
  let page = Math.max(1, parseInt(req.query.page));
  let limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  let skip = (page - 1) * limit;
  let maxPage = 0;
  let searchQuery = await createSearchQuery(req.query);
  let posts = [];

  if (searchQuery) {
    let count = await Post.countDocuments(searchQuery);
    maxPage = Math.ceil(count / limit);
    posts = await Post.find(searchQuery)
      .populate("author")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .exec();
  }

  res.render("posts/", {
    posts,
    currentPage: page,
    maxPage,
    limit,
    searchType: req.query.searchType,
    searchText: req.query.searchText,
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
    res.redirect(
      "/posts" +
        res.locals.getPostQueryString(false, { page: 1, searchText: "" })
    );
  });
});

// show
router.get("/:id", (req, res) => {
  const { id } = req.params;

  let commentForm = req.flash("commentForm")[0] || { _id: null, form: {} };
  let commentError = req.flash("commentError")[0] || {
    _id: null,
    parentComment: null,
    errors: {},
  };

  Promise.all([
    // Post 콜렉션중에서 id의 값이 _id 와 일치하는 하나의 document 를 찾은 후
    // 그 document 의 author(user 의 _id 가 저장되어있음) 가 참조하고 있는
    // user document 에서 username 을 가져온다
    // 결과는 찾은 post 의 데이터들과 user를 참조하고 있는 author 의 id 와 username 을 가져온다
    // 아래와 같이 말이다.
    /*
    { 
      게시글 데이터
      _id: 5f1b35fa90036d9869fc5045,
      title: '66666 6 test',
      body: '6666666666 6 test',
      author:
        여기만 참조하고 있는 유저 데이터
        { 
          _id: 5f16c1ad41a6765e68a0f613,
          username: 'jeonginsoo',
          id: '5f16c1ad41a6765e68a0f613' 
        },
      여기도 게시글 데이터
      createdAt: 2020-07-24T19:26:50.700Z,
      __v: 0 
    }
    */

    Post.findOne({ _id: id }).populate({ path: "author", select: "username" }),
    Comment.find({ post: id })
      .sort("createdAt")
      .populate({ path: "author", select: "username" }),
  ])
    .then(([post, comments]) => {
      console.log("게시글:", post);
      console.log("댓글:", comments);

      res.render("posts/show", {
        post,
        comments,
        commentForm,
        commentError,
      });
    })
    .catch((err) => {
      console.log("err:", err);
      return res.json(err);
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
