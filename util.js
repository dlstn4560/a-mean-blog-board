// util.js

let util = {};

// parseError function
util.parseError = function (errors) {
  var parsed = {};
  if (errors.name == "ValidationError") {
    for (var name in errors.errors) {
      var validationError = errors.errors[name];
      parsed[name] = { message: validationError.message };
    }
  } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
    parsed.username = { message: "This username already exists!" };
  } else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
};

util.isLoggedin = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("errors", { login: "Please Login First!" });
    res.redirect("/login");
  }
};

util.noPermission = (req, res) => {
  req.flash("errors", { login: "You don't have permission!" });
  req.logout();
  res.redirect("/login");
};

util.getPostQueryString = (req, res, next) => {
  res.locals.getPostQueryString = (isAppended = false, overwrites = {}) => {
    let queryString = "";
    let queryArray = [];

    let page = overwrites.page
      ? overwrites.page
      : req.query.page
      ? req.query.page
      : "";
    let limit = overwrites.limit
      ? overwrites.limit
      : req.query.limit
      ? req.query.limit
      : "";
    let searchType = overwrites.searchType
      ? overwrites.searchType
      : req.query.searchType
      ? req.query.searchType
      : "";
    let searchText = overwrites.searchText
      ? overwrites.searchText
      : req.query.searchText
      ? req.query.searchText
      : "";

    if (page) {
      queryArray.push(`page=${page}`);
    }
    if (limit) {
      queryArray.push(`limit=${limit}`);
    }
    if (searchType) {
      queryArray.push(`searchType=${searchType}`);
    }
    if (searchText) {
      queryArray.push(`searchText=${searchText}`);
    }

    if (queryArray.length > 0) {
      queryString = (isAppended ? "&" : "?") + queryArray.join("&");
    }

    return queryString;
  };

  next();
};

module.exports = util;
