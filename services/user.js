const database = require("../db/db");
const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");

exports.jwtRequest = function (data, res) {
  var db = database.getDb();

  if (data.body.username && data.body.password) {
    db.collection("users").findOne(
      { username: data.body.username },
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          if (result !== null)
            if (result.password === data.body.password) {
              let token = jwt.sign(
                { username: result.username },
                process.env.SECRET_PASS,
                {
                  algorithm: "HS256",
                  expiresIn: 60 * 60,
                }
              );
              utils.sendResponse(res, { jwt: token }, 200);
            } else
              utils.sendResponse(
                res,
                { error: "Username or password invalid." },
                401
              );
          else
            utils.sendResponse(
              res,
              { error: "Username or password invalid." },
              401
            );
        }
      }
    );
  } else
    utils.sendResponse(res, { error: "Username or password missing." }, 400);
};
