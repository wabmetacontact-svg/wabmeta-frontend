// ✅ CREATE: src/pages/LeadDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Trash2, Phone, Mail,
    MessageSquare, CheckSquare, Activity, Plus, Loader2, Send
} from 'lucide-react';
import { crm as crmApi } from '../services/api';
import type { Lead, LeadNote, LeadTask, LeadActivity } from '../types/crm';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'activity'>('notes');
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [tasks, setTasks] = useState<LeadTask[]>([]);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [newNote, setNewNote] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', dueDate: '' });
    const [showTaskForm, setShowTaskForm] = useState(false);

    useEffect(() => {
        if (id) loadLead();
    }, [id]);

    const loadLead = async () => {
        setLoading(true);
        try {
            const res = await crmApi.getLeadById(id!);
            if (res.data.success) {
                const data = res.data.data;
                setLead(data);
                setNotes(data.notes || []);
                setTasks(data.tasks || []);
                setActivities(data.activities || []);
            }
        } catch (err) {
            toast.error('Failed to load lead');
            navigate('/dashboard/crm/leads');
        } finally {
            setLoading(false);
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
        if (!lead || !confirm('Delete this lead?')) return;
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
    return <PageSkeleton />;
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
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stage & Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                        <label className="text-sm text-gray-500">Stage</label>
                        <select
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
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add Note */}
                            <div className="flex gap-2">
                                <textarea
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
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Task title..."
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 text-sm focus:outline-none"
                                    />
                                    <input
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
                                            className="px-4 py-2 text-gray-650 hover:bg-gray-150 border border-gray-200 rounded-lg text-sm transition-colors"
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
                </div>
            </div>
        </div>
    );
};

export default LeadDetail;