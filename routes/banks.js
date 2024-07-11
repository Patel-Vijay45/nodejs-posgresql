const express = require('express');
const router = express.Router();
const banks = require("../services/banks");

/* get bank */
router.get("/", async function (req, res, nect) {
  try {
    res.json(await banks.getBanks(req.query.page));
  } catch (err) {
    console.error(`Error while getting banks `, err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});


/* POST banks */
router.post('/', async function(req, res, next) {
    try {
      res.json(await banks.create(req.body));
    } catch (err) {
      console.error(`Error while posting banks `, err.message);
      res.status(err.statusCode || 500).json({'message': err.message});
    }
  });
  
  module.exports = router;