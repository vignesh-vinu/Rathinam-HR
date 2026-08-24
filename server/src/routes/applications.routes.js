const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');

// Helper to check duplicates
const findDuplicate = (applications, email, mobile, positionApplied, organizationId) => {
  if (!email && !mobile) return null;
  return applications.find(app => !app.isDeleted && 
    app.organizationId === organizationId &&
    (positionApplied && app.positionApplied?.toLowerCase() === positionApplied?.toLowerCase()) && (
      (email && app.contactDetails?.email?.toLowerCase() === email.toLowerCase()) ||
      (mobile && app.contactDetails?.mobile === mobile)
    )
  );
};

// 1. PUBLIC: Submit New Application
router.post('/submit', async (req, res) => {
  const applicationData = req.body;
  const data = db.read();

  const email = applicationData.contactDetails?.email;
  const mobile = applicationData.contactDetails?.mobile;
  const positionApplied = applicationData.positionApplied;
  const organizationId = applicationData.organizationId || 'RGU';

  // Duplicate Check
  const duplicate = findDuplicate(data.applications, email, mobile, positionApplied, organizationId);
  if (duplicate) {
    return res.status(409).json({
      error: 'Duplicate application detected',
      message: `An application (${duplicate.applicationId}) for ${positionApplied} at ${organizationId} has already been submitted with email "${email}" or mobile "${mobile}".`,
      existingId: duplicate.applicationId
    });
  }

  // Generate Unique Application ID
  const applicationId = db.getNextApplicationId();
  const now = new Date();
  const submissionDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // e.g. 12 Aug 2026
  const submissionTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); // e.g. 04:30 AM

  const newApp = {
    id: `app-${uuidv4().slice(0, 8)}`,
    applicationId,
    organizationId: applicationData.organizationId || 'RGU',
    positionApplied: applicationData.positionApplied || 'General Application',
    source: applicationData.source || 'Career Portal',
    status: 'NEW',
    personalDetails: applicationData.personalDetails || {},
    contactDetails: applicationData.contactDetails || {},
    financialDetails: applicationData.financialDetails || {},
    educationDetails: applicationData.educationDetails || [],
    experienceDetails: applicationData.experienceDetails || [],
    certifications: applicationData.certifications || '',
    languagesKnown: applicationData.languagesKnown || [],
    familyDetails: applicationData.familyDetails || [],
    additionalInfo: applicationData.additionalInfo || {},
    references: applicationData.references || [],
    referredFriends: applicationData.referredFriends || [],
    documents: applicationData.documents || [],
    declarationAccepted: applicationData.declarationAccepted || false,
    declarationDate: submissionDate,
    declarationPlace: applicationData.declarationPlace || 'Coimbatore',
    submissionDate,
    submissionTime,
    submittedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isDeleted: false
  };

  data.applications.unshift(newApp);

  // Record initial Status History
  data.statusHistory.unshift({
    id: `his-${uuidv4().slice(0, 8)}`,
    applicationId,
    fromStatus: 'NONE',
    toStatus: 'NEW',
    updatedBy: 'Applicant Submission',
    remarks: `Application submitted by candidate on ${submissionDate} at ${submissionTime}.`,
    timestamp: now.toISOString()
  });

  // Create HR Notification
  const applicantName = `${newApp.personalDetails.firstName || ''} ${newApp.personalDetails.lastName || ''}`.trim() || 'New Applicant';
  const orgCode = newApp.organizationId;
  data.notifications.unshift({
    id: `notif-${uuidv4().slice(0, 8)}`,
    applicationId,
    applicantName,
    organizationId: orgCode,
    title: 'New Application Received',
    message: `${applicantName} applied for ${newApp.positionApplied} (${orgCode}) on ${submissionDate} at ${submissionTime}`,
    status: 'New Application',
    isRead: false,
    timestamp: now.toISOString()
  });

  // Create Audit Log
  data.auditLogs.unshift({
    id: `audit-${uuidv4().slice(0, 8)}`,
    user: applicantName,
    action: 'APPLICATION_SUBMITTED',
    details: `Created application ${applicationId} for ${orgCode} on ${submissionDate} at ${submissionTime}`,
    timestamp: now.toISOString()
  });

  db.write(data);

  // Sync to Supabase PostgreSQL Database if configured
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    try {
      await supabaseDb.insertApplication(newApp);
    } catch (err) {
      console.error('Supabase async sync error:', err.message);
    }
  }

  res.status(201).json({
    message: 'Application submitted successfully',
    applicationId,
    application: newApp
  });
});

