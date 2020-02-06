var express = require("express");
var router = express.Router();
var mysql_dbc = require("../commons/db_conn")();
var connection = mysql_dbc.init();
var QUERY = require("../database/query");
var isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};
require("../commons/helpers");

router.get("/", isAuthenticated, function(req, res) {
  connection.query(
    QUERY.HISTORY.GetAssignEduHistory,
    [req.user.fc_id],
    function(err, rows) {
      if (err) {
        console.error(err);
        throw new Error(err);
      } else {
        res.render("assignment_history", {
          current_path: "Assignment_history",
          menu_group: "education",
          title: PROJ_TITLE + "Assignment History",
          loggedIn: req.user,
          list: rows
        });
      }
    }
  );
});

module.exports = router;
