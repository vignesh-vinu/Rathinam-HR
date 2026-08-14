const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

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

  // Insert Application
  insertApplication: async (app) => {
    if (!supabase) return null;
    try {
      const dbRow = mapAppToSupabase(app);
      const { data, error } = await supabase.from('applications').insert([dbRow]).select();
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('applications')
        .update(dbRow)
        .or(`id.eq.${id},application_id.eq.${id}`)
        .select();
      if (error) throw error;
      return mapAppFromSupabase(data[0]);
    } catch (e) {
      console.error('Error updating in Supabase:', e.message);
      return null;
    }
  }
};

module.exports = supabaseDb;
