'use client';

import { useState, useEffect } from 'react';

interface Ticket {
    _id: string;
    ticketNumber: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
}

export default function StudentDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Temporary hardcoded studentId for demonstration (in production, this comes from secure session/cookie)
    const studentId = "65f1a2b3c4d5e6f7a8b9c0d1";

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'IT Support',
        priority: 'Medium',
    });

    // Fetch student tickets
    const fetchTickets = async () => {
        try {
            const res = await fetch(`/api/tickets?role=student&studentId=${studentId}`);
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

    useEffect(() => {
        fetchTickets();
    }, []);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, studentId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create ticket');
            }

            setSuccessMsg(`Ticket ${data.data.ticketNumber} created successfully!`);
            setFormData({ title: '', description: '', category: 'IT Support', priority: 'Medium' });
            fetchTickets(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Helpdesk Dashboard</h1>
                        <p className="text-sm text-gray-500">Submit requests and track your active support tickets.</p>
                    </div>
                    <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
                        Role: Student
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Create Ticket Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Ticket</h2>

                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                        {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg">{successMsg}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Portal login error"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-white"
                                >
                                    <option value="IT Support">IT Support</option>
                                    <option value="Exam & Results">Exam & Results</option>
                                    <option value="Fee & Accounts">Fee & Accounts</option>
                                    <option value="Hostel & Facilities">Hostel & Facilities</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-white"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your issue in detail..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Tickets History</h2>

                        {loading ? (
                            <p className="text-gray-500 text-sm">Loading tickets...</p>
                        ) : tickets.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tickets submitted yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500">
                                            <th className="py-3 px-2">Ticket #</th>
                                            <th className="py-3 px-2">Title</th>
                                            <th className="py-3 px-2">Category</th>
                                            <th className="py-3 px-2">Priority</th>
                                            <th className="py-3 px-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tickets.map((ticket) => (
                                            <tr key={ticket._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-2 font-medium text-blue-600">{ticket.ticketNumber}</td>
                                                <td className="py-3 px-2 text-gray-800">{ticket.title}</td>
                                                <td className="py-3 px-2 text-gray-600">{ticket.category}</td>
                                                <td className="py-3 px-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                                                            ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}