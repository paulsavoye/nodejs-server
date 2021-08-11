const utils = require("../utils/utils");
const database = require("../db/db");

exports.newArticle = function (data, res, user) {
  var db = database.getDb();

  if (data.body.title && data.body.content && data.body.publish_date) {
    var response = {
      author: user.username,
      slug: utils.string_to_slug(data.body.title),
      ...data.body,
    };

    db.collection("articles").findOne(
      { slug: response.slug },
      function (err, result) {
        if (err) console.log(err);
        else {
          if (result === null) {
            db.collection("articles").insertOne(response, function (err) {
              if (err) throw err;
              utils.sendResponse(res, response, 200);
              console.log("Article created.");
            });
          } else
            utils.sendResponse(res, { error: "Title must be unique." }, 400);
        }
      }
    );
  } else
    utils.sendResponse(
      res,
      { error: "Title, content or publish_date missing." },
      400
    );
};

exports.readArticle = function (data, res, user) {
  var db = database.getDb();

  db.collection("articles").findOne({ slug: data.id }, function (err, result) {
    if (err) console.log(err);
    else {
      if (result !== null) {
        if (
          utils.getDate() > result.publish_date ||
          user.username === result.author
        )
          utils.sendResponse(res, result, 200);
        else
          utils.sendResponse(
            res,
            { error: "Article isn't published yet." },
            401
          );
      } else utils.sendResponse(res, { error: "Article not found" }, 404);
    }
  });
};

exports.deleteArticle = function (data, res, user) {
  var db = database.getDb();

  db.collection("articles").deleteOne(
    { slug: data.id, author: user.username },
    function (err, result) {
      if (err) console.log(err);
      if (result.result.n > 0)
        utils.sendResponse(res, { ok: "Article deleted." }, 200);
      else utils.sendResponse(res, { error: "Article not found." }, 404);
    }
  );
};

exports.updateArticle = function (data, res, user) {
  var db = database.getDb();

  if (data.body.title) {
    data.body.slug = utils.string_to_slug(data.body.title);
  }

  if (!utils.isEmptyObject(data.body)) {
    db.collection("articles").updateOne(
      { slug: data.id, author: user.username },
      {
        $set: {
          ...data.body,
        },
      },
      function (err, result) {
        if (err) console.log(err);
        if (result.result.n > 0)
          utils.sendResponse(
            res,
            { ok: "Article updated.", data: data.body },
            200
          );
        else utils.sendResponse(res, { error: "Article not found." }, 404);
      }
    );
  } else utils.sendResponse(res, { error: "Body cannot be empty." }, 400);
};

exports.getArticles = function (data, res, user) {
  var db = database.getDb();
  var page = parseInt(data.queryString.page);
  var per_page = parseInt(data.queryString.per_page);

  db.collection("articles")
    .find({
      $or: [
        { publish_date: { $lte: utils.getDate() } },
        { author: { $eq: user.username } },
      ],
    })
    .skip(page * per_page - per_page)
    .limit(per_page)
    .toArray(function (err, result) {
      if (err) console.log(err);
      else utils.sendResponse(res, result, 200);
    });
};
