const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const { app } = require('./server');

const TEST_PORT = 5096;
const MONGO_PORT = 27021;
const MONGO_URI = `mongodb://127.0.0.1:${MONGO_PORT}/student_mgmt_auth_test_db`;

let server;
let mongodProcess;
let tempDbDir;
let authToken;
let createdStudentId;
let attendanceStudentId;

describe('Student Management System - Auth & Protected CRUD Integration Tests', () => {
  before(async () => {
    // 1. Create a temporary folder for isolated mongod instance
    tempDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongo-auth-test-'));

    // 2. Spawn local mongod process
    await new Promise((resolve, reject) => {
      let resolved = false;
      const doResolve = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      mongodProcess = spawn('mongod', [
        '--dbpath', tempDbDir,
        '--port', MONGO_PORT.toString(),
        '--bind_ip', '127.0.0.1'
      ]);

      mongodProcess.stdout.on('data', (data) => {
        const str = data.toString();
        if (str.includes('Waiting for connections')) {
          setTimeout(doResolve, 500);
        }
      });

      mongodProcess.stderr.on('data', (data) => {
        console.error('mongod stderr:', data.toString());
      });

      mongodProcess.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });

      setTimeout(doResolve, 6000);
    });

    // 3. Connect Mongoose to the test database with retry
    let retries = 10;
    while (retries > 0) {
      try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // 4. Start Express server on test port
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up Express server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    // Clean up Mongoose connection & drop test database
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      } catch (err) {}
    }

    // Terminate mongod process
    if (mongodProcess && !mongodProcess.killed) {
      mongodProcess.kill('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Remove temporary directory
    if (tempDbDir && fs.existsSync(tempDbDir)) {
      try {
        fs.rmSync(tempDbDir, { recursive: true, force: true });
      } catch (e) {}
    }
  });

  // 1. Health & Welcome
  it('GET /api/health should return 200 OK and health status', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'OK');
  });

  // 2. Initial Admin Registration (Initial Setup)
  it('POST /api/auth/register should allow initial admin registration', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin Super',
        email: 'superadmin@university.edu',
        password: 'AdminPassword123!',
        confirmPassword: 'AdminPassword123!'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'superadmin@university.edu');
    assert.strictEqual(body.data.role, 'superadmin');
    assert.strictEqual(body.data.isInitialAdmin, true);
    assert.ok(body.data.token, 'Expected JWT token in response');
    assert.strictEqual(body.data.password, undefined, 'Password must not be returned');

    authToken = body.data.token;
  });

  // 3. Duplicate Registration Check
  it('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin Duplicate',
        email: 'superadmin@university.edu',
        password: 'AdminPassword123!',
        confirmPassword: 'AdminPassword123!'
      })
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('already exists'));
  });

  // 4. Restricted Registration without Invitation Code
  it('POST /api/auth/register should reject subsequent registration without valid invite code', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Unauthorized Admin',
        email: 'unauth@university.edu',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        adminInviteCode: 'WRONG-CODE'
      })
    });

    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('invitation code'));
  });

  // 5. Subsequent Registration with Valid Invitation Code
  it('POST /api/auth/register should succeed with valid admin invitation code', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Staff Admin',
        email: 'staffadmin@university.edu',
        password: 'StaffPassword123!',
        confirmPassword: 'StaffPassword123!',
        adminInviteCode: process.env.ADMIN_INVITE_CODE || 'SMS-ADMIN-2026'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, 'admin');
  });

  // 6. Login with Valid Credentials
  it('POST /api/auth/login should authenticate valid credentials and return JWT', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@university.edu',
        password: 'AdminPassword123!'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    assert.strictEqual(body.data.email, 'superadmin@university.edu');
    assert.strictEqual(body.data.password, undefined);

    authToken = body.data.token;
  });

  // 7. Login with Invalid Credentials
  it('POST /api/auth/login should reject incorrect password with 401', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@university.edu',
        password: 'WrongPasswordXYZ'
      })
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('Invalid email or password'));
  });

  // 8. Protected GET /api/auth/me
  it('GET /api/auth/me should return admin profile when token is provided', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.email, 'superadmin@university.edu');
    assert.strictEqual(body.data.password, undefined);
  });

  it('GET /api/auth/me should return 401 when token is missing', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // 9. Protected Routes Security & Token Validation Tests
  it('GET /api/students without token should return 401 Unauthorized without crashing', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Not authorized: No authentication token provided.');
  });

  it('GET /api/students with invalid token format should return 401 Unauthorized', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`, {
      headers: { Authorization: 'Bearer totally-invalid-token-value-here' }
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Not authorized: Invalid authentication token.');
  });

  it('GET /api/students with expired token should return 401 and session expired message', async () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId() },
      process.env.JWT_SECRET || 'sms_fallback_secret_key_2026',
      { expiresIn: '-1s' }
    );

    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Session expired. Please log in again.');
  });

  it('Server should remain healthy and functional after rejected unauthenticated requests', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'OK');
  });

  // 10. Student CRUD with Authentication
  it('POST /api/students with token should create student successfully', async () => {
    const newStudent = {
      studentName: 'Alice Johnson',
      registrationNumber: 'REG-2026-001',
      email: 'alice.johnson@university.edu',
      phone: '+1-555-0199',
      course: 'Computer Science',
      semester: 4
    };

    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(newStudent)
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.studentName, 'Alice Johnson');
    createdStudentId = body.data._id;
  });

  it('GET /api/students with token should retrieve student records', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.count, 1);
  });

  it('PUT /api/students/:id with token should update student record', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students/${createdStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        course: 'Software Engineering',
        semester: 5
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.semester, 5);
  });

  it('DELETE /api/students/:id with token should delete student record', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students/${createdStudentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });

  // 11. Profile Management APIs
  it('PUT /api/auth/profile without token should return 401', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Updated Admin' })
    });
    assert.strictEqual(res.status, 401);
  });

  it('PUT /api/auth/profile with invalid name should return 400', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ fullName: 'A' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('at least 2 characters'));
  });

  it('PUT /api/auth/profile should update profile details successfully', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        fullName: 'Administrator General',
        phone: '+1-555-0100',
        department: 'Academic Affairs',
        designation: 'Senior Registrar',
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.fullName, 'Administrator General');
    assert.strictEqual(body.data.phone, '+1-555-0100');
    assert.strictEqual(body.data.department, 'Academic Affairs');
    assert.strictEqual(body.data.designation, 'Senior Registrar');
    assert.ok(body.data.avatar.startsWith('data:image/png'));
    assert.strictEqual(body.data.password, undefined);
  });

  it('GET /api/auth/me should reflect the updated profile data', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.fullName, 'Administrator General');
    assert.strictEqual(body.data.department, 'Academic Affairs');
    assert.strictEqual(body.data.password, undefined);
  });

  // 12. Password Change APIs
  it('PUT /api/auth/change-password with wrong current password should return 400', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        currentPassword: 'WrongCurrentPassword!',
        newPassword: 'BrandNewPassword2026!',
        confirmNewPassword: 'BrandNewPassword2026!'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('Current password is incorrect'));
  });

  it('PUT /api/auth/change-password with mismatched confirmation should return 400', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        currentPassword: 'AdminPassword123!',
        newPassword: 'BrandNewPassword2026!',
        confirmNewPassword: 'DifferentPassword2026!'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('do not match'));
  });

  it('PUT /api/auth/change-password should successfully update password', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        currentPassword: 'AdminPassword123!',
        newPassword: 'BrandNewPassword2026!',
        confirmNewPassword: 'BrandNewPassword2026!'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.message.includes('Password changed successfully'));
  });

  it('POST /api/auth/login should authenticate with the new password', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@university.edu',
        password: 'BrandNewPassword2026!'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    authToken = body.data.token;
  });

  // ==========================================
  // DATE-WISE ATTENDANCE MANAGEMENT TEST SUITE
  // ==========================================

  it('GET /api/attendance without token should return 401 Unauthorized', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-17`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  it('POST /api/attendance without token should return 401 Unauthorized', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-11-17',
        records: []
      })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  it('POST /api/students should create an active student for attendance tests', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        studentName: 'Morgan Attendance Test',
        registrationNumber: 'ATTEND-2026-001',
        email: 'morgan.attend@university.edu',
        phone: '+1-555-8833',
        course: 'Computer Science',
        semester: 4
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    attendanceStudentId = body.data._id;
    assert.ok(attendanceStudentId);
  });

  // Scenario 1: Mark attendance on 17 November
  it('Scenario 1: POST /api/attendance should mark attendance for student on 17 November', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        date: '2026-11-17',
        records: [
          {
            studentId: attendanceStudentId,
            status: 'Present',
            remarks: 'On time for lecture'
          }
        ]
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.date, '2026-11-17');
    assert.strictEqual(body.summary.present, 1);
    assert.strictEqual(body.summary.absent, 0);

    const record = body.data.find(r => (r.student?._id || r.student) === attendanceStudentId);
    assert.ok(record);
    assert.strictEqual(record.status, 'Present');
    assert.strictEqual(record.remarks, 'On time for lecture');
  });

  // Scenario 2: Change date to 18 November and mark different attendance
  it('Scenario 2: POST /api/attendance should mark different attendance on 18 November', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        date: '2026-11-18',
        records: [
          {
            studentId: attendanceStudentId,
            status: 'Absent',
            remarks: 'Unexcused medical absence'
          }
        ]
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.date, '2026-11-18');
    assert.strictEqual(body.summary.present, 0);
    assert.strictEqual(body.summary.absent, 1);

    const record = body.data.find(r => (r.student?._id || r.student) === attendanceStudentId);
    assert.ok(record);
    assert.strictEqual(record.status, 'Absent');
    assert.strictEqual(record.remarks, 'Unexcused medical absence');
  });

  // Scenario 3: Return to 17 November and verify original attendance appears
  it('Scenario 3: GET /api/attendance?date=2026-11-17 returns original attendance intact', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-17`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.date, '2026-11-17');
    assert.strictEqual(body.summary.present, 1);
    assert.strictEqual(body.summary.absent, 0);

    const record = body.data.find(r => (r.student?._id || r.student) === attendanceStudentId);
    assert.ok(record);
    assert.strictEqual(record.status, 'Present');
    assert.strictEqual(record.remarks, 'On time for lecture');
  });

  // Scenario 4: Edit attendance on 17 November and verify 18 November remains unchanged
  it('Scenario 4: Editing 17 Nov attendance updates 17 Nov without mutating 18 Nov', async () => {
    // 1. Update 17 Nov from Present to Late
    const updateRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        date: '2026-11-17',
        records: [
          {
            studentId: attendanceStudentId,
            status: 'Late',
            remarks: 'Arrived 15 minutes late'
          }
        ]
      })
    });
    assert.strictEqual(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.strictEqual(updateBody.summary.late, 1);
    assert.strictEqual(updateBody.summary.present, 0);

    // 2. Verify 17 Nov is updated
    const check17 = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-17`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const body17 = await check17.json();
    const rec17 = body17.data.find(r => (r.student?._id || r.student) === attendanceStudentId);
    assert.strictEqual(rec17.status, 'Late');
    assert.strictEqual(rec17.remarks, 'Arrived 15 minutes late');

    // 3. Verify 18 Nov remains Absent and untouched
    const check18 = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-18`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const body18 = await check18.json();
    const rec18 = body18.data.find(r => (r.student?._id || r.student) === attendanceStudentId);
    assert.strictEqual(rec18.status, 'Absent');
    assert.strictEqual(rec18.remarks, 'Unexcused medical absence');
  });

  // Scenario 5: Refresh / re-query both dates and verify persistence
  it('Scenario 5: Both dates persist independently in MongoDB', async () => {
    const res17 = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-17`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const res18 = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance?date=2026-11-18`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const body17 = await res17.json();
    const body18 = await res18.json();

    assert.strictEqual(body17.data.length, 1);
    assert.strictEqual(body18.data.length, 1);
    assert.strictEqual(body17.data[0].status, 'Late');
    assert.strictEqual(body18.data[0].status, 'Absent');
  });

  // Scenario 6: Verify compound unique index prevents duplicate records
  it('Scenario 6: Compound unique index prevents duplicate attendance records for same student & date', async () => {
    let duplicateErrorThrown = false;
    try {
      // Attempting to directly insert a duplicate record for (attendanceStudentId, 2026-11-17)
      await Attendance.create({
        student: attendanceStudentId,
        date: new Date('2026-11-17T00:00:00.000Z'),
        dateString: '2026-11-17',
        status: 'Present',
        remarks: 'Duplicate entry attempt'
      });
    } catch (err) {
      duplicateErrorThrown = true;
      assert.strictEqual(err.code, 11000); // MongoDB duplicate key error code
    }

    assert.strictEqual(duplicateErrorThrown, true);

    // Verify count in database remains exactly 1 for 17 Nov
    const count17 = await Attendance.countDocuments({
      student: attendanceStudentId,
      dateString: '2026-11-17'
    });
    assert.strictEqual(count17, 1);
  });

  // Student Attendance History Endpoint
  it('GET /api/attendance/student/:id returns complete date-wise history and stats', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance/student/${attendanceStudentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.student.registrationNumber, 'ATTEND-2026-001');
    assert.strictEqual(body.stats.totalSessions, 2);
    assert.strictEqual(body.stats.late, 1);
    assert.strictEqual(body.stats.absent, 1);
    assert.strictEqual(body.data.length, 2);
  });

  // Attendance Summary Endpoint
  it('GET /api/attendance/summary?date=YYYY-MM-DD returns date summary breakdown', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance/summary?date=2026-11-17`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.date, '2026-11-17');
    assert.strictEqual(body.summary.late, 1);
    assert.strictEqual(body.summary.present, 0);
  });

  // Distinct Dates Endpoint
  it('GET /api/attendance/dates returns list of recorded dates', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/attendance/dates`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data.includes('2026-11-17'));
    assert.ok(body.data.includes('2026-11-18'));
  });

  // 13. Logout
  it('POST /api/auth/logout should return 200 OK', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/logout`, {
      method: 'POST'
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
  });
});
