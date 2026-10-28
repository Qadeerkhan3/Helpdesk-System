import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Ticket from '../../../../models/Ticket';

// PATCH: Update ticket status or assign agent (Admin/Agent Role)
export async function PATCH(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Await params safely for Next.js app router compatibility
    const resolvedParams = await context.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is missing in parameters' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, assignedAgent } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedAgent) updateData.assignedAgent = assignedAgent;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Ticket Error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}