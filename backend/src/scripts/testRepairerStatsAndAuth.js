import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { formatToDateOnly, getDashboardStats } from '../controllers/repairerController.js';
import { requestRepository, reviewRepository } from '../models/dbRepository.js';
import { initDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'repairhub_dev_secret_key_change_in_production_32char';

async function runRepairerTests() {
  console.log('🧪 Running Technician Stats & Authentication Test Suite...\n');
  await initDb();

  let passed = 0;
  let total = 0;

  function assert(name, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
    }
  }

  // --- UNIT TESTS FOR formatToDateOnly ---
  console.log('--- Testing formatToDateOnly Date Handling ---');

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. PostgreSQL Date object
  const pgDateObj = new Date();
  assert('1. PostgreSQL Date object converts to YYYY-MM-DD', formatToDateOnly(pgDateObj) === todayStr);

  // 2. ISO 8601 string
  const isoString = '2026-10-10T15:30:00.000Z';
  assert('2. ISO string converts to YYYY-MM-DD', formatToDateOnly(isoString) === '2026-10-10');

  // 3. Date-only string
  const dateOnlyStr = '2026-10-10';
  assert('3. Date-only string converts to YYYY-MM-DD', formatToDateOnly(dateOnlyStr) === '2026-10-10');

  // 4. Numeric timestamp
  const timestampNum = new Date('2026-10-10T00:00:00Z').getTime();
  assert('4. Numeric timestamp converts to YYYY-MM-DD', formatToDateOnly(timestampNum) === '2026-10-10');

  // 5. Null value
  assert('5. Null returns empty string without throwing', formatToDateOnly(null) === '');

  // 6. Undefined value
  assert('6. Undefined returns empty string without throwing', formatToDateOnly(undefined) === '');

  // 7. Invalid Date object
  const invalidDate = new Date('invalid-date-string');
  assert('7. Invalid Date returns empty string without throwing', formatToDateOnly(invalidDate) === '');

  // 8. Unexpected object or boolean
  assert('8. Non-date object returns empty string without throwing', formatToDateOnly({}) === '');

  // --- CONTROLLER UNIT TEST: getDashboardStats with mixed PostgreSQL Date types ---
  console.log('\n--- Testing getDashboardStats with PostgreSQL Date Objects ---');

  // Temporarily mock requestRepository.getAll to return rows with actual Date objects (as pg driver returns)
  const originalGetAll = requestRepository.getAll;
  const originalReviewsGetAll = reviewRepository.getAll;

  requestRepository.getAll = async () => [
    { id: 'TEST-001', status: 'Pending', estimated_cost: '2500', created_at: new Date() }, // Date object
    { id: 'TEST-002', status: 'In Progress', estimated_cost: '5000', created_at: new Date().toISOString() }, // String
    { id: 'TEST-003', status: 'Completed', estimated_cost: 7500, created_at: null }, // Null
    { id: 'TEST-004', status: 'Accepted', estimated_cost: null, created_at: undefined }, // Undefined
    { id: 'TEST-005', status: 'Completed', estimated_cost: '3000', created_at: new Date('2024-01-01') } // Old Date
  ];

  reviewRepository.getAll = async () => [
    { rating: 5 },
    { rating: 4 }
  ];

  let controllerResult = null;
  const mockReq = {};
  const mockRes = {
    json: (data) => {
      controllerResult = data;
      return data;
    }
  };
  const mockNext = (err) => {
    if (err) console.error('Controller error in mock:', err);
  };

  await getDashboardStats(mockReq, mockRes, mockNext);

  assert('9. getDashboardStats executes without throwing TypeError', controllerResult && controllerResult.success === true);
  assert('10. todaysRequests counts Date object and ISO string for today', controllerResult?.stats?.todaysRequests === 2);
  assert('11. totalRequests matches total rows', controllerResult?.stats?.totalRequests === 5);
  assert('12. estimatedRevenue correctly tallies completed + in progress', controllerResult?.stats?.estimatedRevenue === 15500);

  // Restore mocks
  requestRepository.getAll = originalGetAll;
  reviewRepository.getAll = originalReviewsGetAll;

  // --- END-TO-END HTTP TESTS FOR AUTHENTICATION FLOW ---
  console.log('\n--- Testing End-to-End HTTP Technician Auth Flow ---');

  // Let DB init
  await new Promise(r => setTimeout(r, 1000));

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5098, '127.0.0.1', resolve));

  const BASE = 'http://127.0.0.1:5098/api';

  try {
    // 13. Call /repairer/dashboard/stats without token -> 401
    const unauthRes = await fetch(`${BASE}/repairer/dashboard/stats`);
    const unauthData = await unauthRes.json().catch(() => ({}));
    assert('13. Unauthenticated request to /repairer/dashboard/stats returns 401', unauthRes.status === 401);
    assert('13b. Returns helpful authentication required message', unauthData.message?.includes('Authentication required'));

    // 14. Customer token requesting /repairer/dashboard/stats -> 403 Forbidden
    const customerToken = jwt.sign(
      { id: 1, email: 'customer@repairhub.local', role: 'customer', name: 'Alex Johnson' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const custRes = await fetch(`${BASE}/repairer/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert('14. Customer role accessing technician stats is blocked with 403 Forbidden', custRes.status === 403);

    // 15. Repairer token requesting /repairer/dashboard/stats -> 200 OK
    const repairerToken = jwt.sign(
      { id: 2, email: 'repairer@repairhub.local', role: 'repairer', name: 'Marcus Vance' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const techRes = await fetch(`${BASE}/repairer/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${repairerToken}` }
    });
    const techData = await techRes.json().catch(() => ({}));

    assert('15. Valid repairer token returns 200 OK', techRes.status === 200 && techData.success === true);
    assert('16. Dashboard stats payload contains required operational metrics', Boolean(
      techData.stats &&
      typeof techData.stats.totalRequests === 'number' &&
      typeof techData.stats.todaysRequests === 'number' &&
      typeof techData.stats.estimatedRevenue === 'number'
    ));

    // 17. Public reviews endpoint returns 200 without auth (for public landing page)
    const publicReviewsRes = await fetch(`${BASE}/reviews`);
    assert('17. Public reviews endpoint (/reviews) accessible without authentication', publicReviewsRes.status === 200);

    console.log(`\n🎉 Results: ${passed}/${total} Technician Stats & Auth tests passed!`);
  } finally {
    server.close();
    process.exit(passed === total ? 0 : 1);
  }
}

runRepairerTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
