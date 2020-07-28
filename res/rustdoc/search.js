const rootPath = "https://doc.rust-lang.org/";
const ALIASES = require("./aliases");
const rawSearchIndex = require("./search-index");
const window = { crate: undefined };
var search_input = {};
var itemTypes = [
  "mod",
  "externcrate",
  "import",
  "struct",
  "enum",
  "fn",
  "type",
  "static",
  "trait",
  "impl",
  "tymethod",
  "method",
  "structfield",
  "variant",
  "macro",
  "primitive",
  "associatedtype",
  "constant",
  "associatedconstant",
  "union",
  "foreigntype",
  "keyword",
  "existential",
  "attr",
  "derive",
  "traitalias"
];
var currentTab = 0;

var TY_PRIMITIVE = itemTypes.indexOf("primitive");
var TY_KEYWORD = itemTypes.indexOf("keyword");

function onEach(arr, func, reversed) {
  if (arr && arr.length > 0 && func) {
    var length = arr.length;
    if (reversed !== true) {
      for (var i = 0; i < length; ++i) {
        if (func(arr[i]) === true) {
          return true;
        }
      }
    } else {
      for (var i = length - 1; i >= 0; --i) {
        if (func(arr[i]) === true) {
          return true;
        }
      }
    }
  }
  return false;
}
function onEachLazy(lazyArray, func, reversed) {
  return onEach(Array.prototype.slice.call(lazyArray), func, reversed);
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(suffix, length) {
    var l = length || this.length;
    return this.indexOf(suffix, l - suffix.length) !== -1;
  };
}

