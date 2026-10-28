import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'agent' | 'admin';
  dept?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // Security: password by default hide rahega
  role: { 
    type: String, 
    enum: ['student', 'agent', 'admin'], 
    default: 'student' 
  },
  dept: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Password Hash karne ka middleware (Save se pehle)
// Password Hash karne ka middleware (Save se pehle)
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;