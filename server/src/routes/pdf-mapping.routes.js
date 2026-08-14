const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const data = db.read();
  res.json({
    docRef: 'RGI/3HR/3F6R3 001',
    rev: '02',
    dateOfIssue: '01-06-2025',
    title: 'Candidate Personal Data Sheet',
    pdfFieldMappings: data.pdfFieldMappings || []
  });
});

router.post('/add', (req, res) => {
  const { pdfField, webFormField, category, pdfRef } = req.body;
  if (!pdfField || !webFormField) {
    return res.status(400).json({ error: 'pdfField and webFormField are required' });
  }

  const data = db.read();
  const newMapping = {
    pdfField,
    webFormField,
    category: category || 'Custom',
    pdfRef: pdfRef || 'User Defined'
  };

  data.pdfFieldMappings.push(newMapping);
  db.write(data);

  res.status(201).json({ message: 'Field mapping added successfully', mapping: newMapping });
});

module.exports = router;
