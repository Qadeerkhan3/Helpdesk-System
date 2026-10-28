import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import User from '../../../models/User'; // <-- User model import kar liya hai
import '../../../models/User';

// POST: Create a new support ticket (Student Role)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { title, description, category, priority, studentId, userId } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields (title, description, category)' },
        { status: 400 }
      );
    }

    // Agar frontend se ID na aaye, toh database se koi bhi pehla student dhoond kar assign kar dein
    let finalStudentId = studentId || userId;
    if (!finalStudentId) {
      const defaultStudent = await User.findOne({ role: 'student' });
      if (defaultStudent) {
        finalStudentId = defaultStudent._id;
      }
    }

    const totalTickets = await Ticket.countDocuments();
    const ticketNumber = `TKT-${1000 + totalTickets + 1}`;

    const priorityLevel = priority || 'Medium';
    const slaHours = 
      priorityLevel === 'Urgent' ? 2 : 
      priorityLevel === 'High' ? 6 : 
      priorityLevel === 'Medium' ? 24 : 48;

    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newTicket = await Ticket.create({
      ticketNumber,
      title,
      description,
      category,
      priority: priorityLevel,
      status: 'Open',
      student: finalStudentId || undefined, // Agar phir bhi na ho toh Mongoose schema crash na ho
      slaDueDate,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Ticket created successfully', 
        data: newTicket 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET: Fetch tickets based on user role and permissions
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const agentId = searchParams.get('agentId');
    const role = searchParams.get('role');

    let query: any = {};

    if (role === 'student' && studentId) {
      query.student = studentId;
    } else if (role === 'agent' && agentId) {
      query.assignedAgent = agentId;
    }

    const tickets = await Ticket.find(query)
      .populate('student', 'name email dept')
      .populate('assignedAgent', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: tickets.length, data: tickets }, { status: 200 });

  } catch (error: any) {
    console.error('GET Tickets Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}