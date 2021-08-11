const utils = require("../utils/utils");
const database = require("../db/db");

exports.newPage = function (data, res, user) {
  var db = database.getDb();

  if (data.body.title && data.body.content && data.body.publish_date) {
    var response = {
      author: user.username,
      slug: utils.string_to_slug(data.body.title),
      ...data.body,
    };

    db.collection("pages").findOne(
      { slug: response.slug },
      function (err, result) {
        if (err) console.log(err);
        else {
          if (result === null) {
            db.collection("pages").insertOne(response, function (err) {
              if (err) throw err;
              utils.sendResponse(res, response, 200);
              console.log("Page created.");
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

exports.readPage = function (data, res, user) {
  var db = database.getDb();

  db.collection("pages").findOne({ slug: data.id }, function (err, result) {
    if (err) console.log(err);
    else {
      if (result !== null) {
        if (
          utils.getDate() > result.publish_date ||
          user.username === result.author
        )
          utils.sendResponse(res, result, 200);
        else
          utils.sendResponse(res, { error: "Page isn't published yet." }, 401);
      } else utils.sendResponse(res, { error: "Page not found." }, 404);
    }
  });
};

exports.deletePage = function (data, res, user) {
  var db = database.getDb();

  db.collection("pages").deleteOne(
    { slug: data.id, author: user.username },
    function (err, result) {
      if (err) console.log(err);
      if (result.result.n > 0)
        utils.sendResponse(res, { ok: "Page deleted." }, 200);
      else utils.sendResponse(res, { error: "Page not found." }, 404);
    }
  );
};

exports.updatePage = function (data, res, user) {
  var db = database.getDb();

  if (data.body.title) {
    data.body.slug = utils.string_to_slug(data.body.title);
  }

  if (!utils.isEmptyObject(data.body)) {
    db.collection("pages").updateOne(
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
            { ok: "Page updated.", data: data.body },
            200
          );
        else utils.sendResponse(res, { error: "Page not found." }, 404);
      }
    );
  } else utils.sendResponse(res, { error: "Body cannot be empty." }, 400);
};

exports.getPages = function (data, res, user) {
  var db = database.getDb();
  var page = parseInt(data.queryString.page);
  var per_page = parseInt(data.queryString.per_page);

  db.collection("pages")
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
