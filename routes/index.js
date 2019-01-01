var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.send("This is 2FA Example, Please Flow Path : 1. /totp and 2. /hotp for example of 2fa ")
})

/** -------- TOTP ----------- */
const md_totp = function (req, res, next) {
  if(req.session.totp === null || typeof req.session.totp === 'undefined'){
    return res.redirect('/totp/login')
  }
  next()
}

/* GET home page for totp. */
router.get('/totp', md_totp, function(req, res, next) {
  res.render('index', { title: 'Private page TOTP', msg: 'this is private page! for TOTP', target: '/totp/logout' });
});

router.get('/totp/logout', function (req, res, next) {
  req.session.totp = null
  res.redirect('/totp/login')
})

/** -------- HOTP ----------- */
const md_hotp = function (req, res, next) {
  if(req.session.hotp === null || typeof req.session.hotp === 'undefined'){
    return res.redirect('/hotp/login')
  }
  next()
}

/* GET home page for hotp. */
router.get('/hotp', md_hotp, function(req, res, next) {
  res.render('index', { title: 'Private page HOTP', msg: 'this is private page! For HOTP', target: '/hotp/logout' });
});

router.get('/hotp/logout', function (req, res, next) {
  req.session.hotp = null
  res.redirect('/hotp/login')
})


module.exports = router;
