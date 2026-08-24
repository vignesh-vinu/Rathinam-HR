const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();


const supabaseUrl = process.env.SUPABASE_URL || 'https://yduefvjjwykfxeettrbl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdWVmdmpqd3lrZnhlZXR0cmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NTI5MTEsImV4cCI6MjEwMjIyODkxMX0.uJO2uPzhAlzt7PbkYZ_P8Tx7D4sD60twllmfUQpuM6U';


let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('⚡ Supabase Client initialized successfully for URL:', supabaseUrl);
  } catch (e) {
    console.error('❌ Supabase initialization failed:', e.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in server/.env. System will use fast local JSON database engine.');
}

const isConfigured = () => {
  return supabase !== null;
};

// Helper: Convert DB format <-> Application format
const mapAppFromSupabase = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    applicationId: row.application_id,
    organizationId: row.organization_id,
    positionApplied: row.position_applied,
    source: row.source,
    status: row.status,
    personalDetails: row.personal_details || {},
    contactDetails: row.contact_details || {},
    financialDetails: row.financial_details || {},
    educationDetails: row.education_details || [],
    experienceDetails: row.experience_details || [],
    certifications: row.certifications || '',
    languagesKnown: row.languages_known || [],
    familyDetails: row.family_details || [],
    additionalInfo: row.additional_info || {},
    references: row.references || [],
    referredFriends: row.referred_friends || [],
    documents: row.documents || [],
    declarationAccepted: row.declaration_accepted,
    declarationDate: row.declaration_date,
    declarationPlace: row.declaration_place,
    submissionDate: row.submission_date,
    submissionTime: row.submission_time,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted || false
  };
};

const mapAppToSupabase = (app) => {
  return {
    id: app.id,
    application_id: app.applicationId,
    organization_id: app.organizationId,
    position_applied: app.positionApplied,
    source: app.source || 'Career Portal',
    status: app.status || 'NEW',
    personal_details: app.personalDetails || {},
    contact_details: app.contactDetails || {},
    financial_details: app.financialDetails || {},
    education_details: app.educationDetails || [],
    experience_details: app.experienceDetails || [],
    certifications: app.certifications || '',
    languages_known: app.languagesKnown || [],
    family_details: app.familyDetails || [],
    additional_info: app.additionalInfo || {},
    references: app.references || [],
    referred_friends: app.referredFriends || [],
    documents: app.documents || [],
    declaration_accepted: app.declarationAccepted || false,
    declaration_date: app.declarationDate,
    declaration_place: app.declarationPlace || 'Coimbatore',
    submission_date: app.submissionDate,
    submission_time: app.submissionTime,
    submitted_at: app.submittedAt || new Date().toISOString(),
    updated_at: app.updatedAt || new Date().toISOString(),
    is_deleted: app.isDeleted || false
  };
};

const { v4: uuidv4 } = require('uuid');