// 2. PUBLIC: Track Application by ID / Mobile / Email
router.post('/track', async (req, res) => {
  const { applicationId, identifier } = req.body;
  const searchTerm = (applicationId || identifier || '').trim().toLowerCase();

  if (!searchTerm) {
    return res.status(400).json({ error: 'Please enter your Application ID, Mobile number, or Email address.' });
  }

  const supabaseDb = require('../db/supabase');
  let app = null;
  let history = [];

  if (supabaseDb.isConfigured()) {
    const spData = await supabaseDb.getApplicationById(searchTerm);
    if (spData && spData.application) {
      app = spData.application;
      history = spData.statusHistory || [];
    }
  }

  if (!app) {
    const data = db.read();
    app = data.applications.find(a => 
      !a.isDeleted && (
        a.applicationId.toLowerCase() === searchTerm ||
        a.id.toLowerCase() === searchTerm ||
        (a.contactDetails?.email && a.contactDetails.email.toLowerCase() === searchTerm) ||
        (a.contactDetails?.mobile && a.contactDetails.mobile === searchTerm) ||
        (a.contactDetails?.phone && a.contactDetails.phone === searchTerm)
      )
    );
    if (app) {
      history = data.statusHistory.filter(h => h.applicationId === app.applicationId);
    }
  }

  if (!app) {
    return res.status(404).json({ error: `No application found matching "${searchTerm}". Please check your Application ID, registered email, or mobile number.` });
  }

  // Validate optional second identifier if provided
  if (identifier && applicationId && identifier.trim().toLowerCase() !== applicationId.trim().toLowerCase()) {
    const cleanId = identifier.trim().toLowerCase();
    const emailMatch = app.contactDetails?.email?.toLowerCase() === cleanId;
    const mobileMatch = app.contactDetails?.mobile === cleanId || app.contactDetails?.phone === cleanId;

    if (!emailMatch && !mobileMatch) {
      return res.status(401).json({ error: 'Mobile number or Email ID does not match our records for this Application ID.' });
    }
  }

  res.json({
    applicationId: app.applicationId,
    applicantName: `${app.personalDetails?.firstName || ''} ${app.personalDetails?.lastName || ''}`.trim(),
    organizationId: app.organizationId,
    positionApplied: app.positionApplied,
    status: app.status,
    submissionDate: app.submissionDate || new Date(app.submittedAt).toLocaleDateString(),
    submissionTime: app.submissionTime || new Date(app.submittedAt).toLocaleTimeString(),
    submittedAt: app.submittedAt,
    history
  });
});

