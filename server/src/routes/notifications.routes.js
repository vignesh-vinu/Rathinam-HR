const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/', (req, res) => {
  const { organizationId } = req.query;
  const data = db.read();

  // Get active non-deleted application IDs
  const activeAppIds = new Set(
    (data.applications || []).filter(a => !a.isDeleted).map(a => a.applicationId)
  );

  let list = (data.notifications || []).filter(n => activeAppIds.has(n.applicationId));
  if (organizationId && organizationId !== 'ALL' && organizationId !== 'All Organizations') {
    list = list.filter(n => n.organizationId === organizationId);
  }

  const unreadCount = list.filter(n => !n.isRead).length;

  res.json({
    unreadCount,
    notifications: list
  });
});

router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const data = db.read();

  const notif = data.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    db.write(data);
  }

  res.json({ success: true });
});

router.post('/mark-all-read', (req, res) => {
  const data = db.read();
  data.notifications.forEach(n => { n.isRead = true; });
  db.write(data);
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router;
