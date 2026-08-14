const db = require('./db');
const supabaseDb = require('./supabase');

async function syncUsersToSupabase() {
  console.log('🚀 Syncing Users & HR Admin Credentials to Supabase PostgreSQL Database...');
  
  if (!supabaseDb.isConfigured()) {
    console.error('❌ Supabase not configured.');
    return;
  }

  const localData = db.read();
  console.log(`📦 Found ${localData.users.length} user accounts.`);

  // Clean existing users table in Supabase
  console.log('🧹 Cleaning old user accounts from Supabase...');
  await supabaseDb.client.from('users').delete().neq('id', '');

  for (const user of localData.users) {
    const dbRow = {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role: user.role,
      organization_id: user.organizationId,
      avatar: user.avatar
    };

    console.log(`Syncing user ${user.email} (${user.name})...`);
    const { data, error } = await supabaseDb.client
      .from('users')
      .upsert([dbRow], { onConflict: 'id' });

    if (error) {
      console.error(`⚠️ Error syncing ${user.email}:`, error.message);
    } else {
      console.log(`✅ Successfully synced ${user.email} into Supabase!`);
    }
  }

  console.log('✨ Users sync finished!');
}

syncUsersToSupabase();
