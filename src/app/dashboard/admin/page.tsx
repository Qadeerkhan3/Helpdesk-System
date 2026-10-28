'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
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
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'analytics'>('tickets');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      router.push('/login');
    } else if (role !== 'admin') {
      router.push(`/dashboard/${role}`);
    }
  }, [router]);

  const fetchAllTickets = async () => {
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

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/users/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    fetchAllTickets();
    fetchAgents();
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
        toast.success(`Status updated to ${newStatus}`);
        fetchAllTickets();
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

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
        toast.success('Agent assignment updated');
        fetchAllTickets();
      } else {
        toast.error(data.error || 'Failed to assign agent');
      }
    } catch (err) {
      console.error('Error assigning agent:', err);
      toast.error('Error assigning agent');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Ticket deleted successfully');
        fetchAllTickets();
      } else {
        toast.error(data.error || 'Failed to delete ticket');
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
      toast.error('Error deleting ticket');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const unassignedTickets = tickets.filter(t => !t.assignedAgent).length;

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col justify-between p-6 sticky top-0 h-screen shadow-xl">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 text-white font-bold px-3 py-2 rounded-xl flex items-center justify-center shadow-lg text-xs tracking-wider shrink-0">
              ADMIN
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-sm leading-tight truncate">University HQ</h1>
              <p className="text-xs text-purple-400 font-medium truncate">Control Center</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${activeTab === 'tickets'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span>🎫</span>
              <span>All Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${activeTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span>📊</span>
              <span>Analytics & Metrics</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="h-8 w-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
              AD
            </div>
            <div className="text-xs overflow-hidden">
              <p className="font-semibold text-white truncate">Administrator</p>
              <p className="text-slate-500 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">

        <header className="bg-white border-b border-slate-200 h-16 px-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-800">
            {activeTab === 'tickets' ? 'Support Management Center' : 'System Overview & Analytics'}
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-full border border-purple-100">
              Admin Mode
            </span>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalTickets}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Open</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{openTickets}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{inProgressTickets}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedTickets}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Unassigned</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{unassignedTickets}</p>
            </div>
          </div>

          {activeTab === 'analytics' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ticket Resolution Breakdown</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Visual representation of system workload.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700">Open Requests</span>
                      <span>{openTickets} ({totalTickets ? Math.round((openTickets / totalTickets) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-amber-500 h-3 rounded-full transition-all duration-500" style={{ width: `${totalTickets ? (openTickets / totalTickets) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-blue-700">In Progress</span>
                      <span>{inProgressTickets} ({totalTickets ? Math.round((inProgressTickets / totalTickets) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${totalTickets ? (inProgressTickets / totalTickets) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-700">Resolved</span>
                      <span>{resolvedTickets} ({totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${totalTickets ? (resolvedTickets / totalTickets) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Active Support Team</h3>
                  <p className="text-xs text-slate-500 mt-0.5">List of system agents registered for ticket assignments.</p>
                </div>

                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {agents.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No agents found in database.</p>
                  ) : (
                    agents.map((ag) => (
                      <div key={ag._id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700 shrink-0">
                            {ag.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{ag.name}</p>
                            <p className="text-[11px] text-slate-400">{ag.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-md uppercase">
                          {ag.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                  {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filterStatus === st
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search ticket or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading tickets database...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <p className="text-slate-400 text-xl">🔍</p>
                  <p className="text-slate-600 font-semibold text-sm">No tickets found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                        <th className="py-3 px-4 whitespace-nowrap">Ticket ID</th>
                        <th className="py-3 px-4 whitespace-nowrap">Subject & Details</th>
                        <th className="py-3 px-4 whitespace-nowrap">Category</th>
                        <th className="py-3 px-4 whitespace-nowrap">Priority</th>
                        <th className="py-3 px-4 whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap">Assigned Agent</th>
                        <th className="py-3 px-4 whitespace-nowrap">Update Status</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTickets.map((ticket) => {
                        const currentAgentId = typeof ticket.assignedAgent === 'object' && ticket.assignedAgent !== null
                          ? ticket.assignedAgent._id
                          : ticket.assignedAgent || '';

                        return (
                          <tr key={ticket._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-4 px-4 font-mono font-bold text-purple-600 align-top whitespace-nowrap">
                              #{ticket.ticketNumber || ticket._id.slice(-6)}
                            </td>
                            <td className="py-4 px-4 align-top max-w-xs">
                              <p className="font-bold text-slate-900">{ticket.title}</p>
                              <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{ticket.description}</p>
                            </td>
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium inline-block">
                                {ticket.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded font-bold inline-block ${ticket.priority === 'Urgent' ? 'bg-red-50 text-red-600 border border-red-200' :
                                  ticket.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                    'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                }`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                {ticket.status}
                              </span>
                            </td>

                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <select
                                value={currentAgentId}
                                disabled={updatingId === ticket._id}
                                onChange={(e) => handleAgentAssignment(ticket._id, e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="">-- Unassigned --</option>
                                {agents.map((ag) => (
                                  <option key={ag._id} value={ag._id}>
                                    {ag.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <select
                                value={ticket.status}
                                disabled={updatingId === ticket._id}
                                onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>

                            <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteTicket(ticket._id)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}