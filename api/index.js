const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('../server/src/routes/auth.routes');
const applicationsRoutes = require('../server/src/routes/applications.routes');
const analyticsRoutes = require('../server/src/routes/analytics.routes');
const notificationsRoutes = require('../server/src/routes/notifications.routes');
const auditRoutes = require('../server/src/routes/audit.routes');
const pdfMappingRoutes = require('../server/src/routes/pdf-mapping.routes');
const documentsRoutes = require('../server/src/routes/documents.routes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/pdf-mapping', pdfMappingRoutes);
app.use('/api/documents', documentsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Rathinam HR API Server (Vercel Serverless)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/supabase-status', async (req, res) => {
  const supabaseDb = require('../server/src/db/supabase');
  const isConfigured = supabaseDb.isConfigured();
  if (!isConfigured) {
    return res.json({
      configured: false,
      message: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_KEY in Vercel Environment Variables.'
    });
  }

  const result = await supabaseDb.testConnection();
  res.json({
    configured: true,
    supabaseUrl: process.env.SUPABASE_URL,
    connectionTest: result
  });
});

module.exports = app;
