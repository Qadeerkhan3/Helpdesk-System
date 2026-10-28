'use client';

import { useState, useEffect } from 'react';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedAgent?: { _id: string; name: string; email: string } | string;
  createdAt: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all tickets for admin
  const fetchAllTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available agents/admins
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/users/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch agents');
    }
  };

  useEffect(() => {
    fetchAllTickets();
    fetchAgents();
  }, []);

  // Update ticket status
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchAllTickets();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Assign agent to ticket
  const handleAgentAssignment = async (ticketId: string, agentId: string) => {
    setUpdatingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedAgent: agentId || null }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchAllTickets();
      } else {
        alert(data.error || 'Failed to assign agent');
      }
    } catch (err) {
      console.error('Error assigning agent:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered tickets
  const filteredTickets = filterStatus === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin / IT Helpdesk Portal</h1>
            <p className="text-sm text-gray-500">Manage, review, and resolve student support tickets.</p>
          </div>
          <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold">
            Role: Administrator
          </span>
        </div>

        {/* Filters and Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total Tickets: <span className="text-blue-600 font-bold">{tickets.length}</span>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Incoming Support Requests</h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading all tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No tickets found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-3 px-3">Ticket #</th>
                    <th className="py-3 px-3">Title & Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Assign Agent</th>
                    <th className="py-3 px-3">Action (Status)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    // Current assigned agent ID check
                    const currentAgentId = typeof ticket.assignedAgent === 'object' && ticket.assignedAgent !== null
                      ? ticket.assignedAgent._id 
                      : ticket.assignedAgent || '';

                    return (
                      <tr key={ticket._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-3 font-medium text-blue-600 align-top">{ticket.ticketNumber}</td>
                        <td className="py-4 px-3 align-top max-w-xs">
                          <p className="font-semibold text-gray-800">{ticket.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                        </td>
                        <td className="py-4 px-3 text-gray-600 align-top">{ticket.category}</td>
                        <td className="py-4 px-3 align-top">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            ticket.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                            ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-3 align-top">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>

                        {/* Assign Agent Dropdown */}
                        <td className="py-4 px-3 align-top">
                          <select
                            value={currentAgentId}
                            disabled={updatingId === ticket._id}
                            onChange={(e) => handleAgentAssignment(ticket._id, e.target.value)}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Unassigned --</option>
                            {agents.map((agent) => (
                              <option key={agent._id} value={agent._id}>
                                {agent.name} ({agent.role})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Update Status Dropdown */}
                        <td className="py-4 px-3 align-top">
                          <select
                            value={ticket.status}
                            disabled={updatingId === ticket._id}
                            onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}