// 3. HR ADMIN: List Applications with Search, Filter, Organization Scope, Date Filter, Pagination
router.get('/', async (req, res) => {
  const {
    organizationId,
    status,
    search,
    qualification,
    dateFilter,
    page = 1,
    limit = 20,
    sortBy = 'submittedAt',
    sortOrder = 'desc'
  } = req.query;

  let list = null;
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    list = await supabaseDb.getApplications({ organizationId, status });
  }

  if (!list) {
    const data = db.read();
    list = data.applications.filter(a => !a.isDeleted);
  }

  // Organization Scoping Filter
  if (organizationId && organizationId !== 'ALL' && organizationId !== 'All Organizations') {
    list = list.filter(a => a.organizationId === organizationId);
  }

  // Status Filter
  if (status && status !== 'ALL') {
    list = list.filter(a => a.status === status);
  }

  // Date Filter (TODAY, LAST_7_DAYS, THIS_MONTH)
  if (dateFilter && dateFilter !== 'ALL') {
    const now = new Date();
    list = list.filter(a => {
      const appDate = new Date(a.submittedAt);
      if (dateFilter === 'TODAY') {
        return appDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'LAST_7_DAYS') {
        const diffDays = (now.getTime() - appDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      } else if (dateFilter === 'THIS_MONTH') {
        return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }

  // Search Query
  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(a => {
      const name = `${a.personalDetails?.firstName || ''} ${a.personalDetails?.lastName || ''}`.toLowerCase();
      const email = (a.contactDetails?.email || '').toLowerCase();
      const mobile = a.contactDetails?.mobile || '';
      const appCode = (a.applicationId || '').toLowerCase();
      const pos = (a.positionApplied || '').toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q) || appCode.includes(q) || pos.includes(q);
    });
  }

  // Qualification Filter
  if (qualification && qualification !== 'ALL') {
    list = list.filter(a => 
      a.educationDetails?.some(e => e.degree?.toLowerCase().includes(qualification.toLowerCase()))
    );
  }

  // Sort
  list.sort((a, b) => {
    let valA = a[sortBy] || a.personalDetails?.[sortBy] || '';
    let valB = b[sortBy] || b.personalDetails?.[sortBy] || '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const total = list.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedList = list.slice(startIndex, startIndex + limitNum);

  res.json({
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    applications: paginatedList
  });
});

// 4. HR ADMIN: Get Application Details by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    const spData = await supabaseDb.getApplicationById(id);
    if (spData && spData.application) {
      return res.json(spData);
    }
  }

  const data = db.read();
  const app = data.applications.find(a => 
    !a.isDeleted && (a.id === id || a.applicationId === id)
  );

  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const history = data.statusHistory.filter(h => h.applicationId === app.applicationId);
  const notes = data.hrNotes.filter(n => n.applicationId === app.applicationId);

  res.json({
    application: app,
    statusHistory: history,
    hrNotes: notes
  });
});

// 5. HR ADMIN: Update Application (Edit details)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatePayload = req.body;
  const data = db.read();

  const index = data.applications.findIndex(a => !a.isDeleted && (a.id === id || a.applicationId === id));
  const existing = index !== -1 ? data.applications[index] : null;

  let updatedApp = {
    ...(existing || {}),
    ...updatePayload,
    id: existing ? existing.id : id,
    updatedAt: new Date().toISOString()
  };

  if (index !== -1) {
    data.applications[index] = updatedApp;
  } else {
    data.applications.unshift(updatedApp);
  }

  // Add audit log
  data.auditLogs.unshift({
    id: `audit-${uuidv4().slice(0, 8)}`,
    user: updatePayload.updatedBy || 'HR Admin',
    action: 'APPLICATION_UPDATED',
    details: `Updated candidate details for ${updatedApp.applicationId || id}`,
    timestamp: new Date().toISOString()
  });

  db.write(data);

  // Sync update to Supabase PostgreSQL Database if configured
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    try {
      const spResult = await supabaseDb.updateApplication(id, updatedApp);
      if (spResult) updatedApp = spResult;
    } catch (err) {
      console.error('Supabase update sync error:', err.message);
    }
  }

  res.json({ message: 'Application updated successfully', application: updatedApp });
});

// 6. HR ADMIN: Change Application Status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, remarks, updatedBy = 'HR Admin' } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'New status is required' });
  }

  const data = db.read();
  const app = data.applications.find(a => !a.isDeleted && (a.id === id || a.applicationId === id));

  if (app) {
    const prevStatus = app.status;
    app.status = status;
    app.updatedAt = new Date().toISOString();

    // Record History
    data.statusHistory.unshift({
      id: `his-${uuidv4().slice(0, 8)}`,
      applicationId: app.applicationId,
      fromStatus: prevStatus,
      toStatus: status,
      updatedBy,
      remarks: remarks || `Status changed from ${prevStatus} to ${status}`,
      timestamp: new Date().toISOString()
    });

    // Notification
    const applicantName = `${app.personalDetails?.firstName || ''} ${app.personalDetails?.lastName || ''}`.trim();
    data.notifications.unshift({
      id: `notif-${uuidv4().slice(0, 8)}`,
      applicationId: app.applicationId,
      applicantName,
      organizationId: app.organizationId,
      title: `Status Changed: ${status}`,
      message: `${applicantName} status changed to ${status} by ${updatedBy}`,
      status,
      isRead: false,
      timestamp: new Date().toISOString()
    });

    // Audit Log
    data.auditLogs.unshift({
      id: `audit-${uuidv4().slice(0, 8)}`,
      user: updatedBy,
      action: 'STATUS_CHANGE',
      details: `Changed ${app.applicationId} from ${prevStatus} to ${status}`,
      timestamp: new Date().toISOString()
    });

    db.write(data);
  }

  // Supabase update
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    try {
      await supabaseDb.updateStatus(id, status, remarks, updatedBy);
    } catch (err) {
      console.error('Supabase status sync error:', err.message);
    }
  }

  res.json({ message: 'Status updated successfully', status });
});

