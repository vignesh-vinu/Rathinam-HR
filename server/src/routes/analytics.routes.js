const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/dashboard', (req, res) => {
  const { organizationId } = req.query;
  const data = db.read();
  
  let apps = data.applications.filter(a => !a.isDeleted);
  if (organizationId && organizationId !== 'ALL' && organizationId !== 'All Organizations') {
    apps = apps.filter(a => a.organizationId === organizationId);
  }

  // Summary Metrics
  const totalApplications = apps.length;
  const newApplications = apps.filter(a => a.status === 'NEW').length;
  const underReview = apps.filter(a => a.status === 'UNDER REVIEW').length;
  const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
  const interviewScheduled = apps.filter(a => a.status === 'INTERVIEW SCHEDULED' || a.status === 'INTERVIEW COMPLETED').length;
  const selected = apps.filter(a => a.status === 'SELECTED').length;
  const rejected = apps.filter(a => a.status === 'REJECTED').length;
  const onHold = apps.filter(a => a.status === 'ON HOLD').length;

  // Organization Breakdown (always calculated across all active apps)
  const allActiveApps = data.applications.filter(a => !a.isDeleted);
  const organizationBreakdown = {
    RGU: allActiveApps.filter(a => a.organizationId === 'RGU').length,
    RTC: allActiveApps.filter(a => a.organizationId === 'RTC').length,
    RPHARM: allActiveApps.filter(a => a.organizationId === 'RPHARM').length
  };

  // Status Distribution Chart Data
  const statusDistribution = [
    { status: 'NEW', label: 'New', count: newApplications, color: '#3B82F6' },
    { status: 'UNDER REVIEW', label: 'Under Review', count: underReview, color: '#8B5CF6' },
    { status: 'SHORTLISTED', label: 'Shortlisted', count: shortlisted, color: '#10B981' },
    { status: 'INTERVIEW SCHEDULED', label: 'Interview Scheduled', count: interviewScheduled, color: '#F59E0B' },
    { status: 'SELECTED', label: 'Selected', count: selected, color: '#059669' },
    { status: 'ON HOLD', label: 'On Hold', count: onHold, color: '#6B7280' },
    { status: 'REJECTED', label: 'Rejected', count: rejected, color: '#EF4444' }
  ];

  // Applications by Experience Level
  const experienceLevels = {
    '0 - 2 Years': 0,
    '3 - 5 Years': 0,
    '6 - 10 Years': 0,
    '10+ Years': 0
  };

  apps.forEach(app => {
    const years = parseFloat(app.financialDetails?.totalExperienceYears || '0');
    if (years <= 2) experienceLevels['0 - 2 Years']++;
    else if (years <= 5) experienceLevels['3 - 5 Years']++;
    else if (years <= 10) experienceLevels['6 - 10 Years']++;
    else experienceLevels['10+ Years']++;
  });

  // Recent 5 Applications
  const recentApplications = [...apps]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  res.json({
    metrics: {
      totalApplications,
      newApplications,
      underReview,
      shortlisted,
      interviewScheduled,
      selected,
      rejected,
      onHold
    },
    organizationBreakdown,
    statusDistribution,
    experienceLevels,
    recentApplications
  });
});

module.exports = router;
