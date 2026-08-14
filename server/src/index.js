const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const applicationsRoutes = require('./routes/applications.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const auditRoutes = require('./routes/audit.routes');
const pdfMappingRoutes = require('./routes/pdf-mapping.routes');
const documentsRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/pdf-mapping', pdfMappingRoutes);
app.use('/api/documents', documentsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Rathinam HR API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Supabase Connection Status Endpoint
app.get('/api/supabase-status', async (req, res) => {
  const supabaseDb = require('./db/supabase');
  const isConfigured = supabaseDb.isConfigured();
  if (!isConfigured) {
    return res.json({
      configured: false,
      message: 'Supabase credentials not configured in server/.env. Using local JSON database.',
      envPath: 'server/.env',
      sqlSchemaPath: 'server/src/db/supabase_schema.sql'
    });
  }

  const result = await supabaseDb.testConnection();
  res.json({
    configured: true,
    supabaseUrl: process.env.SUPABASE_URL,
    connectionTest: result
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Rathinam HR API Server running at http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
