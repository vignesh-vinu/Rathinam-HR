const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const data = db.read();
  res.json({
    auditLogs: data.auditLogs || []
  });
});

module.exports = router;
