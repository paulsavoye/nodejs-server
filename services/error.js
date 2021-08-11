const utils = require("../utils/utils");

exports.invalidRequest = function (res) {
  utils.sendResponse(res, { error: "Invalid Request." }, 404);
};

exports.invalidMethod = function (res) {
  utils.sendResponse(res, { error: "Method not allowed." }, 405);
};
