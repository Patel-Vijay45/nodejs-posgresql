const express = require("express");
const router = express.Router();
const statements = require("../services/statements");

/* get statement */
router.get("/", async function (req, res, nect) {
  try {
    res.json(await statements.getstatements(req.query.page));
  } catch (err) {
    console.error(`Error while getting statements `, err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

/* POST statements */
router.post("/", async function (req, res, next) {
  try {
    res.json(await statements.create(req.body));
  } catch (err) {
    console.error(`Error while posting statements `, err.message);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

module.exports = router;
