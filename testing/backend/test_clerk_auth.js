import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLE_HIERARCHY } from '../../backend/middleware/authMiddleware.js';
import User, { USER_ROLES, USER_STATUSES } from '../../backend/models/User.js';
import UrlScan from '../../backend/models/UrlScan.js';
import Complaint from '../../backend/models/Complaint.js';

test('Clerk Auth Middleware: Role Hierarchy Verification', () => {
  assert.equal(ROLE_HIERARCHY.GUEST, 0);
  assert.equal(ROLE_HIERARCHY.USER, 10);
  assert.equal(ROLE_HIERARCHY.ANALYST, 20);
  assert.equal(ROLE_HIERARCHY.ADMIN, 30);
  assert.equal(ROLE_HIERARCHY.SUPER_ADMIN, 40);

  assert.ok(ROLE_HIERARCHY.USER > ROLE_HIERARCHY.GUEST);
  assert.ok(ROLE_HIERARCHY.ANALYST > ROLE_HIERARCHY.USER);
  assert.ok(ROLE_HIERARCHY.ADMIN > ROLE_HIERARCHY.ANALYST);
  assert.ok(ROLE_HIERARCHY.SUPER_ADMIN > ROLE_HIERARCHY.ADMIN);
});

test('Database Schema: User Model Schema Validation', () => {
  assert.ok(USER_ROLES.includes('USER'));
  assert.ok(USER_ROLES.includes('ANALYST'));
  assert.ok(USER_ROLES.includes('ADMIN'));
  assert.ok(USER_ROLES.includes('SUPER_ADMIN'));

  assert.ok(USER_STATUSES.includes('ACTIVE'));
  assert.ok(USER_STATUSES.includes('SUSPENDED'));

  const paths = User.schema.paths;
  assert.ok(paths.clerkUserId, 'User model must have clerkUserId field');
  assert.ok(paths.role, 'User model must have role field');
  assert.ok(paths.status, 'User model must have status field');
  assert.ok(paths.lastLoginAt, 'User model must have lastLoginAt field');
});

test('Database Schema: UrlScan Ownership Isolation Verification', () => {
  const paths = UrlScan.schema.paths;
  assert.ok(paths.userId, 'UrlScan must have indexed userId for user isolation');
  assert.ok(paths.ownerUserId, 'UrlScan must support ownerUserId for cross-platform linking');
  assert.equal(paths.userId.defaultValue, null, 'Default userId must be null for guest scanning');
});

test('Database Schema: Complaint Ownership & Reporter Types', () => {
  const paths = Complaint.schema.paths;
  assert.ok(paths.userId, 'Complaint must support verified userId');
  assert.ok(paths.reporterType, 'Complaint must have reporterType');
  assert.ok(paths.reporterType.enumValues.includes('AUTHENTICATED'));
  assert.ok(paths.reporterType.enumValues.includes('GUEST'));
});
