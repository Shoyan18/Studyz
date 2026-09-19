import { GET } from '../src/app/api/notifications/route';

async function testRoute() {
  try {
    const res = await GET(new Request('http://localhost:3000/api/notifications'));
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Body:', json);
  } catch (err) {
    console.error('Route threw:', err);
  }
}

testRoute();
