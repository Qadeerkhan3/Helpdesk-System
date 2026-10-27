import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  student: mongoose.Types.ObjectId;
  assignedAgent?: mongoose.Types.ObjectId;
  attachments?: string[];
  internalNotes: {
    author: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  slaDueDate: Date;
  createdAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  ticketNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
  attachments: [{ type: String }],
  internalNotes: [
    {
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  slaDueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);