var levenshtein_row2 = [];
function levenshtein(s1, s2) {
  if (s1 === undefined || s2 === undefined) return 999999999999999999
  if (s1 === s2) {
    return 0;
  }
  var s1_len = s1.length,
    s2_len = s2.length;
  if (s1_len && s2_len) {
    var i1 = 0,
      i2 = 0,
      a,
      b,
      c,
      c2,
      row = levenshtein_row2;
    while (i1 < s1_len) {
      row[i1] = ++i1;
    }
    while (i2 < s2_len) {
      c2 = s2.charCodeAt(i2);
      a = i2;
      ++i2;
      b = i2;
      for (i1 = 0; i1 < s1_len; ++i1) {
        c = a + (s1.charCodeAt(i1) !== c2 ? 1 : 0);
        a = row[i1];
        b = b < a ? (b < c ? b + 1 : c) : a < c ? a + 1 : c;
        row[i1] = b;
      }
    }
    return b;
  }
  return s1_len + s2_len;
}
function initSearch(str, params, search_input) {
  var currentResults, index, searchIndex;
  var MAX_LEV_DISTANCE = 3;
  var MAX_RESULTS = 200;
  var GENERICS_DATA = 1;
  var NAME = 0;
  var INPUTS_DATA = 0;
  var OUTPUT_DATA = 1;
  params = { search: str.trim() };
  search_input = { value: params.search };
  function execQuery(query, searchWords, filterCrates) {
    function itemTypeFromName(typename) {
      var length = itemTypes.length;
      for (var i = 0; i < length; ++i) {
        if (itemTypes[i] === typename) {
          return i;
        }
      }
      return -1;
    }
    var valLower = query.query.toLowerCase(),
      val = valLower,
      typeFilter = itemTypeFromName(query.type),
      results = {},
      results_in_args = {},
      results_returned = {},
      split = valLower.split("::");
    var length = split.length;
    for (var z = 0; z < length; ++z) {
      if (split[z] === "") {
        split.splice(z, 1);
        z -= 1;
      }
    }
    function transformResults(results, isType) {
      var out = [];
      var length = results.length;
      for (var i = 0; i < length; ++i) {
        if (results[i].id > -1) {
          var obj = searchIndex[results[i].id];
          obj.lev = results[i].lev;
          if (isType !== true || obj.type) {
            var res = buildHrefAndPath(obj);
            obj.displayPath = pathSplitter(res[0]);
            obj.fullPath = obj.displayPath + obj.name;
            obj.fullPath += "|" + obj.ty;
            obj.href = res[1];
            out.push(obj);
            if (out.length >= MAX_RESULTS) {
              break;
            }
          }
        }
      }
      return out;
    }
    function sortResults(results, isType) {
      var ar = [];
      for (var entry in results) {
        if (results.hasOwnProperty(entry)) {
          ar.push(results[entry]);
        }
      }
      results = ar;
      var i;
      var nresults = results.length;
      for (i = 0; i < nresults; ++i) {
        results[i].word = searchWords[results[i].id];
        results[i].item = searchIndex[results[i].id] || {};
      }
      if (results.length === 0) {
        return [];
      }
      results.sort(function(aaa, bbb) {
        var a, b;
        a = aaa.word !== val;
        b = bbb.word !== val;
        if (a !== b) {
          return a - b;
        }
        a = aaa.lev;
        b = bbb.lev;
        if (a !== b) {
          return a - b;
        }
        a = aaa.item.crate !== window.currentCrate;
        b = bbb.item.crate !== window.currentCrate;
        if (a !== b) {
          return a - b;
        }
        a = aaa.word.length;
        b = bbb.word.length;
        if (a !== b) {
          return a - b;
        }
        a = aaa.word;
        b = bbb.word;
        if (a !== b) {
          return a > b ? +1 : -1;
        }
        a = aaa.index < 0;
        b = bbb.index < 0;
        if (a !== b) {
          return a - b;
        }
        a = aaa.index;
        b = bbb.index;
        if (a !== b) {
          return a - b;
        }
        if (
          (aaa.item.ty === TY_PRIMITIVE && bbb.item.ty !== TY_KEYWORD) ||
          (aaa.item.ty === TY_KEYWORD && bbb.item.ty !== TY_PRIMITIVE)
        ) {
          return -1;
        }
        if (
          (bbb.item.ty === TY_PRIMITIVE && aaa.item.ty !== TY_PRIMITIVE) ||
          (bbb.item.ty === TY_KEYWORD && aaa.item.ty !== TY_KEYWORD)
        ) {
          return 1;
        }
        a = aaa.item.desc === "";
        b = bbb.item.desc === "";
        if (a !== b) {
          return a - b;
        }
        a = aaa.item.ty;
        b = bbb.item.ty;
        if (a !== b) {
          return a - b;
        }
        a = aaa.item.path;
        b = bbb.item.path;
        if (a !== b) {
          return a > b ? +1 : -1;
        }
        return 0;
      });
      var length = results.length;
      for (i = 0; i < length; ++i) {
        var result = results[i];
        if (result.dontValidate) {
          continue;
        }
        var name = result.item.name.toLowerCase(),
          path = result.item.path.toLowerCase(),
          parent = result.item.parent;
        if (
          isType !== true &&
          validateResult(name, path, split, parent) === false
        ) {
          result.id = -1;
        }
      }
      return transformResults(results);
    }
    function extractGenerics(val) {
      val = val.toLowerCase();
      if (val.indexOf("<") !== -1) {
        var values = val.substring(val.indexOf("<") + 1, val.lastIndexOf(">"));
        return {
          name: val.substring(0, val.indexOf("<")),
          generics: values.split(/\s*,\s*/)
        };
      }
      return {
        name: val,
        generics: []
      };
    }
    function checkGenerics(obj, val) {
      var lev_distance = MAX_LEV_DISTANCE + 1;
      if (val.generics.length > 0) {
        if (
          obj.length > GENERICS_DATA &&
          obj[GENERICS_DATA].length >= val.generics.length
        ) {
          var elems = obj[GENERICS_DATA].slice(0);
          var total = 0;
          var done = 0;
          var vlength = val.generics.length;
          for (var y = 0; y < vlength; ++y) {
            var lev = {
              pos: -1,
              lev: MAX_LEV_DISTANCE + 1
            };
            var elength = elems.length;
            for (var x = 0; x < elength; ++x) {
              var tmp_lev = levenshtein(elems[x], val.generics[y]);
              if (tmp_lev < lev.lev) {
                lev.lev = tmp_lev;
                lev.pos = x;
              }
            }
            if (lev.pos !== -1) {
              elems.splice(lev.pos, 1);
              lev_distance = Math.min(lev.lev, lev_distance);
              total += lev.lev;
              done += 1;
            } else {
              return MAX_LEV_DISTANCE + 1;
            }
          }
          return Math.ceil(total / done);
        }
      }
      return MAX_LEV_DISTANCE + 1;
    }
    function checkType(obj, val, literalSearch) {
      var lev_distance = MAX_LEV_DISTANCE + 1;
      var x;
      if (obj[NAME] === val.name) {
        if (literalSearch === true) {
          if (val.generics && val.generics.length !== 0) {
            if (
              obj.length > GENERICS_DATA &&
              obj[GENERICS_DATA].length >= val.generics.length
            ) {
              var elems = obj[GENERICS_DATA].slice(0);
              var allFound = true;
              for (
                var y = 0;
                allFound === true && y < val.generics.length;
                ++y
              ) {
                allFound = false;
                for (x = 0; allFound === false && x < elems.length; ++x) {
                  allFound = elems[x] === val.generics[y];
                }
                if (allFound === true) {
                  elems.splice(x - 1, 1);
                }
              }
              if (allFound === true) {
                return true;
              }
            } else {
              return false;
            }
          }
          return true;
        }
        if (obj.length > GENERICS_DATA && obj[GENERICS_DATA].length !== 0) {
          var tmp_lev = checkGenerics(obj, val);
          if (tmp_lev <= MAX_LEV_DISTANCE) {
            return tmp_lev;
          }
        } else {
          return 0;
        }
      }
      if (literalSearch === true) {
        if (obj.length > GENERICS_DATA && obj[GENERICS_DATA].length > 0) {
          var length = obj[GENERICS_DATA].length;
          for (x = 0; x < length; ++x) {
            if (obj[GENERICS_DATA][x] === val.name) {
              return true;
            }
          }
        }
        return false;
      }
      lev_distance = Math.min(levenshtein(obj[NAME], val.name), lev_distance);
      if (lev_distance <= MAX_LEV_DISTANCE) {
        lev_distance = Math.ceil((checkGenerics(obj, val) + lev_distance) / 2);
      } else if (obj.length > GENERICS_DATA && obj[GENERICS_DATA].length > 0) {
        var olength = obj[GENERICS_DATA].length;
        for (x = 0; x < olength; ++x) {
          lev_distance = Math.min(
            levenshtein(obj[GENERICS_DATA][x], val.name),
            lev_distance
          );
        }
      }
      return lev_distance + 1;
    }
    function findArg(obj, val, literalSearch) {
      var lev_distance = MAX_LEV_DISTANCE + 1;
      if (
        obj &&
        obj.type &&
        obj.type[INPUTS_DATA] &&
        obj.type[INPUTS_DATA].length > 0
      ) {
        var length = obj.type[INPUTS_DATA].length;
        for (var i = 0; i < length; i++) {
          var tmp = checkType(obj.type[INPUTS_DATA][i], val, literalSearch);
          if (literalSearch === true && tmp === true) {
            return true;
          }
          lev_distance = Math.min(tmp, lev_distance);
          if (lev_distance === 0) {
            return 0;
          }
        }
      }
      return literalSearch === true ? false : lev_distance;
    }
    function checkReturned(obj, val, literalSearch) {
      var lev_distance = MAX_LEV_DISTANCE + 1;
      if (obj && obj.type && obj.type.length > OUTPUT_DATA) {
        var ret = obj.type[OUTPUT_DATA];
        if (!obj.type[OUTPUT_DATA].length) {
          ret = [ret];
        }
        for (var x = 0; x < ret.length; ++x) {
          var r = ret[x];
          if (typeof r === "string") {
            r = [r];
          }
          var tmp = checkType(r, val, literalSearch);
          if (literalSearch === true) {
            if (tmp === true) {
              return true;
            }
            continue;
          }
          lev_distance = Math.min(tmp, lev_distance);
          if (lev_distance === 0) {
            return 0;
          }
        }
      }
      return literalSearch === true ? false : lev_distance;
    }
    function checkPath(contains, lastElem, ty) {
      if (contains.length === 0) {
        return 0;
      }
      var ret_lev = MAX_LEV_DISTANCE + 1;
      var path = ty.path.split("::");
      if (ty.parent && ty.parent.name) {
        path.push(ty.parent.name.toLowerCase());
      }
      var length = path.length;
      var clength = contains.length;
      if (clength > length) {
        return MAX_LEV_DISTANCE + 1;
      }
      for (var i = 0; i < length; ++i) {
        if (i + clength > length) {
          break;
        }
        var lev_total = 0;
        var aborted = false;
        for (var x = 0; x < clength; ++x) {
          var lev = levenshtein(path[i + x], contains[x]);
          if (lev > MAX_LEV_DISTANCE) {
            aborted = true;
            break;
          }
          lev_total += lev;
        }
        if (aborted === false) {
          ret_lev = Math.min(ret_lev, Math.round(lev_total / clength));
        }
      }
      return ret_lev;
    }
    function typePassesFilter(filter, type) {
      if (filter < 0) return true;
      if (filter === type) return true;
      var name = itemTypes[type];
      switch (itemTypes[filter]) {
        case "constant":
          return name == "associatedconstant";
        case "fn":
          return name == "method" || name == "tymethod";
        case "type":
          return name == "primitive" || name == "keyword";
      }
      return false;
    }
    function generateId(ty) {
      if (ty.parent && ty.parent.name) {
        return itemTypes[ty.ty] + ty.path + ty.parent.name + ty.name;
      }
      return itemTypes[ty.ty] + ty.path + ty.name;
    }
    var nSearchWords = searchWords.length;
    var i;
    var ty;
    var fullId;
    var returned;
    var in_args;
    if (
      (val.charAt(0) === '"' || val.charAt(0) === "'") &&
      val.charAt(val.length - 1) === val.charAt(0)
    ) {
      val = extractGenerics(val.substr(1, val.length - 2));
      for (i = 0; i < nSearchWords; ++i) {
        if (
          filterCrates !== undefined &&
          searchIndex[i].crate !== filterCrates
        ) {
          continue;
        }
        in_args = findArg(searchIndex[i], val, true);
        returned = checkReturned(searchIndex[i], val, true);
        ty = searchIndex[i];
        fullId = generateId(ty);
        if (searchWords[i] === val.name) {
          if (
            typePassesFilter(typeFilter, searchIndex[i].ty) &&
            results[fullId] === undefined
          ) {
            results[fullId] = {
              id: i,
              index: -1
            };
          }
        } else if (
          (in_args === true || returned === true) &&
          typePassesFilter(typeFilter, searchIndex[i].ty)
        ) {
          if (in_args === true || returned === true) {
            if (in_args === true) {
              results_in_args[fullId] = {
                id: i,
                index: -1,
                dontValidate: true
              };
            }
            if (returned === true) {
              results_returned[fullId] = {
                id: i,
                index: -1,
                dontValidate: true
              };
            }
          } else {
            results[fullId] = {
              id: i,
              index: -1,
              dontValidate: true
            };
          }
        }
      }
      query.inputs = [val];
      query.output = val;
      query.search = val;
    } else if (val.search("->") > -1) {
      var trimmer = function(s) {
        return s.trim();
      };
      var parts = val.split("->").map(trimmer);
      var input = parts[0];
      var inputs = input
        .split(",")
        .map(trimmer)
        .sort();
      for (i = 0; i < inputs.length; ++i) {
        inputs[i] = extractGenerics(inputs[i]);
      }
      var output = extractGenerics(parts[1]);
      for (i = 0; i < nSearchWords; ++i) {
        if (
          filterCrates !== undefined &&
          searchIndex[i].crate !== filterCrates
        ) {
          continue;
        }
        var type = searchIndex[i].type;
        ty = searchIndex[i];
        if (!type) {
          continue;
        }
        fullId = generateId(ty);
        var typeOutput =
          type.length > OUTPUT_DATA ? type[OUTPUT_DATA].name : "";
        returned = checkReturned(ty, output, true);
        if (output.name === "*" || returned === true) {
          in_args = false;
          var is_module = false;
          if (input === "*") {
            is_module = true;
          } else {
            var allFound = true;
            for (var it = 0; allFound === true && it < inputs.length; it++) {
              allFound = checkType(type, inputs[it], true);
            }
            in_args = allFound;
          }
          if (in_args === true) {
            results_in_args[fullId] = {
              id: i,
              index: -1,
              dontValidate: true
            };
          }
          if (returned === true) {
            results_returned[fullId] = {
              id: i,
              index: -1,
              dontValidate: true
            };
          }
          if (is_module === true) {
            results[fullId] = {
              id: i,
              index: -1,
              dontValidate: true
            };
          }
        }
      }
      query.inputs = inputs.map(function(input) {
        return input.name;
      });
      query.output = output.name;
    } else {
      query.inputs = [val];
      query.output = val;
      query.search = val;
      val = val.replace(/\_/g, "");
      var valGenerics = extractGenerics(val);
      var paths = valLower.split("::");
      var j;
      for (j = 0; j < paths.length; ++j) {
        if (paths[j] === "") {
          paths.splice(j, 1);
          j -= 1;
        }
      }
      val = paths[paths.length - 1];
      var contains = paths.slice(0, paths.length > 1 ? paths.length - 1 : 1);
      for (j = 0; j < nSearchWords; ++j) {
        var lev;
        var lev_distance;
        ty = searchIndex[j];
        if (!ty || (filterCrates !== undefined && ty.crate !== filterCrates)) {
          continue;
        }
        var lev_distance;
        var lev_add = 0;
        if (paths.length > 1) {
          lev = checkPath(contains, paths[paths.length - 1], ty);
          if (lev > MAX_LEV_DISTANCE) {
            continue;
          } else if (lev > 0) {
            lev_add = lev / 10;
          }
        }
        returned = MAX_LEV_DISTANCE + 1;
        in_args = MAX_LEV_DISTANCE + 1;
        var index = -1;
        lev = MAX_LEV_DISTANCE + 1;
        fullId = generateId(ty);
        if (
          searchWords[j].indexOf(split[i]) > -1 ||
          searchWords[j].indexOf(val) > -1 ||
          searchWords[j].replace(/_/g, "").indexOf(val) > -1
        ) {
          if (
            typePassesFilter(typeFilter, ty.ty) &&
            results[fullId] === undefined
          ) {
            index = searchWords[j].replace(/_/g, "").indexOf(val);
          }
        }
        if ((lev = levenshtein(searchWords[j], val)) <= MAX_LEV_DISTANCE) {
          if (typePassesFilter(typeFilter, ty.ty) === false) {
            lev = MAX_LEV_DISTANCE + 1;
          } else {
            lev += 1;
          }
        }
        if ((in_args = findArg(ty, valGenerics)) <= MAX_LEV_DISTANCE) {
          if (typePassesFilter(typeFilter, ty.ty) === false) {
            in_args = MAX_LEV_DISTANCE + 1;
          }
        }
        if ((returned = checkReturned(ty, valGenerics)) <= MAX_LEV_DISTANCE) {
          if (typePassesFilter(typeFilter, ty.ty) === false) {
            returned = MAX_LEV_DISTANCE + 1;
          }
        }
        lev += lev_add;
        if (lev > 0 && val.length > 3 && searchWords[j].indexOf(val) > -1) {
          if (val.length < 6) {
            lev -= 1;
          } else {
            lev = 0;
          }
        }
        if (in_args <= MAX_LEV_DISTANCE) {
          if (results_in_args[fullId] === undefined) {
            results_in_args[fullId] = {
              id: j,
              index: index,
              lev: in_args
            };
          }
          results_in_args[fullId].lev = Math.min(
            results_in_args[fullId].lev,
            in_args
          );
        }
        if (returned <= MAX_LEV_DISTANCE) {
          if (results_returned[fullId] === undefined) {
            results_returned[fullId] = {
              id: j,
              index: index,
              lev: returned
            };
          }
          results_returned[fullId].lev = Math.min(
            results_returned[fullId].lev,
            returned
          );
        }
        if (index !== -1 || lev <= MAX_LEV_DISTANCE) {
          if (index !== -1 && paths.length < 2) {
            lev = 0;
          }
          if (results[fullId] === undefined) {
            results[fullId] = {
              id: j,
              index: index,
              lev: lev
            };
          }
          results[fullId].lev = Math.min(results[fullId].lev, lev);
        }
      }
    }
    var ret = {
      in_args: sortResults(results_in_args, true),
      returned: sortResults(results_returned, true),
      others: sortResults(results)
    };
    if (
      ALIASES &&
      ALIASES[window.currentCrate] &&
      ALIASES[window.currentCrate][query.raw]
    ) {
      var aliases = ALIASES[window.currentCrate][query.raw];
      for (i = 0; i < aliases.length; ++i) {
        aliases[i].is_alias = true;
        aliases[i].alias = query.raw;
        aliases[i].path = aliases[i].p;
        var res = buildHrefAndPath(aliases[i]);
        aliases[i].displayPath = pathSplitter(res[0]);
        aliases[i].fullPath = aliases[i].displayPath + aliases[i].name;
        aliases[i].href = res[1];
        ret.others.unshift(aliases[i]);
        if (ret.others.length > MAX_RESULTS) {
          ret.others.pop();
        }
      }
    }
    return ret;
  }
  function validateResult(name, path, keys, parent) {
    for (var i = 0; i < keys.length; ++i) {
      if (
        !(
          name.indexOf(keys[i]) > -1 ||
          path.indexOf(keys[i]) > -1 ||
          (parent !== undefined && parent.name !== undefined &&
            parent.name.toLowerCase().indexOf(keys[i]) > -1) ||
          levenshtein(name, keys[i]) <= MAX_LEV_DISTANCE
        )
      ) {
        return false;
      }
    }
    return true;
  }
  function getQuery(raw) {
    var matches, type, query;
    query = raw;
    matches = query.match(
      /^(fn|mod|struct|enum|trait|type|const|macro)\s*:\s*/i
    );
    if (matches) {
      type = matches[1].replace(/^const$/, "constant");
      query = query.substring(matches[0].length);
    }
    return {
      raw: raw,
      query: query,
      type: type,
      id: query + type
    };
  }
  function initSearchNav() {
    var hoverTimeout;
    var click_func = function(e) {
      var el = e.target;
      while (el.tagName !== "TR") {
        el = el.parentNode;
      }
      var dst = e.target.getElementsByTagName("a");
      if (dst.length < 1) {
        return;
      }
      dst = dst[0];
      if (window.location.pathname === dst.pathname) {
        addClass(getSearchElement(), "hidden");
        removeClass(main, "hidden");
        document.location.href = dst.href;
      }
    };
    var mouseover_func = function(e) {
      var el = e.target;
      while (el.tagName !== "TR") {
        el = el.parentNode;
      }
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(function() {
        onEachLazy(document.getElementsByClassName("search-results"), function(
          e
        ) {
          onEachLazy(e.getElementsByClassName("result"), function(i_e) {
            removeClass(i_e, "highlighted");
          });
        });
        addClass(el, "highlighted");
      }, 20);
    };
    onEachLazy(document.getElementsByClassName("search-results"), function(e) {
      onEachLazy(e.getElementsByClassName("result"), function(i_e) {
        i_e.onclick = click_func;
        i_e.onmouseover = mouseover_func;
      });
    });
    search_input.onkeydown = function(e) {
      var actives = [[], [], []];
      var current = 0;
      onEachLazy(document.getElementById("results").childNodes, function(e) {
        onEachLazy(e.getElementsByClassName("highlighted"), function(e) {
          actives[current].push(e);
        });
        current += 1;
      });
      if (e.which === 38) {
        if (
          !actives[currentTab].length ||
          !actives[currentTab][0].previousElementSibling
        ) {
          return;
        }
        addClass(actives[currentTab][0].previousElementSibling, "highlighted");
        removeClass(actives[currentTab][0], "highlighted");
      } else if (e.which === 40) {
        if (!actives[currentTab].length) {
          var results = document.getElementById("results").childNodes;
          if (results.length > 0) {
            var res = results[currentTab].getElementsByClassName("result");
            if (res.length > 0) {
              addClass(res[0], "highlighted");
            }
          }
        } else if (actives[currentTab][0].nextElementSibling) {
          addClass(actives[currentTab][0].nextElementSibling, "highlighted");
          removeClass(actives[currentTab][0], "highlighted");
        }
      } else if (e.which === 13) {
        if (actives[currentTab].length) {
          document.location.href = actives[currentTab][0].getElementsByTagName(
            "a"
          )[0].href;
        }
      } else if (e.which === 9) {
        if (e.shiftKey) {
          printTab(currentTab > 0 ? currentTab - 1 : 2);
        } else {
          printTab(currentTab > 1 ? 0 : currentTab + 1);
        }
        e.preventDefault();
      } else if (e.which === 16) {
      } else if (e.which === 27) {
        handleEscape(e);
      } else if (actives[currentTab].length > 0) {
        removeClass(actives[currentTab][0], "highlighted");
      }
    };
  }
  function buildHrefAndPath(item) {
    var displayPath;
    var href;
    var type = itemTypes[item.ty];
    var name = item.name;
    if (type === "mod") {
      displayPath = item.path + "::";
      href =
        rootPath + item.path.replace(/::/g, "/") + "/" + name + "/index.html";
    } else if (type === "primitive" || type === "keyword") {
      displayPath = "";
      href =
        rootPath +
        item.path.replace(/::/g, "/") +
        "/" +
        type +
        "." +
        name +
        ".html";
    } else if (type === "externcrate") {
      displayPath = "";
      href = rootPath + name + "/index.html";
    } else if (item.parent !== undefined) {
      var myparent = item.parent;
      var anchor = "#" + type + "." + name;
      var parentType = itemTypes[myparent.ty];
      if (parentType === "primitive") {
        displayPath = myparent.name + "::";
      } else {
        displayPath = item.path + "::" + myparent.name + "::";
      }
      href =
        rootPath +
        item.path.replace(/::/g, "/") +
        "/" +
        parentType +
        "." +
        myparent.name +
        ".html" +
        anchor;
    } else {
      displayPath = item.path + "::";
      href =
        rootPath +
        item.path.replace(/::/g, "/") +
        "/" +
        type +
        "." +
        name +
        ".html";
    }
    return [displayPath, href];
  }
  function pathSplitter(path) {
    var tmp = "<span>" + path.replace(/::/g, "::</span><span>");
    if (tmp.endsWith("<span>")) {
      return tmp.slice(0, tmp.length - 6);
    }
    return tmp;
  }
  function addTab(array, query, display) {
    var extraStyle = "";
    if (display === false) {
      extraStyle = ' style="display: none;"';
    }
    var output = "";
    var duplicates = {};
    var length = 0;
    if (array.length > 0) {
      output = '<table class="search-results"' + extraStyle + ">";
      array.forEach(function(item) {
        var name, type;
        name = item.name;
        type = itemTypes[item.ty];
        if (item.is_alias !== true) {
          if (duplicates[item.fullPath]) {
            return;
          }
          duplicates[item.fullPath] = true;
        }
        length += 1;
        output +=
          '<tr class="' +
          type +
          ' result"><td>' +
          '<a href="' +
          item.href +
          '">' +
          (item.is_alias === true
            ? '<span class="alias"><b>' +
              item.alias +
              " </b></span><span " +
              'class="grey"><i>&nbsp;- see&nbsp;</i></span>'
            : "") +
          item.displayPath +
          '<span class="' +
          type +
          '">' +
          name +
          "</span></a></td><td>" +
          '<a href="' +
          item.href +
          '">' +
          '<span class="desc">' +
          escape(item.desc) +
          "&nbsp;</span></a></td></tr>";
      });
      output += "</table>";
    } else {
      output =
        '<div class="search-failed"' +
        extraStyle +
        ">No results :(<br/>" +
        'Try on <a href="https://duckduckgo.com/?q=' +
        encodeURIComponent("rust " + query.query) +
        '">DuckDuckGo</a>?<br/><br/>' +
        "Or try looking in one of these:<ul><li>The <a " +
        'href="https://doc.rust-lang.org/reference/index.html">Rust Reference</a> ' +
        " for technical details about the language.</li><li><a " +
        'href="https://doc.rust-lang.org/rust-by-example/index.html">Rust By ' +
        "Example</a> for expository code examples.</a></li><li>The <a " +
        'href="https://doc.rust-lang.org/book/index.html">Rust Book</a> for ' +
        "introductions to language features and the language itself.</li><li><a " +
        'href="https://docs.rs">Docs.rs</a> for documentation of crates released on' +
        ' <a href="https://crates.io/">crates.io</a>.</li></ul></div>';
    }
    return [output, length];
  }
  function makeTabHeader(tabNb, text, nbElems) {
    if (currentTab === tabNb) {
      return (
        '<div class="selected">' +
        text +
        ' <div class="count">(' +
        nbElems +
        ")</div></div>"
      );
    }
    return "<div>" + text + ' <div class="count">(' + nbElems + ")</div></div>";
  }
  function showResults(results) {
    return results;
  }
  function execSearch(query, searchWords, filterCrates) {
    function getSmallest(arrays, positions, notDuplicates) {
      var start = null;
      for (var it = 0; it < positions.length; ++it) {
        if (
          arrays[it].length > positions[it] &&
          (start === null || start > arrays[it][positions[it]].lev) &&
          !notDuplicates[arrays[it][positions[it]].fullPath]
        ) {
          start = arrays[it][positions[it]].lev;
        }
      }
      return start;
    }
    function mergeArrays(arrays) {
      var ret = [];
      var positions = [];
      var notDuplicates = {};
      for (var x = 0; x < arrays.length; ++x) {
        positions.push(0);
      }
      while (ret.length < MAX_RESULTS) {
        var smallest = getSmallest(arrays, positions, notDuplicates);
        if (smallest === null) {
          break;
        }
        for (x = 0; x < arrays.length && ret.length < MAX_RESULTS; ++x) {
          if (
            arrays[x].length > positions[x] &&
            arrays[x][positions[x]].lev === smallest &&
            !notDuplicates[arrays[x][positions[x]].fullPath]
          ) {
            ret.push(arrays[x][positions[x]]);
            notDuplicates[arrays[x][positions[x]].fullPath] = true;
            positions[x] += 1;
          }
        }
      }
      return ret;
    }
    var queries = query.raw.split(",");
    var results = {
      in_args: [],
      returned: [],
      others: []
    };
    for (var i = 0; i < queries.length; ++i) {
      query = queries[i].trim();
      if (query.length !== 0) {
        var tmp = execQuery(getQuery(query), searchWords, filterCrates);
        results.in_args.push(tmp.in_args);
        results.returned.push(tmp.returned);
        results.others.push(tmp.others);
      }
    }
    if (queries.length > 1) {
      return {
        in_args: mergeArrays(results.in_args),
        returned: mergeArrays(results.returned),
        others: mergeArrays(results.others)
      };
    } else {
      return {
        in_args: results.in_args[0],
        returned: results.returned[0],
        others: results.others[0]
      };
    }
  }
  function getFilterCrates() {
    return undefined;
  }
  function search(e, forced) {
    var query = getQuery(search_input.value.trim());
    if (e) {
      e.preventDefault();
    }
    if (query.query.length === 0) {
      return;
    }
    if (forced !== true && query.id === currentResults) {
      if (query.query.length > 0) {
        putBackSearch(search_input);
      }
      return;
    }
    var filterCrates = getFilterCrates();
    const result = showResults(execSearch(query, index, filterCrates), filterCrates);
    window.result = result;
  }
  function buildIndex(rawSearchIndex) {
    searchIndex = [];
    var searchWords = [];
    var i;
    for (var crate in rawSearchIndex) {
      if (!rawSearchIndex.hasOwnProperty(crate)) {
        continue;
      }
      searchWords.push(crate);
      searchIndex.push({
        crate: crate,
        ty: 1,
        name: crate,
        path: "",
        desc: rawSearchIndex[crate].doc,
        type: null
      });
      var items = rawSearchIndex[crate].i;
      var paths = rawSearchIndex[crate].p;
      var len = paths.length;
      for (i = 0; i < len; ++i) {
        paths[i] = {
          ty: paths[i][0],
          name: paths[i][1]
        };
      }
      len = items.length;
      var lastPath = "";
      for (i = 0; i < len; ++i) {
        var rawRow = items[i];
        var row = {
          crate: crate,
          ty: rawRow[0],
          name: rawRow[1],
          path: rawRow[2] || lastPath,
          desc: rawRow[3],
          parent: paths[rawRow[4]],
          type: rawRow[5]
        };
        searchIndex.push(row);
        if (typeof row.name === "string") {
          var word = row.name.toLowerCase();
          searchWords.push(word);
        } else {
          searchWords.push("");
        }
        lastPath = row.path;
      }
    }
    return searchWords;
  }
  function startSearch() {
    var searchTimeout;
    var callback = function() {
      clearTimeout(searchTimeout);
      if (search_input.value.length === 0) {
        if (browserSupportsHistoryApi()) {
          history.replaceState("", window.currentCrate + " - Rust", "?search=");
        }
        if (hasClass(main, "content")) {
          removeClass(main, "hidden");
        }
        var search_c = getSearchElement();
        if (hasClass(search_c, "content")) {
          addClass(search_c, "hidden");
        }
      } else {
        searchTimeout = setTimeout(search, 500);
      }
    };
    search_input.onkeyup = callback;
    search_input.oninput = callback;
    search_input.onchange = function(e) {
      clearTimeout(searchTimeout);
      setTimeout(search, 0);
    };
    search_input.onpaste = search_input.onchange;
    search();
  }
  index = buildIndex(rawSearchIndex);
  startSearch();
  if (rootPath === "../" || rootPath === "./") {
    var sidebar = document.getElementsByClassName("sidebar-elems")[0];
    if (sidebar) {
      var div = document.createElement("div");
      div.className = "block crate";
      div.innerHTML = "<h3>Crates</h3>";
      var ul = document.createElement("ul");
      div.appendChild(ul);
      var crates = [];
      for (var crate in rawSearchIndex) {
        if (!rawSearchIndex.hasOwnProperty(crate)) {
          continue;
        }
        crates.push(crate);
      }
      crates.sort();
      for (var i = 0; i < crates.length; ++i) {
        var klass = "crate";
        if (rootPath !== "./" && crates[i] === window.currentCrate) {
          klass += " current";
        }
        var link = document.createElement("a");
        link.href = rootPath + crates[i] + "/index.html";
        link.title = rawSearchIndex[crates[i]].doc;
        link.className = klass;
        link.textContent = crates[i];
        var li = document.createElement("li");
        li.appendChild(link);
        ul.appendChild(li);
      }
      sidebar.appendChild(div);
    }
  }
  return window.result;
}
window.initSearch = initSearch;
function initSidebarItems(items) {
  var sidebar = document.getElementsByClassName("sidebar-elems")[0];
  var current = window.sidebarCurrent;
  function block(shortty, longty) {
    var filtered = items[shortty];
    if (!filtered) {
      return;
    }
    var div = document.createElement("div");
    div.className = "block " + shortty;
    var h3 = document.createElement("h3");
    h3.textContent = longty;
    div.appendChild(h3);
    var ul = document.createElement("ul");
    var length = filtered.length;
    for (var i = 0; i < length; ++i) {
      var item = filtered[i];
      var name = item[0];
      var desc = item[1];
      var klass = shortty;
      if (name === current.name && shortty === current.ty) {
        klass += " current";
      }
      var path;
      if (shortty === "mod") {
        path = name + "/index.html";
      } else {
        path = shortty + "." + name + ".html";
      }
      var link = document.createElement("a");
      link.href = current.relpath + path;
      link.title = desc;
      link.className = klass;
      link.textContent = name;
      var li = document.createElement("li");
      li.appendChild(link);
      ul.appendChild(li);
    }
    div.appendChild(ul);
    if (sidebar) {
      sidebar.appendChild(div);
    }
  }
  block("primitive", "Primitive Types");
  block("mod", "Modules");
  block("macro", "Macros");
  block("struct", "Structs");
  block("enum", "Enums");
  block("union", "Unions");
  block("constant", "Constants");
  block("static", "Statics");
  block("trait", "Traits");
  block("fn", "Functions");
  block("type", "Type Definitions");
  block("foreigntype", "Foreign Types");
  block("keyword", "Keywords");
  block("traitalias", "Trait Aliases");
}
window.initSidebarItems = initSidebarItems;
window.register_implementors = function(imp) {
  var implementors = document.getElementById("implementors-list");
  var synthetic_implementors = document.getElementById(
    "synthetic-implementors-list"
  );
  var libs = Object.getOwnPropertyNames(imp);
  var llength = libs.length;
  for (var i = 0; i < llength; ++i) {
    if (libs[i] === currentCrate) {
      continue;
    }
    var structs = imp[libs[i]];
    var slength = structs.length;
    struct_loop: for (var j = 0; j < slength; ++j) {
      var struct = structs[j];
      var list = struct.synthetic ? synthetic_implementors : implementors;
      if (struct.synthetic) {
        var stlength = struct.types.length;
        for (var k = 0; k < stlength; k++) {
          if (window.inlined_types.has(struct.types[k])) {
            continue struct_loop;
          }
          window.inlined_types.add(struct.types[k]);
        }
      }
      var code = document.createElement("code");
      code.innerHTML = struct.text;
      var x = code.getElementsByTagName("a");
      var xlength = x.length;
      for (var it = 0; it < xlength; it++) {
        var href = x[it].getAttribute("href");
        if (href && href.indexOf("http") !== 0) {
          x[it].setAttribute("href", rootPath + href);
        }
      }
      var display = document.createElement("h3");
      addClass(display, "impl");
      display.innerHTML =
        '<span class="in-band"><table class="table-display">' +
        "<tbody><tr><td><code>" +
        code.outerHTML +
        "</code></td><td></td></tr>" +
        "</tbody></table></span>";
      list.appendChild(display);
    }
  }
};
if (window.pending_implementors) {
  window.register_implementors(window.pending_implementors);
}
function labelForToggleButton(sectionIsCollapsed) {
  if (sectionIsCollapsed) {
    return "+";
  }
  return "−";
}
function onEveryMatchingChild(elem, className, func) {
  if (elem && className && func) {
    var length = elem.childNodes.length;
    var nodes = elem.childNodes;
    for (var i = 0; i < length; ++i) {
      if (hasClass(nodes[i], className)) {
        func(nodes[i]);
      } else {
        onEveryMatchingChild(nodes[i], className, func);
      }
    }
  }
}
function toggleAllDocs(pageId, fromAutoCollapse) {
  var innerToggle = document.getElementById("toggle-all-docs");
  if (!innerToggle) {
    return;
  }
  if (hasClass(innerToggle, "will-expand")) {
    updateLocalStorage("rustdoc-collapse", "false");
    removeClass(innerToggle, "will-expand");
    onEveryMatchingChild(innerToggle, "inner", function(e) {
      e.innerHTML = labelForToggleButton(false);
    });
    innerToggle.title = "collapse all docs";
    if (fromAutoCollapse !== true) {
      onEachLazy(document.getElementsByClassName("collapse-toggle"), function(
        e
      ) {
        collapseDocs(e, "show");
      });
    }
  } else {
    updateLocalStorage("rustdoc-collapse", "true");
    addClass(innerToggle, "will-expand");
    onEveryMatchingChild(innerToggle, "inner", function(e) {
      var parent = e.parentNode;
      var superParent = null;
      if (parent) {
        superParent = parent.parentNode;
      }
      if (
        !parent ||
        !superParent ||
        superParent.id !== "main" ||
        hasClass(parent, "impl") === false
      ) {
        e.innerHTML = labelForToggleButton(true);
      }
    });
    innerToggle.title = "expand all docs";
    if (fromAutoCollapse !== true) {
      onEachLazy(document.getElementsByClassName("collapse-toggle"), function(
        e
      ) {
        var parent = e.parentNode;
        var superParent = null;
        if (parent) {
          superParent = parent.parentNode;
        }
        if (
          !parent ||
          !superParent ||
          superParent.id !== "main" ||
          hasClass(parent, "impl") === false
        ) {
          collapseDocs(e, "hide", pageId);
        }
      });
    }
  }
}
function collapseDocs(toggle, mode, pageId) {
  if (!toggle || !toggle.parentNode) {
    return;
  }
  function adjustToggle(arg) {
    return function(e) {
      if (hasClass(e, "toggle-label")) {
        if (arg) {
          e.style.display = "inline-block";
        } else {
          e.style.display = "none";
        }
      }
      if (hasClass(e, "inner")) {
        e.innerHTML = labelForToggleButton(arg);
      }
    };
  }
  function implHider(addOrRemove, fullHide) {
    return function(n) {
      var is_method = hasClass(n, "method") || fullHide;
      if (is_method || hasClass(n, "type")) {
        if (is_method === true) {
          if (addOrRemove) {
            addClass(n, "hidden-by-impl-hider");
          } else {
            removeClass(n, "hidden-by-impl-hider");
          }
        }
        var ns = n.nextElementSibling;
        while (true) {
          if (ns && (hasClass(ns, "docblock") || hasClass(ns, "stability"))) {
            if (addOrRemove) {
              addClass(ns, "hidden-by-impl-hider");
            } else {
              removeClass(ns, "hidden-by-impl-hider");
            }
            ns = ns.nextElementSibling;
            continue;
          }
          break;
        }
      }
    };
  }
  var relatedDoc;
  var action = mode;
  if (hasClass(toggle.parentNode, "impl") === false) {
    relatedDoc = toggle.parentNode.nextElementSibling;
    if (hasClass(relatedDoc, "stability")) {
      relatedDoc = relatedDoc.nextElementSibling;
    }
    if (
      hasClass(relatedDoc, "docblock") ||
      hasClass(relatedDoc, "sub-variant")
    ) {
      if (mode === "toggle") {
        if (hasClass(relatedDoc, "hidden-by-usual-hider")) {
          action = "show";
        } else {
          action = "hide";
        }
      }
      if (action === "hide") {
        addClass(relatedDoc, "hidden-by-usual-hider");
        onEachLazy(toggle.childNodes, adjustToggle(true));
        addClass(toggle.parentNode, "collapsed");
      } else if (action === "show") {
        removeClass(relatedDoc, "hidden-by-usual-hider");
        removeClass(toggle.parentNode, "collapsed");
        onEachLazy(toggle.childNodes, adjustToggle(false));
      }
    }
  } else {
    var parentElem = toggle.parentNode;
    relatedDoc = parentElem;
    var docblock = relatedDoc.nextElementSibling;
    while (hasClass(relatedDoc, "impl-items") === false) {
      relatedDoc = relatedDoc.nextElementSibling;
    }
    if (
      (!relatedDoc && hasClass(docblock, "docblock") === false) ||
      (pageId && document.getElementById(pageId))
    ) {
      return;
    }
    if (mode === "toggle") {
      if (
        hasClass(relatedDoc, "fns-now-collapsed") ||
        hasClass(docblock, "hidden-by-impl-hider")
      ) {
        action = "show";
      } else {
        action = "hide";
      }
    }
    var dontApplyBlockRule = toggle.parentNode.parentNode.id !== "main";
    if (action === "show") {
      removeClass(relatedDoc, "fns-now-collapsed");
      removeClass(docblock, "hidden-by-usual-hider");
      onEachLazy(toggle.childNodes, adjustToggle(false, dontApplyBlockRule));
      onEachLazy(relatedDoc.childNodes, implHider(false, dontApplyBlockRule));
    } else if (action === "hide") {
      addClass(relatedDoc, "fns-now-collapsed");
      addClass(docblock, "hidden-by-usual-hider");
      onEachLazy(toggle.childNodes, adjustToggle(true, dontApplyBlockRule));
      onEachLazy(relatedDoc.childNodes, implHider(true, dontApplyBlockRule));
    }
  }
}
function collapser(e, collapse) {
  var n = e.parentElement;
  if (n.id.match(/^impl(?:-\d+)?$/) === null) {
    if (collapse || hasClass(n, "impl")) {
      collapseDocs(e, "hide", pageId);
    }
  }
}
function autoCollapse(pageId, collapse) {
  if (collapse) {
    toggleAllDocs(pageId, true);
  } else if (getCurrentValue("rustdoc-trait-implementations") !== "false") {
    var impl_list = document.getElementById("implementations-list");
    if (impl_list !== null) {
      onEachLazy(impl_list.getElementsByClassName("collapse-toggle"), function(
        e
      ) {
        collapser(e, collapse);
      });
    }
    var blanket_list = document.getElementById("blanket-implementations-list");
    if (blanket_list !== null) {
      onEachLazy(
        blanket_list.getElementsByClassName("collapse-toggle"),
        function(e) {
          collapser(e, collapse);
        }
      );
    }
  }
}
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function createSimpleToggle(sectionIsCollapsed) {
  var toggle = document.createElement("a");
  toggle.href = "javascript:void(0)";
  toggle.className = "collapse-toggle";
  toggle.innerHTML =
    '[<span class="inner">' +
    labelForToggleButton(sectionIsCollapsed) +
    "</span>]";
  return toggle;
}

