const db = require('./db');
const supabaseDb = require('./supabase');

async function syncAllData() {
  console.log('🚀 Starting Full Data Sync (Orgs -> Users -> Applications) to Supabase...');

  if (!supabaseDb.isConfigured()) {
    console.error('❌ Supabase client not configured.');
    return;
  }

  const localData = db.read();

  // 1. Sync Organizations First
  console.log('🏢 Syncing Organizations...');
  for (const org of localData.organizations) {
    const { error } = await supabaseDb.client
      .from('organizations')
      .upsert([{
        id: org.id,
        name: org.name,
        code: org.code,
        subtitle: org.subtitle,
        description: org.description,
        icon: org.icon,
        badge_color: org.badgeColor,
        accent_color: org.accentColor,
        active: org.active
      }], { onConflict: 'id' });

    if (error) {
      console.error(`⚠️ Error syncing org ${org.id}:`, error.message);
    } else {
      console.log(`✅ Synced Org: ${org.name}`);
    }
  }

  // 2. Sync Users Second
  console.log('👤 Syncing HR Admin Users...');
  for (const user of localData.users) {
    const { error } = await supabaseDb.client
      .from('users')
      .upsert([{
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash: user.passwordHash,
        role: user.role,
        organization_id: user.organizationId,
        avatar: user.avatar
      }], { onConflict: 'id' });

    if (error) {
      console.error(`⚠️ Error syncing user ${user.email}:`, error.message);
    } else {
      console.log(`✅ Synced User: ${user.email}`);
    }
  }

  // 3. Sync Applications Third
  console.log('📋 Syncing Candidate Applications...');
  for (const app of localData.applications) {
    const res = await supabaseDb.insertApplication(app);
    if (res) {
      console.log(`✅ Synced Application: ${app.applicationId} (${app.personalDetails?.fullName})`);
    } else {
      // If application already exists, update
      await supabaseDb.updateApplication(app.id, app);
      console.log(`✅ Updated Application: ${app.applicationId}`);
    }
  }

  console.log('✨ All Organizations, Users & Applications successfully synced to Supabase!');
}

syncAllData();
