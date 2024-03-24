import { Schema, model, models, Document } from 'mongoose';

interface User extends Document {
  username: string;
  email: string;
  hashedPassword: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  role: 'USER' | 'ADMIN' | 'EDITOR' | 'INSTRUCTOR';
  emailVerified?: boolean;
  emailToken: string;
  emailTokenExpiry: Date;
  refreshToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  captchaToken?: string;
  loginAttempts?: number;
  lockoutUntil?: Date;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    hashedPassword: String,
    fullName: String,
    avatar: String,
    bio: String,
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'EDITOR', 'INSTRUCTOR'],
      default: 'USER',
    },
    emailVerified: { type: Boolean, default: false },
    emailToken: { type: String, unique: true },
    emailTokenExpiry: Date,
    refreshToken: String,
    resetToken: { type: String, unique: true },
    resetTokenExpiry: Date,
    captchaToken: String,
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    lastLogin: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'users' },
);

// Check if the model exists before compiling it
export const UserModel = models.User || model<User>('User', userSchema);
export type UserDocument = User; // Optionally export this if you prefer to use UserDocument in your service
export { userSchema };
