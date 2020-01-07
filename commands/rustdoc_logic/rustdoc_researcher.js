const { initSearch } = require("./search.js");

function searchRustDoc(searchString) {
  if (!searchString || typeof searchString !== "string") {
    return {
      error: "searchDoc expects a string parameter"
    };
  }
  return initSearch(searchString);
}

module.exports = searchRustDoc;