var funcImpl = function(e) {
  var next = e.nextElementSibling;
  if (next && hasClass(next, "docblock")) {
    next = next.nextElementSibling;
  }
  if (!next) {
    return;
  }
  if (next.getElementsByClassName("method").length > 0 && hasClass(e, "impl")) {
    insertAfter(toggle.cloneNode(true), e.childNodes[e.childNodes.length - 1]);
  }
};
var impl_call = function() {};
function printTab(nb) {
  if (nb === 0 || nb === 1 || nb === 2) {
    currentTab = nb;
  }
  var nb_copy = nb;
  onEachLazy(document.getElementById("titles").childNodes, function(elem) {
    if (nb_copy === 0) {
      addClass(elem, "selected");
    } else {
      removeClass(elem, "selected");
    }
    nb_copy -= 1;
  });
  onEachLazy(document.getElementById("results").childNodes, function(elem) {
    if (nb === 0) {
      elem.style.display = "";
    } else {
      elem.style.display = "none";
    }
    nb -= 1;
  });
}
function putBackSearch(search_input) {
  if (search_input.value !== "") {
    addClass(main, "hidden");
    removeClass(getSearchElement(), "hidden");
    if (browserSupportsHistoryApi()) {
      history.replaceState(
        search_input.value,
        "",
        "?search=" + encodeURIComponent(search_input.value)
      );
    }
  }
}

module.exports = { initSearch };
