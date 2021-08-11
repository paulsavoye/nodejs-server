exports.string_to_slug = function (str) {
  str = str.replace(/^\s+|\s+$/g, "");
  str = str.toLowerCase();

  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return str;
};

exports.getDate = function () {
  return Math.floor(+new Date() / 1000);
};

exports.isJSON = function (str) {
  if (str === "") return true;
  try {
    return JSON.parse(str) && !!str;
  } catch (e) {
    return false;
  }
};

exports.isEmptyObject = function (obj) {
  return !Object.keys(obj).length;
};

exports.sendResponse = function (res, response, code) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response));
};
