var express = require('express');
var router = express.Router();

const md = function (req, res, next) {
  if(req.session.user === null || typeof req.session.user === 'undefined'){
    return res.redirect('/login')
  }
  next()
}

/* GET home page. */
router.get('/', md, function(req, res, next) {
  res.render('index', { title: 'Private page', msg: 'this is private page!' });
});

router.get('/logout', function (req, res, next) {
  req.session.user = null
  res.redirect('/login')
})

module.exports = router;