// Supabase DB API operations
const supabaseDb = {
  isConfigured,
  client: supabase,

  // Health check connection test
  testConnection: async () => {
    if (!supabase) return { success: false, message: 'Supabase client not initialized.' };
    try {
      const { data, error } = await supabase.from('applications').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { success: true, message: 'Supabase connection verified!', count: data };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Fetch Applications
  getApplications: async (options = {}) => {
    if (!supabase) return null;
    try {
      let query = supabase.from('applications').select('*').eq('is_deleted', false);

      if (options.organizationId && options.organizationId !== 'ALL' && options.organizationId !== 'All Organizations') {
        query = query.eq('organization_id', options.organizationId);
      }
      if (options.status && options.status !== 'ALL') {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query.order('submitted_at', { ascending: false });
      if (error) throw error;

      return (data || []).map(mapAppFromSupabase);
    } catch (e) {
      console.error('Error in Supabase getApplications:', e.message);
      return null;
    }
  },

  // Get Single Application by ID, Mobile, or Email
  getApplicationById: async (id) => {
    if (!supabase || !id) return null;
    try {
      const cleanTerm = id.toString().toLowerCase().trim();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('is_deleted', false);

      if (error || !data || data.length === 0) return null;

      const matched = data.find(row => {
        const appId = (row.application_id || '').toLowerCase();
        const rowId = (row.id || '').toLowerCase();
        const email = (row.contact_details?.email || '').toLowerCase();
        const mobile = (row.contact_details?.mobile || '').toString();
        const phone = (row.contact_details?.phone || '').toString();
        return appId === cleanTerm || rowId === cleanTerm || email === cleanTerm || mobile === cleanTerm || phone === cleanTerm;
      });

      if (!matched) return null;
      const app = mapAppFromSupabase(matched);

      // Fetch status history
      let statusHistory = [];
      try {
        const { data: histData } = await supabase
          .from('status_history')
          .select('*')
          .eq('application_id', app.applicationId)
          .order('timestamp', { ascending: false });
        if (histData) {
          statusHistory = histData.map(h => ({
            id: h.id,
            applicationId: h.application_id,
            fromStatus: h.from_status,
            toStatus: h.to_status,
            updatedBy: h.updated_by,
            remarks: h.remarks,
            timestamp: h.timestamp
          }));
        }
      } catch (e) {
        console.error('Error fetching status history from Supabase:', e.message);
      }

      // Fetch hr notes
      let hrNotes = [];
      try {
        const { data: notesData } = await supabase
          .from('hr_notes')
          .select('*')
          .eq('application_id', app.applicationId)
          .order('created_at', { ascending: false });
        if (notesData) {
          hrNotes = notesData.map(n => ({
            id: n.id,
            applicationId: n.application_id,
            author: n.author,
            content: n.content,
            createdAt: n.created_at
          }));
        }
      } catch (e) {
        console.error('Error fetching hr notes from Supabase:', e.message);
      }

      return {
        application: app,
        statusHistory,
        hrNotes
      };
    } catch (e) {
      console.error('Error in Supabase getApplicationById:', e.message);
      return null;
    }
  },

  // Insert Application
  insertApplication: async (app) => {
    if (!supabase) return null;
    try {
      const dbRow = mapAppToSupabase(app);
      const { data, error } = await supabase.from('applications').upsert([dbRow], { onConflict: 'id' }).select();
      if (error) throw error;

      // Insert initial status history in Supabase
      try {
        const historyId = `his-${uuidv4().slice(0, 8)}`;
        await supabase.from('status_history').insert([{
          id: historyId,
          application_id: app.applicationId,
          from_status: 'NONE',
          to_status: app.status || 'NEW',
          updated_by: 'Applicant Submission',
          remarks: `Application submitted by candidate on ${app.submissionDate || new Date().toLocaleDateString()}`,
          timestamp: app.submittedAt || new Date().toISOString()
        }]);
      } catch (histErr) {
        console.error('Supabase initial status history insert notice:', histErr.message);
      }

      return mapAppFromSupabase(data[0]);
    } catch (e) {
      console.error('Error inserting into Supabase:', e.message);
      return null;
    }
  },

  // Update Application
  updateApplication: async (id, updatePayload) => {
    if (!supabase) return null;
    try {
      const dbRow = mapAppToSupabase(updatePayload);
      dbRow.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('applications')
        .update(dbRow)
        .or(`id.eq.${id},application_id.eq.${id}`)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        const { data: upsertData, error: upsertErr } = await supabase
          .from('applications')
          .upsert([dbRow], { onConflict: 'id' })
          .select();
        if (!upsertErr && upsertData && upsertData.length > 0) {
          return mapAppFromSupabase(upsertData[0]);
        }
        return null;
      }
      return mapAppFromSupabase(data[0]);
    } catch (e) {
      console.error('Error updating in Supabase:', e.message);
      return null;
    }
  },

  // Update Application Status
  updateStatus: async (id, status, remarks, updatedBy = 'HR Admin') => {
    if (!supabase) return null;
    try {
      const now = new Date().toISOString();
      const appRes = await supabase
        .from('applications')
        .select('*')
        .or(`id.eq.${id},application_id.eq.${id}`);

      if (!appRes.data || appRes.data.length === 0) return null;
      const app = appRes.data[0];
      const prevStatus = app.status;

      const { data, error } = await supabase
        .from('applications')
        .update({ status, updated_at: now })
        .or(`id.eq.${id},application_id.eq.${id}`)
        .select();

      if (error) throw error;

      // Insert status history
      const historyId = `his-${uuidv4().slice(0, 8)}`;
      await supabase.from('status_history').insert([{
        id: historyId,
        application_id: app.application_id,
        from_status: prevStatus,
        to_status: status,
        updated_by: updatedBy,
        remarks: remarks || `Status changed from ${prevStatus} to ${status}`,
        timestamp: now
      }]);

      return data ? mapAppFromSupabase(data[0]) : null;
    } catch (e) {
      console.error('Error updating status in Supabase:', e.message);
      return null;
    }
  },

  // Add Internal HR Note
  addHRNote: async (id, content, author = 'HR Admin') => {
    if (!supabase) return null;
    try {
      const now = new Date().toISOString();
      const appRes = await supabase
        .from('applications')
        .select('application_id')
        .or(`id.eq.${id},application_id.eq.${id}`);

      if (!appRes.data || appRes.data.length === 0) return null;
      const appId = appRes.data[0].application_id;

      const noteId = `note-${uuidv4().slice(0, 8)}`;
      const { data, error } = await supabase
        .from('hr_notes')
        .insert([{
          id: noteId,
          application_id: appId,
          author,
          content,
          created_at: now
        }])
        .select();

      if (error) throw error;
      return data ? data[0] : null;
    } catch (e) {
      console.error('Error adding note in Supabase:', e.message);
      return null;
    }
  },

  // Soft Delete Application
  deleteApplication: async (id) => {
    if (!supabase) return null;
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('applications')
        .update({ is_deleted: true, updated_at: now })
        .or(`id.eq.${id},application_id.eq.${id}`)
        .select();

      if (error) throw error;
      return data ? mapAppFromSupabase(data[0]) : null;
    } catch (e) {
      console.error('Error deleting in Supabase:', e.message);
      return null;
    }
  },

  // Get User by Email (for Auth)
  getUserByEmail: async (email) => {
    if (!supabase) return null;
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail);

      if (error || !data || data.length === 0) return null;

      const row = data[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        organizationId: row.organization_id,
        avatar: row.avatar
      };
    } catch (e) {
      console.error('Error fetching user by email from Supabase:', e.message);
      return null;
    }
  },

  // Get User by ID
  getUserById: async (id) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id);

      if (error || !data || data.length === 0) return null;

      const row = data[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        organizationId: row.organization_id,
        avatar: row.avatar
      };
    } catch (e) {
      console.error('Error fetching user by ID from Supabase:', e.message);
      return null;
    }
  }
};

module.exports = supabaseDb;

