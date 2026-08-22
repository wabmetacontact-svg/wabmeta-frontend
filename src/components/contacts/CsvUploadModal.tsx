// src/components/contacts/CsvUploadModal.tsx - FINAL WITH BATCHING

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
    X, FileSpreadsheet, Upload, Download, CheckCircle,
    Loader2, Phone, Plus, FolderPlus, XCircle,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { toCanonicalPhone, extractCountryCode } from '../../utils/csvContacts';

import { useModalA11y } from '../../hooks/useModalA11y';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groups?: Array<{ id: string; name: string }>;
}

interface ValidatedContact {
    phone: string;
    countryCode: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    originalPhone: string;
}

interface ValidationError {
    row: number;
    phone: string;
    reason: string;
}

// ✅ Batch config
const BATCH_SIZE = 200;      // 200 contacts per batch
const BATCH_TIMEOUT = 60000; // 60 seconds per batch
const BATCH_DELAY = 300;     // 300ms between batches

export default function CsvUploadModal({ isOpen, onClose, onSuccess, groups = [] }: Props) {
    const panelRef = useModalA11y(isOpen, onClose);
    const [file, setFile] = useState<File | null>(null);
    const [validContacts, setValidContacts] = useState<ValidatedContact[]>([]);
    const [invalidContacts, setInvalidContacts] = useState<ValidationError[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showInvalidList, setShowInvalidList] = useState(false);

    // Progress state
    const [uploadProgress, setUploadProgress] = useState({
        current: 0,
        total: 0,
        batchesDone: 0,
        totalBatches: 0,
    });

    // Create Group
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [localGroups, setLocalGroups] = useState(groups);

    useEffect(() => {
        setLocalGroups(groups);
    }, [groups]);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.replace(/^\uFEFF/, '').trim().toLowerCase(),
            complete: (results) => {
                const rows = results.data || [];
                const valid: ValidatedContact[] = [];
                const invalid: ValidationError[] = [];
                const seenPhones = new Set<string>();

                rows.forEach((row: any, idx: number) => {
                    const rowNum = idx + 2;
                    const rawPhone = String(
                        row.phone || row.phonenumber || row.mobile ||
                        row.number || row['phone number'] || row.contact ||
                        row.whatsapp || row.mob || ''
                    ).trim();

                    if (!rawPhone) {
                        invalid.push({ row: rowNum, phone: '(empty)', reason: 'Phone missing' });
                        return;
                    }

                    const canonical = toCanonicalPhone(rawPhone);
                    if (!canonical) {
                        invalid.push({
                            row: rowNum, phone: rawPhone,
                            reason: 'Invalid format',
                        });
                        return;
                    }

                    if (seenPhones.has(canonical)) {
                        invalid.push({ row: rowNum, phone: rawPhone, reason: 'Duplicate in CSV' });
                        return;
                    }
                    seenPhones.add(canonical);

                    valid.push({
                        phone: canonical,
                        countryCode: extractCountryCode(canonical),
                        firstName: String(row.firstname || row['first name'] || row.name || row.fullname || '').trim() || undefined,
                        lastName: String(row.lastname || row['last name'] || row.surname || '').trim() || undefined,
                        email: String(row.email || row.mail || '').trim() || undefined,
                        originalPhone: rawPhone,
                    });
                });

                setValidContacts(valid);
                setInvalidContacts(invalid);

                if (valid.length === 0) {
                    toast.error(`All ${invalid.length} numbers are invalid!`);
                } else if (invalid.length > 0) {
                    toast.success(`${valid.length} valid, ${invalid.length} invalid`);
                } else {
                    toast.success(`${valid.length} contacts ready`);
                }
            },
            error: (error) => toast.error(`Parse failed: ${error.message}`)
        });
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error('Enter group name');
            return;
        }

        setCreatingGroup(true);
        try {
            const response = await api.post('/contacts/groups', { name: newGroupName.trim() });
            const newGroup = response.data.data;
            setLocalGroups(prev => [...prev, newGroup]);
            setSelectedGroup(newGroup.id);
            setNewGroupName('');
            setShowCreateGroup(false);
            toast.success(`Group "${newGroupName}" created`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        } finally {
            setCreatingGroup(false);
        }
    };

    // ✅ BATCH UPLOAD
    const handleSubmit = async () => {
        if (validContacts.length === 0) {
            toast.error('No valid contacts to upload');
            return;
        }

        setLoading(true);
        setResult(null);

        const totalBatches = Math.ceil(validContacts.length / BATCH_SIZE);
        setUploadProgress({
            current: 0,
            total: validContacts.length,
            batchesDone: 0,
            totalBatches,
        });

        const totals = {
            created: 0,
            updated: 0,
            restored: 0,
            skipped: 0,
            errors: [] as string[],
        };

        // Progress toast
        const progressToast = toast.loading(
            `Uploading batch 1 of ${totalBatches}...`,
            { duration: Infinity }
        );

        try {
            for (let i = 0; i < totalBatches; i++) {
                const start = i * BATCH_SIZE;
                const end = Math.min(start + BATCH_SIZE, validContacts.length);
                const batch = validContacts.slice(start, end);

                // Update progress
                toast.loading(
                    `Uploading batch ${i + 1}/${totalBatches} (${batch.length} contacts)...`,
                    { id: progressToast }
                );

                setUploadProgress({
                    current: start + batch.length,
                    total: validContacts.length,
                    batchesDone: i,
                    totalBatches,
                });

                const payload = {
                    contacts: batch.map(c => ({
                        phone: c.phone,
                        countryCode: c.countryCode,
                        firstName: c.firstName,
                        lastName: c.lastName,
                        email: c.email,
                    })),
                    groupId: selectedGroup || undefined,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                };

                try {
                    console.log(`📤 Batch ${i + 1}/${totalBatches}:`, batch.length);

                    const response = await api.post('/contacts/csv-upload', payload, {
                        timeout: BATCH_TIMEOUT,
                    });

                    const data = response.data?.data || {};
                    totals.created += data.created || 0;
                    totals.updated += data.updated || 0;
                    totals.restored += data.restored || 0;
                    totals.skipped += data.skipped || 0;

                    console.log(`✅ Batch ${i + 1} done:`, data);

                } catch (batchError: any) {
                    console.error(`❌ Batch ${i + 1} failed:`, batchError);
                    const msg = batchError.code === 'ECONNABORTED'
                        ? 'Timeout'
                        : batchError.response?.data?.message || batchError.message;
                    totals.errors.push(`Batch ${i + 1}: ${msg}`);
                }

                // Delay between batches (except last)
                if (i < totalBatches - 1) {
                    await new Promise(r => setTimeout(r, BATCH_DELAY));
                }
            }

            // Update final progress
            setUploadProgress(prev => ({
                ...prev,
                current: validContacts.length,
                batchesDone: totalBatches,
            }));

            toast.dismiss(progressToast);

            setResult({
                created: totals.created,
                updated: totals.updated,
                restored: totals.restored,
                skipped: totals.skipped,
                invalidFromCsv: invalidContacts.length,
                errors: totals.errors,
            });

            const totalSuccess = totals.created + totals.updated + totals.restored;

            if (totals.errors.length === 0) {
                toast.success(`✅ ${totalSuccess} contacts imported successfully!`, { duration: 5000 });
            } else if (totalSuccess > 0) {
                toast.success(`⚠️ ${totalSuccess} imported, ${totals.errors.length} batches failed`, { duration: 5000 });
            } else {
                toast.error(`❌ Import failed for all batches`, { duration: 5000 });
            }

            if (totalSuccess > 0) {
                onSuccess();
            }

        } catch (error: any) {
            toast.dismiss(progressToast);
            console.error('❌ Upload error:', error);
            toast.error(error.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setValidContacts([]);
        setInvalidContacts([]);
        setResult(null);
        setShowCreateGroup(false);
        setNewGroupName('');
        setShowInvalidList(false);
        setUploadProgress({ current: 0, total: 0, batchesDone: 0, totalBatches: 0 });
        onClose();
    };

    const downloadTemplate = () => {
        const template =
            'phone,firstName,lastName,email\n' +
            '+919876543210,John,Doe,john@example.com\n' +
            '+14155551234,Jane,Smith,jane@example.com\n' +
            '9876543211,Priya,Sharma,priya@example.com';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadInvalidList = () => {
        if (invalidContacts.length === 0) return;
        const csv = 'row,phone,reason\n' + invalidContacts
            .map(i => `${i.row},"${i.phone}","${i.reason}"`)
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invalid_contacts.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Progress bar %
    const progressPercent = uploadProgress.total > 0
        ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : handleClose} />

            <div ref={panelRef}
                className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Import CSV</h2>
                            <p className="text-sm text-gray-500">Upload contacts from CSV</p>
                        </div>
                    </div>
                    <button onClick={handleClose} disabled={loading}
                        className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">

                    {/* Notice */}
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <Phone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-purple-800">Phone Formats</p>
                            <p className="text-purple-600 mt-1">
                                India: <code className="bg-white px-1 rounded">9876543210</code> or <code className="bg-white px-1 rounded">+919876543210</code>{' '}•{' '}
                                USA: <code className="bg-white px-1 rounded">+14155551234</code>{' '}•{' '}
                                UK: <code className="bg-white px-1 rounded">+447911123456</code>
                            </p>
                        </div>
                    </div>

                    {/* Template */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900">Need a template?</p>
                            <p className="text-sm text-gray-500">Download sample CSV</p>
                        </div>
                        <button onClick={downloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50">
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CSV File <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300 hover:border-purple-400'}`}
                            onClick={() => document.getElementById('csv-input')?.click()}
                        >
                            <input aria-label="Choose a CSV file" id="csv-input" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                            {file ? (
                                <div>
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="font-semibold text-green-700">{file.name}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {validContacts.length + invalidContacts.length} rows parsed
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="font-medium text-gray-700">Click to upload CSV</p>
                                    <p className="text-sm text-gray-500 mt-1">Max 10,000 rows</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {(validContacts.length > 0 || invalidContacts.length > 0) && !result && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-2xl font-bold text-green-700">{validContacts.length}</p>
                                </div>
                                <p className="text-sm text-green-600">Valid</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <p className="text-2xl font-bold text-red-700">{invalidContacts.length}</p>
                                </div>
                                <p className="text-sm text-red-600">Invalid</p>
                                {invalidContacts.length > 0 && (
                                    <button onClick={() => setShowInvalidList(!showInvalidList)}
                                        className="text-xs text-red-700 underline mt-1 font-medium">
                                        {showInvalidList ? 'Hide' : 'View'} details
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invalid list */}
                    {showInvalidList && invalidContacts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-red-800 text-sm">
                                    Invalid Numbers ({invalidContacts.length})
                                </h3>
                                <button onClick={downloadInvalidList}
                                    className="text-xs text-red-700 underline font-medium flex items-center gap-1">
                                    <Download className="w-3 h-3" /> Download
                                </button>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {invalidContacts.slice(0, 50).map((item, i) => (
                                    <div key={i} className="text-xs font-mono text-red-700 flex justify-between py-1 border-b border-red-100">
                                        <span>Row {item.row}: {item.phone}</span>
                                        <span>{item.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ✅ PROGRESS BAR (during upload) */}
                    {loading && uploadProgress.total > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex justify-between text-sm font-medium text-blue-900 mb-2">
                                <span>
                                    Uploading batch {uploadProgress.batchesDone + 1} of {uploadProgress.totalBatches}
                                </span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                {uploadProgress.current} of {uploadProgress.total} contacts processed
                            </p>
                        </div>
                    )}

                    {/* Preview */}
                    {validContacts.length > 0 && !loading && !result && (
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Preview (first 5):</p>
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Phone</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {validContacts.slice(0, 5).map((c, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 font-mono text-gray-900">{c.phone}</td>
                                                <td className="px-3 py-2 text-gray-900">
                                                    {[c.firstName, c.lastName].filter(Boolean).join(' ') || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">{c.email || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Group */}
                    {validContacts.length > 0 && !loading && !result && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Add to Group (Optional)
                            </label>
                            {!showCreateGroup ? (
                                <div className="flex gap-2">
                                    <select aria-label="Add to group optional" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
                                        className="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500">
                                        <option value="">No group</option>
                                        {localGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setShowCreateGroup(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-100">
                                        <FolderPlus className="w-4 h-4" />
                                        <span className="hidden sm:inline">New</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input aria-label="Group name..." type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Group name..." autoFocus
                                        className="flex-1 px-4 py-2.5 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreateGroup();
                                            if (e.key === 'Escape') setShowCreateGroup(false);
                                        }} />
                                    <button type="button" onClick={handleCreateGroup}
                                        disabled={creatingGroup || !newGroupName.trim()}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50">
                                        {creatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create
                                    </button>
                                    <button type="button" onClick={() => { setShowCreateGroup(false); setNewGroupName(''); }}
                                        className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    {validContacts.length > 0 && !loading && !result && (
                        <div>
                            <label htmlFor="csvuploadmodal-tags-optional" className="block text-sm font-semibold text-gray-700 mb-2">
                                Tags (Optional)
                            </label>
                            <input id="csvuploadmodal-tags-optional" type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., csv-import, leads"
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500" />
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <span className="font-bold text-green-800 text-lg">Upload Complete!</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{result.created || 0}</p>
                                    <p className="text-xs text-gray-500">Created</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{result.updated || 0}</p>
                                    <p className="text-xs text-gray-500">Updated</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{result.skipped || 0}</p>
                                    <p className="text-xs text-gray-500">Skipped</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{result.invalidFromCsv || 0}</p>
                                    <p className="text-xs text-gray-500">Invalid</p>
                                </div>
                            </div>

                            {result.restored > 0 && (
                                <div className="mt-3 text-sm text-green-700 text-center">
                                    ♻️ {result.restored} deleted contacts restored
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm font-semibold text-red-800 mb-2">
                                        Failed Batches ({result.errors.length}):
                                    </p>
                                    <div className="text-xs text-red-700 space-y-1 max-h-24 overflow-y-auto">
                                        {result.errors.map((err: string, i: number) => (
                                            <div key={i}>• {err}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
                    <button onClick={handleClose} disabled={loading}
                        className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium disabled:opacity-50">
                        {result ? 'Close' : 'Cancel'}
                    </button>
                    {!result && (
                        <button onClick={handleSubmit}
                            disabled={loading || validContacts.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-semibold">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading... ({progressPercent}%)
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Import {validContacts.length > 0 ? `(${validContacts.length})` : ''}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}