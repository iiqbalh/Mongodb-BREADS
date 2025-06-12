var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user');
});

router.get('/users/:id/todos', function(req, res, next) {
  const id = req.params.id;
  res.render('todos', {executor: id});
});

module.exports = router;
