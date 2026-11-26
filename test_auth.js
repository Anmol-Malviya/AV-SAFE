const { requireRole } = require('./backend/middleware/authMiddleware.js');

// Mock request with x-admin-key
const reqWithKey = {
  headers: new Map([
    ['x-admin-key', 'phishguard-secops-admin-key-2026'],
    ['authorization', '']
  ]),
  url: 'http://localhost:3000/api/admin/complaints'
};
// Add standard Web API get
reqWithKey.headers.get = (name) => reqWithKey.headers.get(name.toLowerCase()) || null;

requireRole(reqWithKey, 'ANALYST').then(res => {
  console.log('Result with x-admin-key:', res);
}).catch(err => console.error(err));
