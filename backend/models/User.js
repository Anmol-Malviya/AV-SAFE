import mongoose from 'mongoose';

export const USER_ROLES = ['USER', 'ANALYST', 'ADMIN', 'SUPER_ADMIN'];
export const USER_STATUSES = ['ACTIVE', 'SUSPENDED'];

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      index: true
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'USER',
      index: true
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'ACTIVE',
      index: true
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ clerkUserId: 1, status: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
