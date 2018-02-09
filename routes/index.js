var express = require('express');
var router = express.Router();

function jsUcfirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: "Home | HTC visualization",
  });
});

/* GET home page. */
router.get('/features', function (req, res, next) {
  let xaxis = "documents"
  let yaxis = "features"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "classes"
  });
});

/* GET home page. */
router.get('/classes', function (req, res, next) {
  let xaxis = "documents"
  let yaxis = "classes"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "features"
  });
});

/* GET home page. */
router.get('/classes/features', function (req, res, next) {
  let xaxis = "features"
  let yaxis = "classes"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: ""
  });
});

/* GET home page. */
router.get('/features/classes', function (req, res, next) {
  let xaxis = "classes"
  let yaxis = "features"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: ""
  });
});

/* GET home page. */
router.get('/hierarchy', function (req, res, next) {
  res.render('hierarchy', {
    title: "Hierarchy | HTC visualization",
  });
});

/* GET home page. */
router.get('/level', function (req, res, next) {
  res.render('level', {
    title: "Level | HTC visualization",
  });
});

module.exports = router;
