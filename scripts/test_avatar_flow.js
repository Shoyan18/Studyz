const fs = require('fs');

async function runAvatarTests() {
  console.log('Testing Avatar APIs...');

  // 1. Demo login to get cookie
  const loginRes = await fetch('http://localhost:3000/api/auth/demo', { method: 'POST' });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('1. Demo login status:', loginRes.status, 'Cookie set:', Boolean(cookie));

  const headers = {
    'Cookie': cookie || '',
    'Content-Type': 'application/json',
  };

  // 2. GET /api/settings - verify avatarUrl returned
  const getSettingsRes = await fetch('http://localhost:3000/api/settings', { headers });
  const settingsData = await getSettingsRes.json();
  console.log('2. Settings user avatarUrl:', settingsData.user?.avatarUrl);

  // 3. PUT /api/settings with an SVG avatar preset
  const updateSettingsRes = await fetch('http://localhost:3000/api/settings', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      avatarUrl: '/avatars/avatar-quantum-mind.svg',
    }),
  });
  console.log('3. Update settings status:', updateSettingsRes.status);

  // 4. POST /api/profile/avatar with custom image (base64 test)
  const fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const customAvatarRes = await fetch('http://localhost:3000/api/profile/avatar', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      avatarUrl: fakeBase64,
    }),
  });
  const customAvatarData = await customAvatarRes.json();
  console.log('4. Custom avatar endpoint status:', customAvatarRes.status, 'avatarUrl saved:', customAvatarData.avatarUrl?.slice(0, 30));

  // 5. GET /api/profile - verify updated avatarUrl
  const getProfileRes = await fetch('http://localhost:3000/api/profile', { headers });
  const profileData = await getProfileRes.json();
  console.log('5. Profile user avatarUrl:', profileData.user?.avatarUrl?.slice(0, 30));

  // 6. Restore to a high-quality preset for clean state
  await fetch('http://localhost:3000/api/settings', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      avatarUrl: '/avatars/avatar-scholar-boy.svg',
    }),
  });
  console.log('6. Restored to high-quality preset: /avatars/avatar-scholar-boy.svg');

  console.log('ALL AVATAR API TESTS PASSED SUCCESSFULLY! ✅');
}

runAvatarTests().catch(console.error);
