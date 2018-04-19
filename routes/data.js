var express = require('express');
var router = express.Router();

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://neo4j', neo4j.auth.basic('neo4j', 'neo'));
const session = driver.session();


router.get('/:dataset/delete', function (req, res, next) {
    let dataset = req.params.dataset
    Promise.all([
        session.run("match (n {dataset: '" + dataset + "'}) detach delete n"),
        session.run("match (n:Dataset {name: '" + dataset + "'}) detach delete n"),
    ])
        .then((results) => {
            session.close()
            res.send(results)
        })
        .catch((error) => session.close());
});

router.get('/:dataset/index', function (req, res, next) {
    let dataset = req.params.dataset
    Promise.all([
        session.run("MATCH (n:Class {dataset: '" + dataset + "'}) WHERE NOT n.name='root' return n.documents"),
        session.run("MATCH (n:Class {dataset: '" + dataset + "'}) WHERE NOT n.name='root' return n.features"),
        session.run("MATCH (n:Feature {dataset: '" + dataset + "'}) return n.documents"),
        session.run("MATCH (n:Feature {dataset: '" + dataset + "'}) return n.classes"),
    ])
        .then((results) => {
            session.close()
            res.send(results.map((r) => r.records.map((x) => x.get(0).low)))
        })
        .catch((error) => session.close());
});

router.get('/:dataset/classes/documents', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Class {dataset: "' + dataset + '"}) WHERE NOT n.name="root" return n.documents'
    );

    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => x.get(0).low)
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    });
});

router.get('/:dataset/classes/features', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Class {dataset: "' + dataset + '"}) WHERE NOT n.name="root" return n.features'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => x.get(0).low)
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    });
});

router.get('/:dataset/features/documents', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Feature {dataset: "' + dataset + '"}) return n.documents'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => x.get(0).low)
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

router.get('/:dataset/features/classes', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Feature {dataset: "' + dataset + '"}) return n.classes'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => x.get(0).low)
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

router.get('/:dataset/level/classes', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Level {dataset: "' + dataset + '"}) return n.level, n.classes'
    );
    resultPromise.then(result => {
        session.close();
        data = result.records.map((x) => {
            return {
                level: x.get(0).low,
                data: x.get(1).low
            }
        })
        res.send(data)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});


router.get('/:dataset/level/leaf', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Level {dataset: "' + dataset + '"}) return n.level, n.leaf'
    );
    resultPromise.then(result => {
        session.close();
        data = result.records.map((x) => {
            return {
                level: x.get(0).low,
                data: x.get(1).low
            }
        })
        res.send(data)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});


router.get('/:dataset/level/documents', function (req, res, next) {
    let dataset = req.params.dataset
    const resultPromise = session.run(
        'MATCH (n:Level {dataset: "' + dataset + '"}) return n.level, n.documents'
    );
    resultPromise.then(result => {
        session.close();
        data = result.records.map((x) => {
            return {
                level: x.get(0).low,
                data: x.get(1).low
            }
        })
        res.send(data)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

router.get('/:dataset/hierarchy/:name', (req, res, next) => {
    let dataset = req.params.dataset
    name = req.params.name
    Promise.all([
        session.run('MATCH (n2:Class {name:"' + name + '", dataset: "' + dataset + '"})-[r:`PARENT OF`]->(n:Class) return n2, r, n'),
        session.run('MATCH (n2:Class {name:"' + name + '", dataset: "' + dataset + '"})<-[r:`PARENT OF`]-(n:Class) return n2, r, n'),
    ]).then(result => {
        session.close();
        // res.send(result[1].records[0].get(0).properties)
        let focus_node;
        if (result[0].records.length != 0)
            focus_node = mapNodeData(result[0].records[0].get(0).properties)
        else
            focus_node = mapNodeData(result[1].records[0].get(0).properties)
        focus_node.focus = true
        let node = [focus_node]
        let edge = []
        for (let r of result[0].records) {
            n = mapNodeData(r.get(2).properties, true)
            n.child = true;
            e = {
                'destination': n.name,
                'data': n.datas / focus_node.datas
            }
            node.push(n)
            edge.push(e)
        }
        for (let r of result[1].records) {
            n = mapNodeData(r.get(2).properties, false)
            node.push(n)
            e = {
                'destination': n.name,
                'data': focus_node.datas / n.datas
            }
            edge.push(e)
        }
        res.send({
            'node': node,
            'edge': edge
        });
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

function mapNodeData(d, child) {
    return {
        'name': d.name,
        'datas': d.documents.low,
        'level': d.level.low,
        'child': child,
        'leaf': d.leaf
    }
}


router.get('/:dataset/export/classes/documents', function (req, res, next) {
    let dataset = req.params.dataset
    let min = req.query.min
    let max = req.query.max
    const revert = req.query.revert
    const condition = revert ? 'NOT' : ''
    const resultPromise = session.run(
        'MATCH (n:Class {dataset: "' + dataset + '"}) WHERE (NOT n.name="root") and ' + condition + ' (n.documents>=' + min + ' and n.documents<=' + max + ') return n.name, n.documents'
    );

    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => {
            return [x.get(0),
            x.get(1).low,
            ]
        })
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    });
});


router.get('/:dataset/export/classes/features', function (req, res, next) {
    let dataset = req.params.dataset
    let min = req.query.min
    let max = req.query.max
    const revert = req.query.revert
    const condition = revert ? 'NOT' : ''
    const resultPromise = session.run(
        'MATCH (n:Class {dataset: "' + dataset + '"}) WHERE (NOT n.name="root") and ' + condition + ' (n.features>=' + min + ' and n.features<=' + max + ') return n.name, n.features'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => {
            return [x.get(0),
            x.get(1).low,
            ]
        })
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    });
});

router.get('/:dataset/export/features/documents', function (req, res, next) {
    let dataset = req.params.dataset
    let min = req.query.min
    let max = req.query.max
    const revert = req.query.revert
    const condition = revert ? 'NOT' : ''
    const resultPromise = session.run(
        'MATCH (n:Feature {dataset: "' + dataset + '"}) WHERE ' + condition + ' (n.documents>=' + min + ' and n.documents<=' + max + ') return n.name, n.documents'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => {
            return [x.get(0),
            x.get(1).low
            ]
        })
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

router.get('/:dataset/export/features/classes', function (req, res, next) {
    let dataset = req.params.dataset
    const min = req.query.min
    const max = req.query.max
    const revert = req.query.revert
    const condition = revert ? 'NOT' : ''
    const resultPromise = session.run(
        'MATCH (n:Feature {dataset: "' + dataset + '"}) WHERE ' + condition + ' (n.classes>=' + min + ' and n.classes<=' + max + ') return n.name, n.classes'
    );
    resultPromise.then(result => {
        session.close();
        result_array = result.records.map((x) => {
            return [x.get(0),
            x.get(1).low
            ]
        })
        res.send(result_array)
        driver.close();
    }).catch(error => {
        console.log(error)
    })
});

module.exports = router;
