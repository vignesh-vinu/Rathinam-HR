const db = require('./db');
const supabaseDb = require('./supabase');

async function syncAllToSupabase() {
  console.log('🚀 Starting Data Sync to Supabase PostgreSQL Database...');
  
  if (!supabaseDb.isConfigured()) {
    console.error('❌ Supabase not configured.');
    return;
  }

  const test = await supabaseDb.testConnection();
  console.log('📡 Connection status:', test);

  const localData = db.read();
  console.log(`📦 Found ${localData.applications.length} local application records.`);

  for (const app of localData.applications) {
    console.log(`Syncing ${app.applicationId} (${app.personalDetails?.fullName})...`);
    const res = await supabaseDb.insertApplication(app);
    if (res) {
      console.log(`✅ Successfully synced ${app.applicationId} to Supabase!`);
    } else {
      console.log(`⚠️ Note: Insert into Supabase requires table schema created via SQL Editor.`);
    }
  }

  console.log('✨ Sync process finished!');
}

syncAllToSupabase();
