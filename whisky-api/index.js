var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var router = express.Router();
const repository = require('./whisky-repository').inject();
const logger = require('./logger');

// Use it before all route definitionsf dsafdsfdsa f
app.use(cors({ origin: '*' }));

const port = process.env.PORT || 8000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));

router.route("/api/all")
    .get(function (req, res) {
        logger.info('Getting all ballparks');
        repository.find()
            .then(function (ballparks) {
                res.status(200);
                res.json(ballparks);
            })
            .catch(function (err) {
                logger.error(err);
                res.status(503);
                res.json({ status: 'error', error: err });
            });
    });
router.route("/api/ballpark/:id")
    .get(function (req, res) {
        logger.info('Getting ballpark: ' + req.params.id);
        if (req.params.id) {
            repository.find({ _id: req.params.id })
                .then(function (ballparks) {
                    if (ballparks.length === 1) {
                        res.status(200);
                        res.json(ballparks[0]);
                    } else if (ballparks.length > 1) {
                        res.status(200);
                        res.json(ballparks);
                    } else {
                        res.status(404);
                        res.json({ status: 'error', error: { name: 'ResultsError', message: 'No matching ballparks.' } });
                    }
                })
                .catch(function (err) {
                    logger.error(err);
                    if (err.name === 'ValidationError') {
                        res.status(400);
                    } else {
                        res.status(503);
                    }
                    res.json({ status: 'error', error: err });
                });
        } else {
            res.status(400);
            res.json({ status: 'error', error: { name: 'ValidationError', message: 'No id parameter.' } });
        }
    });

router.route("/api/list")
    .get(function (req, res) {
        logger.info('Getting all ballparks');
        repository.list()
            .then(function (ballparks) {
                res.status(200);
                res.json(ballparks);
            })
            .catch(function (err) {
                logger.error(err);
                res.status(503);
                res.json({ status: 'error', error: err });
            });
    });

router.route("/api")
    .post(function (req, res) {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
            res.status(400);
            res.json({ status: 'error', error: { name: 'ValidationError', message: 'No body provided.' } });
        } else {
            repository.save(req.body)
                .then(function (ballpark) {
                    res.status(201);
                    res.json(ballpark);
                })
                .catch(function (err) {
                    logger.error(err);
                    if (err.name === 'ValidationError') {
                        res.status(400);
                    } else {
                        res.status(503);
                    }
                    res.json({ status: 'error', error: err });
                });
        }
    });
    
router.route("/api")
    .put(function (req, res) {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
            res.status(400);
            res.json({ status: 'error', error: { name: 'ValidationError', message: 'No body provided.' } });
        } else {
            repository.save(req.body)
                .then(function (ballpark) {
                    res.status(200);
                    res.json(ballpark);
                })
                .catch(function (err) {
                    logger.error(err);
                    if (err.name === 'ValidationError') {
                        res.status(400);
                    } else {
                        res.status(503);
                    }
                    res.json({ status: 'error', error: err });
                });
        }
    });

app.use('/', router);

app.listen(port);
console.log('API listening on port ' + port);
logger.info('API listening on port ' + port);

module.exports = router;
