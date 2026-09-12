// ✅ CREATE: src/pages/LeadDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Trash2, Phone, Mail,
    MessageSquare, CheckSquare, Activity, Plus, Loader2, Send,
    CreditCard, RefreshCw, Copy
} from 'lucide-react';
import { FaWhatsapp, FaTelegram, FaInstagram } from 'react-icons/fa';
import { crm as crmApi, payments as paymentsApi } from '../services/api';
import type { Lead, LeadNote, LeadTask, LeadActivity } from '../types/crm';
import toast from 'react-hot-toast';
import PageLoader from '../components/common/PageLoader';

/**
 * A lead's channel is derived from its free-text `source` (there is no channel
 * column). The conversation button opens whichever conversation the lead is
 * actually linked to, so it is labelled with that same channel rather than
 * offering three buttons that would all do the same thing.
 */
const CHANNEL_UI: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }>; cls: string }> = {
    instagram: { label: 'Instagram DM', Icon: FaInstagram, cls: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90' },
    telegram: { label: 'Telegram chat', Icon: FaTelegram, cls: 'bg-sky-500 hover:bg-sky-600' },
    whatsapp: { label: 'WhatsApp chat', Icon: FaWhatsapp, cls: 'bg-emerald-600 hover:bg-emerald-700' },
};

const channelOf = (lead: { source?: string; chatbotQualified?: boolean }) => {
    const src = (lead.source || '').toLowerCase();
    if (src.includes('instagram')) return 'instagram';
    if (src.includes('telegram')) return 'telegram';
    return 'whatsapp';
};

import { useConfirm } from '../context/ConfirmContext';
const LeadDetail: React.FC = () => {
    const confirm = useConfirm();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'activity' | 'payments'>('notes');
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [tasks, setTasks] = useState<LeadTask[]>([]);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', dueDate: '' });
    const [showTaskForm, setShowTaskForm] = useState(false);

    // Payment links (client ke apne Razorpay se)
    const [leadPayments, setLeadPayments] = useState<any[]>([]);
    const [payForm, setPayForm] = useState({ amount: '', description: '' });
    const [payBusy, setPayBusy] = useState(false);

    useEffect(() => {
        if (!id) return;
        // Guard against a slower earlier request resolving after a newer one and
        // rendering the previous lead.
        let cancelled = false;
        loadLead(() => cancelled);
        return () => {
            cancelled = true;
        };
      // Keyed on id with a cancellation guard; the loader is intentionally not a
    // dependency so it runs once per record, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

    const loadLead = async (isCancelled: () => boolean = () => false) => {
        setLoading(true);
        try {
            const res = await crmApi.getLeadById(id!);
            if (isCancelled()) return;
            if (res.data.success) {
                const data = res.data.data;
                setLead(data);
                setNotes(data.notes || []);
                setTasks(data.tasks || []);
                setActivities(data.activities || []);
            }
            // Payments alag se - Razorpay juda na ho to bhi lead khulna chahiye
            loadPayments();
        } catch (err) {
            if (isCancelled()) return;
            toast.error('Failed to load lead');
            navigate('/dashboard/crm/leads');
        } finally {
            if (!isCancelled()) setLoading(false);
        }
    };

    const loadPayments = async () => {
        if (!id) return;
        try {
            const res = await paymentsApi.listForLead(id);
            if (res.data.success) setLeadPayments(res.data.data || []);
        } catch {
            // Razorpay juda nahi / permission nahi - tab section khaali rahega
        }
    };

    const handleCreatePaymentLink = async () => {
        const amount = Number(payForm.amount);
        if (!Number.isFinite(amount) || amount < 1) {
            toast.error('Enter an amount in rupees');
            return;
        }
        setPayBusy(true);
        try {
            const res = await paymentsApi.createLink({
                amount,
                description: payForm.description.trim() || undefined,
                leadId: id!,
            });
            toast.success(res.data.data?.sent ? 'Payment link sent on WhatsApp' : 'Payment link created (not sent - 24h window closed?)');
            setPayForm({ amount: '', description: '' });
            loadPayments();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Could not create the payment link');
        } finally {
            setPayBusy(false);
        }
    };

    const handleRefreshPayment = async (paymentId: string) => {
        try {
            await paymentsApi.refresh(paymentId);
            await loadPayments();
            await loadLead();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Could not check the status');
        }
    };

    const handleResendPayment = async (paymentId: string) => {
        try {
            const res = await paymentsApi.resend(paymentId);
            toast.success(res.data.data?.sent ? 'Link sent again' : 'Could not send (24h window closed?)');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Could not send the link');
        }
    };

    const handleStageChange = async (stageId: string) => {
        if (!lead) return;
        try {
            await crmApi.updateLead(lead.id, { stageId });
            toast.success('Stage updated');
            loadLead();
        } catch (err) {
            toast.error('Failed to update stage');
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !lead) return;
        setAddingNote(true);
        try {
            await crmApi.addLeadNote(lead.id, newNote);
            setNewNote('');
            toast.success('Note added');
            loadLead();
        } catch (err) {
            toast.error('Failed to add note');
        } finally {
            setAddingNote(false);
        }
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim() || !lead) return;
        try {
            await crmApi.addLeadTask(lead.id, newTask);
            setNewTask({ title: '', dueDate: '' });
            setShowTaskForm(false);
            toast.success('Task added');
            loadLead();
        } catch (err) {
            toast.error('Failed to add task');
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await crmApi.completeTask(taskId);
            toast.success('Task completed');
            loadLead();
        } catch (err) {
            toast.error('Failed to complete task');
        }
    };

    const handleDelete = async () => {
        if (!lead) return;
        if (!(await confirm({
            title: 'Delete this lead?',
            message: 'This lead and its history will be permanently removed.',
            confirmLabel: 'Delete',
            tone: 'danger',
        }))) return;
        try {
            await crmApi.deleteLead(lead.id);
            toast.success('Lead deleted');
            navigate('/dashboard/crm/leads');
        } catch (err) {
            toast.error('Failed to delete lead');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
    return <PageLoader />;
  }

    if (!lead) {
        return <div>Lead not found</div>;
    }
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => navigate('/dashboard/crm/leads')}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{lead.title}</h1>
                            {lead.contact && (
                                <div className="flex items-center gap-4 mt-2 text-gray-500">
                                    <span className="flex items-center gap-1 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {lead.contact.phone}
                                    </span>
                                    {lead.contact.email && (
                                        <span className="flex items-center gap-1 text-sm">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {lead.contact.email}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {(() => {
                            const ch = CHANNEL_UI[channelOf(lead)];
                            return lead.conversationId ? (
                                <button
                                    onClick={() => navigate(`/dashboard/inbox/${lead.conversationId}`)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-full text-xs font-bold shadow-md transition-all ${ch.cls}`}
                                >
                                    <ch.Icon className="w-4 h-4" /> Open {ch.label}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/dashboard/inbox')}
                                    title="This lead has no linked conversation yet"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full text-xs font-bold shadow-sm transition-all"
                                >
                                    <ch.Icon className="w-4 h-4" /> Find in inbox
                                </button>
                            );
                        })()}
                        <button
                            onClick={handleDelete}
                            aria-label="Delete lead"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stage & Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                        <label htmlFor="leaddetail-stage" className="text-sm text-gray-500">Stage</label>
                        <select id="leaddetail-stage"
                            value={lead.stageId || ''}
                            onChange={(e) => handleStageChange(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none"
                            style={{ color: lead.stage?.color }}
                        >
                            {lead.pipeline?.stages.map((stage) => (
                                <option key={stage.id} value={stage.id}>{stage.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Value</label>
                        <p className="mt-1 text-lg font-bold text-green-700">
                            {lead.value ? formatCurrency(Number(lead.value)) : '-'}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Priority</label>
                        <p className="mt-1 font-semibold text-gray-900">{lead.priority}</p>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Expected Close</label>
                        <p className="mt-1 font-semibold text-gray-900">
                            {lead.expectedCloseDate
                                ? new Date(lead.expectedCloseDate).toLocaleDateString()
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'notes'
                                ? 'border-b-2 border-green-500 text-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Notes ({notes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'tasks'
                                ? 'border-b-2 border-green-500 text-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'activity'
                                ? 'border-b-2 border-green-500 text-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Activity ({activities.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all ${activeTab === 'payments'
                                ? 'border-b-2 border-green-500 text-green-600 bg-white'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Payments ({leadPayments.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add Note */}
                            <div className="flex gap-2">
                                <textarea aria-label="Add a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg resize-none text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    rows={2}
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={addingNote || !newNote.trim()}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 self-end transition-colors shadow-sm"
                                >
                                    {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <div key={note.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p className="text-gray-800 whitespace-pre-wrap text-sm">{note.content}</p>
                                        <p className="text-xs text-gray-500 mt-2 font-mono">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {notes.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No notes yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {/* Add Task */}
                            {showTaskForm ? (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                                    <input aria-label="Task title..."
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Task title..."
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 text-sm focus:outline-none"
                                    />
                                    <input aria-label="Task due date"
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 text-sm focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddTask}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Add Task
                                        </button>
                                        <button
                                            onClick={() => setShowTaskForm(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowTaskForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                </button>
                            )}

                            {/* Tasks List */}
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${task.isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <button
                                            onClick={() => !task.isCompleted && handleCompleteTask(task.id)}
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'bg-white border-gray-300 hover:border-green-500'
                                                }`}
                                        >
                                            {task.isCompleted && '✓'}
                                        </button>
                                        <div className="flex-1">
                                            <p className={`text-sm ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 font-medium'}`}>
                                                {task.title}
                                            </p>
                                            {task.dueDate && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">No tasks yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50/50 rounded-lg transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                        <Activity className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-semibold text-sm">{activity.title}</p>
                                        {activity.description && (
                                            <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1 font-mono">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No activity yet</p>
                            )}
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            {/* Naya payment link */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        aria-label="Payment amount in rupees"
                                        type="number"
                                        min={1}
                                        value={payForm.amount}
                                        onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                        placeholder="Amount ₹"
                                        className="w-full sm:w-40 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        aria-label="Payment description"
                                        type="text"
                                        value={payForm.description}
                                        onChange={(e) => setPayForm({ ...payForm, description: e.target.value })}
                                        placeholder="What is this payment for?"
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                        onClick={handleCreatePaymentLink}
                                        disabled={payBusy}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                                    >
                                        {payBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send payment link
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Sent from your own Razorpay account on WhatsApp. When it is paid, this lead moves to Won.
                                </p>
                            </div>

                            {/* Bheje gaye links */}
                            {leadPayments.map((p) => {
                                const tone =
                                    p.status === 'PAID' ? 'bg-green-100 text-green-700'
                                        : p.status === 'PENDING' ? 'bg-amber-100 text-amber-700'
                                            : p.status === 'FAILED' ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-600';
                                return (
                                    <div key={p.id} className="flex items-start justify-between gap-3 p-4 border border-gray-200 rounded-xl">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900">
                                                ₹{new Intl.NumberFormat('en-IN').format(Number(p.amountPaise) / 100)}
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${tone}`}>{p.status}</span>
                                            </p>
                                            {p.description && <p className="text-sm text-gray-600 mt-0.5">{p.description}</p>}
                                            <p className="text-xs text-gray-400 mt-1 font-mono break-all">{p.shortUrl}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(p.createdAt).toLocaleString()} · via {p.createdVia.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(p.shortUrl).then(
                                                    () => toast.success('Link copied'),
                                                    () => toast.error('Could not copy')
                                                )}
                                                title="Copy link"
                                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            {p.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleRefreshPayment(p.id)}
                                                        title="Check status with Razorpay"
                                                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResendPayment(p.id)}
                                                        title="Send again on WhatsApp"
                                                        className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {leadPayments.length === 0 && (
                                <p className="text-center text-gray-500 py-8">
                                    No payment links yet. Connect Razorpay in Settings → Payments to send one.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;