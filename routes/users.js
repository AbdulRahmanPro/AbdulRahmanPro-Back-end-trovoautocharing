const express = require('express');
const router = express.Router();
const {addOrUpdateAction} = require("../services/userServices")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post("/Action",addOrUpdateAction)
module.exports = router;