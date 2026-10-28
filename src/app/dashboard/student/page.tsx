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

export default function StudentDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const fetchStudentTickets = async () => {
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
    fetchStudentTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, priority }),
      });

      const data = await res.json();
      if (res.ok) {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        fetchStudentTickets();
        setActiveTab('dashboard'); // Switch back to dashboard after creation
        alert('Ticket created successfully!');
      } else {
        alert(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-6 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white font-bold h-10 w-10 rounded-xl flex items-center justify-center shadow-md">
              UH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">University Helpdesk</h1>
              <p className="text-xs text-indigo-600 font-medium">Student Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>📊</span>
              <span>My Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'create'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>➕</span>
              <span>Create Ticket</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header for Mobile & Desktop */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-3 md:hidden">
            <div className="bg-indigo-600 text-white font-bold h-8 w-8 rounded-lg flex items-center justify-center text-xs">
              UH
            </div>
            <span className="font-bold text-slate-800 text-sm">Student Portal</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Dashboard Overview' : 'Create New Ticket'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-100">
              Student Role
            </span>
            <button 
              onClick={handleLogout}
              className="md:hidden text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          
          {activeTab === 'create' ? (
            /* Create Ticket Form Section */
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill out the details below to submit a new query to the IT department.</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Portal Login Issue" 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Technical Support">Technical Support</option>
                      <option value="Fee & Accounts">Fee & Accounts</option>
                      <option value="Exam & Results">Exam & Results</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe your issue in detail..." 
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Tickets List Section */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Your Support History</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track and view the progress of all your submitted queries.</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
                  >
                    + New Ticket
                  </button>
                  <button 
                    onClick={fetchStudentTickets}
                    className="text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-xl transition shadow-sm"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-400 text-sm">Loading your tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <p className="text-slate-400 text-2xl">📭</p>
                  <p className="text-slate-700 font-semibold text-sm">No tickets submitted yet</p>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">Click the button below to create your first support request.</p>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="mt-2 text-xs font-semibold px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition"
                  >
                    Create Ticket Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.map((ticket) => (
                    <div key={ticket._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            #{ticket.ticketNumber || ticket._id.slice(-6)}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
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
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{ticket.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{ticket.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-medium">
                          {ticket.category}
                        </span>
                        <span className={`font-semibold ${
                          ticket.priority === 'Urgent' ? 'text-red-600' :
                          ticket.priority === 'High' ? 'text-amber-600' :
                          'text-slate-600'
                        }`}>
                          {ticket.priority} Priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}