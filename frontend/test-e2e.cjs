const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const axios = require('axios');

const MONGO_PORT = 27022;
const BACKEND_PORT = 5095;
const TEST_DB_URI = `mongodb://127.0.0.1:${MONGO_PORT}/sms_frontend_auth_e2e_db`;
const API_BASE_URL = `http://127.0.0.1:${BACKEND_PORT}/api`;

let mongodProc;
let backendProc;
let tempDbDir;
let authToken;
let createdStudentId;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

describe('Frontend Auth & Protected CRUD E2E Integration Suite', () => {
  before(async () => {
    tempDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongo-fe-auth-'));

    // 1. Start mongod
    await new Promise((resolve, reject) => {
      mongodProc = spawn('mongod', [
        '--dbpath', tempDbDir,
        '--port', MONGO_PORT.toString(),
        '--bind_ip', '127.0.0.1'
      ]);

      mongodProc.stdout.on('data', (d) => {
        if (d.toString().includes('Waiting for connections')) resolve();
      });
      mongodProc.on('error', reject);
      setTimeout(resolve, 3000);
    });

    // 2. Start backend server with custom port & mongo URI
    const backendServerPath = path.resolve(__dirname, '../backend/server.js');
    await new Promise((resolve, reject) => {
      backendProc = spawn('node', [backendServerPath], {
        env: {
          ...process.env,
          PORT: BACKEND_PORT.toString(),
          MONGO_URI: TEST_DB_URI,
          JWT_SECRET: 'test_e2e_jwt_secret_key_2026',
          JWT_EXPIRE: '1d',
          ADMIN_INVITE_CODE: 'SMS-ADMIN-2026',
          NODE_ENV: 'test'
        }
      });

      backendProc.stdout.on('data', (d) => {
        const out = d.toString();
        if (out.includes(`port ${BACKEND_PORT}`) || out.includes('MongoDB Connected')) {
          resolve();
        }
      });
      backendProc.on('error', reject);
      setTimeout(resolve, 3000);
    });
  });

  after(async () => {
    if (backendProc && !backendProc.killed) {
      backendProc.kill();
    }
    if (mongodProc && !mongodProc.killed) {
      mongodProc.kill();
    }
    if (tempDbDir && fs.existsSync(tempDbDir)) {
      try {
        fs.rmSync(tempDbDir, { recursive: true, force: true });
      } catch (e) {}
    }
  });

  // 1. Connectivity
  it('1. GET /api/health - verifies backend is reachable', async () => {
    const res = await apiClient.get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'OK');
  });

  // 2. Security: Verify unauthenticated request to /students is rejected
  it('2. GET /api/students without token should return 401 Unauthorized', async () => {
    try {
      await apiClient.get('/students');
      assert.fail('Should have failed with 401');
    } catch (err) {
      assert.strictEqual(err.response.status, 401);
      assert.strictEqual(err.response.data.success, false);
      assert.strictEqual(err.response.data.error, 'Not authorized: No authentication token provided.');
    }
  });

  // 3. Registration
  it('3. POST /api/auth/register - register initial administrator', async () => {
    const res = await apiClient.post('/auth/register', {
      fullName: 'Dean of Students',
      email: 'dean@university.edu',
      password: 'DeanPassword2026!',
      confirmPassword: 'DeanPassword2026!'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token, 'Expected JWT token');
    assert.strictEqual(res.data.data.email, 'dean@university.edu');
    assert.strictEqual(res.data.data.role, 'superadmin');
  });

  // 4. Duplicate Registration
  it('4. POST /api/auth/register - duplicate registration should return 409 Conflict', async () => {
    try {
      await apiClient.post('/auth/register', {
        fullName: 'Dean Duplicate',
        email: 'dean@university.edu',
        password: 'DeanPassword2026!',
        confirmPassword: 'DeanPassword2026!'
      });
      assert.fail('Should have failed with 409');
    } catch (err) {
      assert.strictEqual(err.response.status, 409);
      assert.strictEqual(err.response.data.success, false);
      assert.ok(err.response.data.error.includes('already exists'));
    }
  });

  // 5. Login with invalid credentials
  it('5. POST /api/auth/login - invalid credentials should return 401', async () => {
    try {
      await apiClient.post('/auth/login', {
        email: 'dean@university.edu',
        password: 'WrongPassword'
      });
      assert.fail('Should have failed with 401');
    } catch (err) {
      assert.strictEqual(err.response.status, 401);
      assert.strictEqual(err.response.data.success, false);
      assert.ok(err.response.data.error.includes('Invalid email or password'));
    }
  });

  // 6. Login with valid credentials
  it('6. POST /api/auth/login - valid credentials returns JWT token', async () => {
    const res = await apiClient.post('/auth/login', {
      email: 'dean@university.edu',
      password: 'DeanPassword2026!'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token);
    authToken = res.data.data.token;
  });

  // 7. GET /api/auth/me with Bearer token
  it('7. GET /api/auth/me - retrieves admin profile using JWT', async () => {
    const res = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.email, 'dean@university.edu');
  });

  // 8. Protected Student CRUD with JWT
  it('8. POST /api/students with token - creates student', async () => {
    const newStudent = {
      studentName: 'Hannah Montana',
      registrationNumber: 'MUSIC-2026-01',
      email: 'hannah@university.edu',
      phone: '+1-555-0988',
      course: 'Music Arts',
      semester: 2
    };

    const res = await apiClient.post('/students', newStudent, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.studentName, 'Hannah Montana');
    createdStudentId = res.data.data._id;
  });

  it('9. GET /api/students with token - retrieves student list', async () => {
    const res = await apiClient.get('/students', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.count, 1);
  });

  it('10. PUT /api/students/:id with token - updates student', async () => {
    const res = await apiClient.put(`/students/${createdStudentId}`, {
      semester: 3
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.semester, 3);
  });

  it('11. DELETE /api/students/:id with token - deletes student', async () => {
    const res = await apiClient.delete(`/students/${createdStudentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 12. Profile Updates
  it('12. PUT /api/auth/profile - updates admin profile information', async () => {
    const res = await apiClient.put('/auth/profile', {
      fullName: 'Dean of Academic Services',
      phone: '+1-555-0199',
      department: 'Faculty Administration',
      designation: 'Chief Dean'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.fullName, 'Dean of Academic Services');
    assert.strictEqual(res.data.data.department, 'Faculty Administration');
  });

  // 13. Password Change
  it('13. PUT /api/auth/change-password - changes admin password', async () => {
    const res = await apiClient.put('/auth/change-password', {
      currentPassword: 'DeanPassword2026!',
      newPassword: 'UpdatedDeanPassword2026!',
      confirmNewPassword: 'UpdatedDeanPassword2026!'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 14. Attendance Management Endpoints E2E
  let attendStudentId;

  it('14. POST /api/students - create student for attendance testing', async () => {
    const res = await apiClient.post('/students', {
      studentName: 'Attendance E2E Student',
      registrationNumber: 'ATTEND-E2E-99',
      email: 'attend.e2e@university.edu',
      phone: '+1-555-9090',
      course: 'Cybersecurity',
      semester: 3
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    attendStudentId = res.data.data._id;
    assert.ok(attendStudentId);
  });

  it('15. POST /api/attendance - mark attendance on 17 Nov as Present', async () => {
    const res = await apiClient.post('/attendance', {
      date: '2026-11-17',
      records: [
        {
          studentId: attendStudentId,
          status: 'Present',
          remarks: 'Present on time'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.date, '2026-11-17');
    assert.strictEqual(res.data.summary.present, 1);
  });

  it('16. POST /api/attendance - mark attendance on 18 Nov as Absent', async () => {
    const res = await apiClient.post('/attendance', {
      date: '2026-11-18',
      records: [
        {
          studentId: attendStudentId,
          status: 'Absent',
          remarks: 'Absent unexcused'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.date, '2026-11-18');
    assert.strictEqual(res.data.summary.absent, 1);
  });

  it('17. GET /api/attendance?date=2026-11-17 - verifies 17 Nov attendance is Present', async () => {
    const res = await apiClient.get('/attendance?date=2026-11-17', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.summary.present, 1);
    assert.strictEqual(res.data.data[0].status, 'Present');
  });

  it('18. POST /api/attendance - update 17 Nov to Late and verify 18 Nov is unchanged', async () => {
    // Update 17 Nov
    const updateRes = await apiClient.post('/attendance', {
      date: '2026-11-17',
      records: [
        {
          studentId: attendStudentId,
          status: 'Late',
          remarks: 'Late 10 mins'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(updateRes.status, 200);

    // Verify 17 Nov is Late
    const res17 = await apiClient.get('/attendance?date=2026-11-17', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res17.data.summary.late, 1);
    assert.strictEqual(res17.data.data[0].status, 'Late');

    // Verify 18 Nov remains Absent
    const res18 = await apiClient.get('/attendance?date=2026-11-18', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res18.data.summary.absent, 1);
    assert.strictEqual(res18.data.data[0].status, 'Absent');
  });

  it('19. GET /api/attendance/student/:id - retrieves complete student attendance history', async () => {
    const res = await apiClient.get(`/attendance/student/${attendStudentId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.stats.totalSessions, 2);
    assert.strictEqual(res.data.stats.late, 1);
    assert.strictEqual(res.data.stats.absent, 1);
  });

  // 20. Logout
  it('20. POST /api/auth/logout - logs out admin', async () => {
    const res = await apiClient.post('/auth/logout');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });
});
