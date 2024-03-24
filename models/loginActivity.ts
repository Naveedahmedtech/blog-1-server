import { Schema, model, models } from 'mongoose';

const loginActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    result: String, // e.g., 'Success', 'Failed', 'Account Locked'
    reason: String, // e.g., 'Incorrect Password', 'Account not verified'
    location: String,
    sessionId: String,
  },
  { collection: 'login_activities' },
);

// Check if the model exists before compiling it
export const LoginActivityModel =
  models.LoginActivity || model('LoginActivity', loginActivitySchema);

export { loginActivitySchema };
