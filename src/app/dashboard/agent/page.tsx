'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchAgentTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentTickets();
  }, []);

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
        fetchAgentTickets();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const filteredTickets = filterStatus === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  // Stats calculation
  const totalCount = tickets.length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-bold h-10 w-10 rounded-xl flex items-center justify-center shadow-md">
              UH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">University Helpdesk</h1>
              <p className="text-xs text-slate-500">Support Agent Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-100">
              Agent Workspace
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Agent! 👋</h2>
            <p className="text-blue-100 text-sm mt-1">Here are the support requests assigned to your queue for resolution.</p>
          </div>
          <div className="flex bg-blue-800/60 backdrop-blur-md rounded-xl p-3 divide-x divide-blue-500/40 text-center">
            <div className="px-4">
              <p className="text-xs text-blue-200">Total Assigned</p>
              <p className="text-xl font-bold">{totalCount}</p>
            </div>
            <div className="px-4">
              <p className="text-xs text-blue-200">In Progress</p>
              <p className="text-xl font-bold">{inProgressCount}</p>
            </div>
            <div className="px-4">
              <p className="text-xs text-blue-200">Resolved</p>
              <p className="text-xl font-bold">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Filter:</span>
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchAgentTickets}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 transition"
          >
            🔄 Refresh List
          </button>
        </div>

        {/* Tickets Cards / Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Assigned Tickets</h3>
            <span className="text-xs text-slate-500">Showing {filteredTickets.length} tickets</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading your tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <p className="text-slate-400 text-lg">📭</p>
              <p className="text-slate-600 font-medium">No tickets found</p>
              <p className="text-slate-400 text-xs">There are no tickets matching this filter currently.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-3.5 px-6">Ticket ID</th>
                    <th className="py-3.5 px-6">Subject & Description</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action / Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-blue-600 align-top">
                        #{ticket.ticketNumber || ticket._id.slice(-6)}
                      </td>
                      <td className="py-4 px-6 align-top max-w-sm">
                        <p className="font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ticket.description}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 align-top text-xs font-medium">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
                          ticket.priority === 'Urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                          ticket.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'Closed' ? 'bg-slate-200 text-slate-700' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            ticket.status === 'Resolved' ? 'bg-emerald-600' :
                            ticket.status === 'In Progress' ? 'bg-blue-600' :
                            ticket.status === 'Closed' ? 'bg-slate-600' :
                            'bg-amber-600'
                          }`} />
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-top text-right">
                        <select
                          value={ticket.status}
                          disabled={updatingId === ticket._id}
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}