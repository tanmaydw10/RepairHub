import http from 'http';
import app from '../server.js';

async function runTests() {
  console.log('🧪 Starting End-to-End HTTP Auth Endpoint Tests...\n');

  // Let server initialize database
  await new Promise(resolve => setTimeout(resolve, 1500));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, '127.0.0.1', resolve));

  const BASE = 'http://127.0.0.1:5099/api/auth';

  async function post(url, data) {
    const res = await fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, data: json };
  }

  async function get(url, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${url}`, { headers });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, data: json };
  }

  let passed = 0;
  let total = 0;

  function assert(testName, condition, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
    }
  }

  try {
    const timestamp = Date.now();
    const testCustomerEmail = `e2e_cust_${timestamp}@repairtest.com`;

    // Test 1: Register customer
    const reg1 = await post('/register', {
      name: 'Rohan Sharma',
      email: testCustomerEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'customer',
      phone: '+91 98765 11111'
    });
    assert('1. Register customer returns 201 and token', reg1.status === 201 && reg1.data.token && reg1.data.user?.role === 'customer');
    assert('1b. Password is not returned in response', reg1.data.user?.password === undefined);

    const customerToken = reg1.data.token;

    // Test 2: Register with missing field
    const reg2 = await post('/register', {
      name: 'Rohan Sharma',
      email: `missing_${timestamp}@repairtest.com`
    });
    assert('2. Missing password returns 400', reg2.status === 400 && reg2.data.success === false);

    // Test 3: Duplicate email rejection
    const reg3 = await post('/register', {
      name: 'Duplicate Rohan',
      email: testCustomerEmail,
      password: 'differentpass',
      confirmPassword: 'differentpass'
    });
    assert('3. Duplicate email returns 400', reg3.status === 400 && reg3.data.message.includes('already exists'));

    // Test 4: Invalid email format rejection
    const reg4 = await post('/register', {
      name: 'Bad Email',
      email: 'notanemail',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert('4. Invalid email format returns 400', reg4.status === 400);

    // Test 5: Password too short rejection
    const reg5 = await post('/register', {
      name: 'Short Pass',
      email: `short_${timestamp}@repairtest.com`,
      password: '123',
      confirmPassword: '123'
    });
    assert('5. Password < 6 chars returns 400', reg5.status === 400);

    // Test 6: Mismatched password confirmation
    const reg6 = await post('/register', {
      name: 'Mismatch Pass',
      email: `mismatch_${timestamp}@repairtest.com`,
      password: 'password123',
      confirmPassword: 'password999'
    });
    assert('6. Mismatched confirmPassword returns 400', reg6.status === 400);

    // Test 7: Prevent admin role privilege escalation
    const reg7 = await post('/register', {
      name: 'Hacker User',
      email: `hacker_${timestamp}@repairtest.com`,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'admin' // Attempted admin role
    });
    assert('7. Privilege escalation blocked (role forced to customer)', reg7.status === 201 && reg7.data.user?.role === 'customer');

    // Test 8: Register repairer technician
    const testTechEmail = `e2e_tech_${timestamp}@repairtest.com`;
    const reg8 = await post('/register', {
      name: 'Vikram Singh',
      email: testTechEmail,
      password: 'techpassword123',
      confirmPassword: 'techpassword123',
      role: 'repairer',
      phone: '+91 98888 22222',
      service_categories: 'Mobile, Tablet, Laptop',
      service_area: 'Bengaluru Metro'
    });
    assert('8. Register repairer returns role=repairer', reg8.status === 201 && reg8.data.user?.role === 'repairer');

    // Test 9: Login with valid credentials
    const login1 = await post('/login', {
      email: testCustomerEmail,
      password: 'password123'
    });
    assert('9. Login with valid credentials returns 200 and token', login1.status === 200 && login1.data.token);

    // Test 10: Login with wrong password
    const login2 = await post('/login', {
      email: testCustomerEmail,
      password: 'wrongpassword'
    });
    assert('10. Login with invalid password returns 401', login2.status === 401 && login2.data.success === false);

    // Test 11: Login with non-existent user
    const login3 = await post('/login', {
      email: 'nobody@nowhere.local',
      password: 'password123'
    });
    assert('11. Non-existent email returns 401', login3.status === 401 && login3.data.success === false);

    // Test 12: GET /me with valid Bearer token
    const me1 = await get('/me', customerToken);
    assert('12. GET /me with valid token returns user profile', me1.status === 200 && me1.data.user?.email === testCustomerEmail);

    // Test 13: GET /me without token
    const me2 = await get('/me');
    assert('13. GET /me without token returns 401 Unauthorized', me2.status === 401);

    console.log(`\n🎉 Results: ${passed}/${total} HTTP auth endpoint tests passed!`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
