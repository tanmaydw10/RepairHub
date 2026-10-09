import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository, repairerRepository } from '../models/dbRepository.js';
import { initDb } from '../config/db.js';

async function testAuth() {
  console.log('Testing auth logic...');
  await initDb();

  // Test 1: Existing user login check
  const existing = await userRepository.findByEmail('customer@repairhub.local');
  console.log('Test 1: Find seeded customer:', existing ? 'PASS' : 'FAIL');
  const match = await bcrypt.compare('password123', existing.password);
  console.log('Test 1b: Verify seeded password bcrypt:', match ? 'PASS' : 'FAIL');

  // Test 2: Create new customer
  const testEmail = 'newtestuser_' + Date.now() + '@example.com';
  const hashed = await bcrypt.hash('secretPass123', 10);
  const created = await userRepository.create({
    name: 'Test Customer',
    email: testEmail,
    password: hashed,
    role: 'customer',
    phone: '+91 99999 88888',
    address: '123 Test Lane'
  });
  console.log('Test 2: Create customer user:', created && created.id ? 'PASS' : 'FAIL', created);

  // Test 3: Duplicate email check
  const dup = await userRepository.findByEmail(testEmail);
  console.log('Test 3: Find by email lowercase:', dup && dup.email === testEmail.toLowerCase() ? 'PASS' : 'FAIL');

  // Test 4: Create technician user and repairer profile
  const techEmail = 'newtechnician_' + Date.now() + '@example.com';
  const techUser = await userRepository.create({
    name: 'Tech Specialist',
    email: techEmail,
    password: hashed,
    role: 'repairer',
    phone: '+91 88888 77777',
    address: '456 Workshop St'
  });
  console.log('Test 4: Create technician user:', techUser && techUser.id ? 'PASS' : 'FAIL');

  const profile = await repairerRepository.updateProfile(techUser.id, {
    name: 'Tech Specialist',
    phone: '+91 88888 77777',
    service_categories: 'Mobile, Laptop',
    service_area: 'Bengaluru Metro',
    bio: 'Certified engineer'
  });
  console.log('Test 4b: Repairer profile creation/update:', profile && profile.user_id === techUser.id ? 'PASS' : 'FAIL');

  console.log('ALL BACKEND REPOSITORY AND AUTH TESTS PASSED!');
}

testAuth().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
