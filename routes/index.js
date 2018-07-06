'use strict';
var express = require('express');
var router = express.Router();
var processRequest = require('../logic/processRequest');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.post('/search', async(req, res) => {
  let data = await processRequest();
  res.json(data);
});

router.get('/data', function(req, res) {
  res.json(require('diskdb')
  	        .connect('db', ['sentiments'])
  	        .sentiments.find());
});

router.get('/dataTotalSentiments', function(req, res) {
  res.json(require('diskdb')
  	        .connect('db', ['totalSentiments'])
  	        .totalSentiments.find());
});

module.exports = router;