// 7. HR ADMIN: Add Internal HR Note
router.post('/:id/notes', async (req, res) => {
  const { id } = req.params;
  const { content, author = 'HR Admin' } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Note content is required' });
  }

  const data = db.read();
  const app = data.applications.find(a => !a.isDeleted && (a.id === id || a.applicationId === id));

  const newNote = {
    id: `note-${uuidv4().slice(0, 8)}`,
    applicationId: app ? app.applicationId : id,
    author,
    content,
    createdAt: new Date().toISOString()
  };

  data.hrNotes.unshift(newNote);
  db.write(data);

  // Supabase update
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    try {
      await supabaseDb.addHRNote(id, content, author);
    } catch (err) {
      console.error('Supabase note sync error:', err.message);
    }
  }

  res.status(201).json({ message: 'Note added successfully', note: newNote });
});

// 8. HR ADMIN: Soft Delete Application
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { deletedBy = 'HR Admin' } = req.body || {};

  const data = db.read();
  const app = data.applications.find(a => (a.id === id || a.applicationId === id));

  if (app) {
    app.isDeleted = true;
    app.updatedAt = new Date().toISOString();

    data.auditLogs.unshift({
      id: `audit-${uuidv4().slice(0, 8)}`,
      user: deletedBy,
      action: 'APPLICATION_DELETED',
      details: `Deleted application ${app.applicationId}`,
      timestamp: new Date().toISOString()
    });

    db.write(data);
  }

  // Supabase update
  const supabaseDb = require('../db/supabase');
  if (supabaseDb.isConfigured()) {
    try {
      await supabaseDb.deleteApplication(id);
    } catch (err) {
      console.error('Supabase delete sync error:', err.message);
    }
  }

  res.json({ message: `Application record has been deleted.` });
});

// 9. HR ADMIN: Bulk Operations (Bulk Status Change / Bulk Delete)
router.post('/bulk', async (req, res) => {
  const { action, ids, status, remarks, updatedBy = 'HR Admin' } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No application IDs specified' });
  }

  const data = db.read();
  let affectedCount = 0;

  const supabaseDb = require('../db/supabase');
  const isSp = supabaseDb.isConfigured();

  for (const itemCode of ids) {
    const app = data.applications.find(a => a.id === itemCode || a.applicationId === itemCode);
    if (app) {
      if (action === 'STATUS_CHANGE' && status) {
        const prev = app.status;
        app.status = status;
        app.updatedAt = new Date().toISOString();
        data.statusHistory.unshift({
          id: `his-${uuidv4().slice(0, 8)}`,
          applicationId: app.applicationId,
          fromStatus: prev,
          toStatus: status,
          updatedBy,
          remarks: remarks || `Bulk status update to ${status}`,
          timestamp: new Date().toISOString()
        });
        affectedCount++;

        if (isSp) {
          await supabaseDb.updateStatus(itemCode, status, remarks, updatedBy).catch(() => {});
        }
      } else if (action === 'DELETE') {
        app.isDeleted = true;
        app.updatedAt = new Date().toISOString();
        affectedCount++;

        if (isSp) {
          await supabaseDb.deleteApplication(itemCode).catch(() => {});
        }
      }
    }
  }

  data.auditLogs.unshift({
    id: `audit-${uuidv4().slice(0, 8)}`,
    user: updatedBy,
    action: `BULK_${action}`,
    details: `Applied ${action} to ${affectedCount} applications`,
    timestamp: new Date().toISOString()
  });

  db.write(data);
  res.json({ message: `Successfully updated ${affectedCount} applications.` });
});

module.exports = router;
