var MongoClient = require("mongodb").MongoClient;

var url = process.env.DB_URL;

var _db;

exports.connectDb = function () {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    _db = db.db("nodejs");
  });
};

exports.getDb = function () {
  return _db;
};
