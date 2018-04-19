var express = require('express');
var router = express.Router();
function jsUcfirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://neo4j', neo4j.auth.basic('neo4j', 'neo'));
const session = driver.session();

router.get('/', function (req, res, next) {
  const resultPromise = session.run(
    'MATCH (n:Dataset) return n.name, n.status, n.percentage'
  );

  resultPromise.then(result => {
    session.close();
    data = result.records.map((x) => {
      percentage = 0
      status = x.get(1)
      if (status == "storing") {
        percentage = x.get(2).low
      }
      return {
        "name": x.get(0),
        "status": status,
        "percentage": percentage
      }
    })
    console.log(data)
    res.render('selectData', {
      title: "Home | HTC visualization",
      data
    })
    driver.close();
  }).catch(error => {
    console.log(error)
  });
});

/* GET home page. */
router.get('/:dataset/', function (req, res, next) {
  let dataset = req.params.dataset
  const resultPromise = session.run(
    'MATCH (n:Dataset {name: "' + dataset + '"}) return n.classes, n.document, n.features, n.levels'
  );

  resultPromise.then(result => {
    session.close();
    const singleRecord = result.records[0];
    const classes = singleRecord.get(0).low;
    const document = singleRecord.get(1).low;
    const features = singleRecord.get(2).low;
    const levels = singleRecord.get(3).low;

    // on application exit:
    res.render('index', {
      title: "Home | HTC visualization",
      classes,
      document,
      levels,
      features,
      dataset
    });
    driver.close();
  }).catch(error => {
    console.log(error)
  });

});

/* GET home page. */
router.get('/:dataset/features', function (req, res, next) {
  let dataset = req.params.dataset
  let xaxis = "documents"
  let yaxis = "features"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "classes",
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/classes', function (req, res, next) {
  let dataset = req.params.dataset
  let xaxis = "documents"
  let yaxis = "classes"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "features",
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/classes/features', function (req, res, next) {
  let dataset = req.params.dataset
  let xaxis = "features"
  let yaxis = "classes"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "",
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/features/classes', function (req, res, next) {
  let dataset = req.params.dataset
  let xaxis = "classes"
  let yaxis = "features"
  res.render('feature', {
    title: jsUcfirst(xaxis) + " x " + jsUcfirst(yaxis),
    xaxis: xaxis,
    yaxis: yaxis,
    filter: "",
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/hierarchy', function (req, res, next) {
  let dataset = req.params.dataset
  res.render('hierarchy', {
    title: "Hierarchy | HTC visualization",
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/level/documents', function (req, res, next) {
  let dataset = req.params.dataset
  res.render('level', {
    title: "Level | HTC visualization",
    data: 'documents',
    dataset
  });
});

router.get('/:dataset/level', function (req, res, next) {
  let dataset = req.params.dataset
  res.redirect('/' + dataset + '/level/classes')
});

/* GET home page. */
router.get('/:dataset/level/leaf', function (req, res, next) {
  let dataset = req.params.dataset
  res.render('level', {
    title: "Level | HTC visualization",
    data: 'leaf',
    dataset
  });
});

/* GET home page. */
router.get('/:dataset/level/classes', function (req, res, next) {
  let dataset = req.params.dataset
  res.render('level', {
    title: "Level | HTC visualization",
    data: 'classes',
    dataset
  });
});

module.exports = router;
