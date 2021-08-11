const database = require("../db/db");
const mongo = require("mongodb"),
  ObjectID = mongo.ObjectID;
const utils = require("../utils/utils");

exports.newComment = function (data, res) {
  var db = database.getDb();

  if (data.body.username && data.body.content) {
    var id = new ObjectID();

    db.collection("articles").updateOne(
      { slug: data.id, author: { $ne: data.body.username } },
      {
        $push: {
          comments: {
            _id: id,
            username: data.body.username,
            content: data.body.content,
          },
        },
      },
      function (err, result) {
        if (err) console.log(err);
        if (result.result.n > 0)
          utils.sendResponse(
            res,
            {
              ok: "Comment created.",
              comment: data.body,
              _id: id,
            },
            200
          );
        else
          utils.sendResponse(
            res,
            {
              error:
                "Article not found or Author cannot publish comment on their own articles.",
            },
            404
          );
      }
    );
  } else
    utils.sendResponse(res, { error: "Comment or username missing." }, 400);
};

exports.deleteComment = function (data, res, user) {
  var db = database.getDb();

  db.collection("articles").updateOne(
    { slug: data.id, author: user.username },
    { $pull: { comments: { _id: new ObjectID(data.queryString.comment_id) } } },
    function (err, result) {
      if (err) console.log(err);
      if (result.result.nModified > 0)
        utils.sendResponse(res, { ok: "Comment deleted." }, 200);
      else utils.sendResponse(res, { error: "Comment not found." }, 404);
    }
  );
};
