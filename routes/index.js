var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user');
});

router.get('/:id/todos', function(req, res, next) {
  const params = req.query
  console.log(params)
  res.render('user');
});

module.exports = router;
