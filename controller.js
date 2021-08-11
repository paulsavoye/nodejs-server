const http = require("http");
const url = require("url");
const jwt = require("jsonwebtoken");
const utils = require("./utils/utils");
const users = require("./services/user");
const pages = require("./services/pages");
const articles = require("./services/articles");
const comments = require("./services/comments");

const error = require("./services/error");

function isAuthenticated(data, res, next) {
  if (typeof data.headers.authorization !== "undefined") {
    let token = data.headers.authorization.split(" ")[1];

    jwt.verify(
      token,
      process.env.SECRET_PASS,
      { algorithm: "HS256" },
      (err, user) => {
        if (err) {
          console.log(err);

          utils.sendResponse(res, { error: "Not Authorized." }, 500);
        } else {
          return next(data, res, user);
        }
      }
    );
  } else utils.sendResponse(res, { error: "Not Authorized." }, 500);
}

module.exports = http.createServer((req, res) => {
  let parsedURL = url.parse(req.url, true);
  let path = parsedURL.pathname;

  path = path.replace(/^\/+|\/+$/g, "");
  let qs = parsedURL.query;
  let headers = req.headers;
  let method = req.method.toLowerCase();
  let body = "";

  req.on("data", function (chunk) {
    body += chunk;
  });

  req.on("end", function () {
    let params = path.split("/");
    let realpath = params[0];
    let id = params[1];

    let route =
      typeof routes[realpath] !== "undefined"
        ? routes[realpath]
        : routes["notFound"];

    if (utils.isJSON(body)) {
      body = body === "" ? null : JSON.parse(body);
    } else {
      utils.sendResponse(res, { error: "Invalid JSON." }, 400);
      return;
    }
    let data = {
      path: path,
      queryString: qs,
      headers: headers,
      method: method,
      body: body,
      id: id,
    };
    route(data, res);
  });
});

let routes = {
  login: function (data, res) {
    if (data.method === "post") users.jwtRequest(data, res);
    else error.invalidMethod(res);
  },
  pages: function (data, res) {
    if (data.id && data.method === "get")
      isAuthenticated(data, res, pages.readPage);
    else if (data.id && data.method === "delete")
      isAuthenticated(data, res, pages.deletePage);
    else if (data.id && data.method === "put")
      isAuthenticated(data, res, pages.updatePage);
    else if (data.method === "get") isAuthenticated(data, res, pages.getPages);
    else if (data.method === "post") isAuthenticated(data, res, pages.newPage);
    else error.invalidRequest(res);
  },
  articles: function (data, res) {
    if (data.id && data.method === "get")
      isAuthenticated(data, res, articles.readArticle);
    else if (data.id && data.method === "delete")
      isAuthenticated(data, res, articles.deleteArticle);
    else if (data.id && data.method === "put")
      isAuthenticated(data, res, articles.updateArticle);
    else if (data.method === "get")
      isAuthenticated(data, res, articles.getArticles);
    else if (data.method === "post")
      isAuthenticated(data, res, articles.newArticle);
    else error.invalidRequest(res);
  },
  comments: function (data, res) {
    if (data.id && data.method === "post") comments.newComment(data, res);
    else if (data.id && data.method === "delete")
      isAuthenticated(data, res, comments.deleteComment);
    else error.invalidRequest(res);
  },
  notFound: function (data, res) {
    error.invalidRequest(res);
  },
};
