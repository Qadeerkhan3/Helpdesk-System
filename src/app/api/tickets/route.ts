import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Ticket from '../../../models/Ticket';
import '../../../models/User'; // <-- Yeh line lazmi hai taake populate('student') crash na ho!
import { createTicketSchema } from '../../../lib/validations/ticket';

// POST: Create a new support ticket (Student Role)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const validationResult = createTicketSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const { title, description, category, priority } = validationResult.data;
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Student ID missing' },
        { status: 401 }
      );
    }

    const totalTickets = await Ticket.countDocuments();
    const ticketNumber = `TKT-${1000 + totalTickets + 1}`;

    const slaHours = 
      priority === 'Urgent' ? 2 : 
      priority === 'High' ? 6 : 
      priority === 'Medium' ? 24 : 48;

    const slaDueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newTicket = await Ticket.create({
      ticketNumber,
      title,
      description,
      category,
      priority,
      status: 'Open',
      student: studentId,
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
      { success: false, error: 'Internal Server Error', details: error.message },
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
    console.error('GET Tickets Error:', error.message); // Terminal mein exact error print hoga
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}