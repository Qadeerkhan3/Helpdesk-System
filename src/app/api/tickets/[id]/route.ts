import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Ticket from '@/models/Ticket';

// PATCH: Update ticket status or assigned agent
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ticket ID is required' }, { status: 400 });
    }

    const body = await req.json();

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a ticket safely
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ticket ID is required' }, { status: 400 });
    }

    let deletedTicket = null;

    // 1. Check if ID is a valid MongoDB ObjectId format
    if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
      deletedTicket = await Ticket.findByIdAndDelete(id);
    }

    // 2. Fallback to ticketNumber if ObjectId check fails or ticket not found
    if (!deletedTicket) {
      deletedTicket = await Ticket.findOneAndDelete({ 
        $or: [
          { ticketNumber: id },
          { ticketNumber: typeof id === 'string' ? id.toUpperCase() : '' }
        ]
      });
    }

    if (!deletedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ticket deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete Ticket Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}