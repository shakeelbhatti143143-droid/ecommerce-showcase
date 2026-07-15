import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { safeFetch, safeDelete } from '../../services/supabase'
import {
    getAllMergedContacts,
    getAllMergedNewsletters,
    deleteLocalContact,
    deleteLocalNewsletter,
    markLocalContactRead
} from '../../services/localStore'
function StatCard({ icon, label, value, color }) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: color + '20', color }}>
                {icon}
            </div>
            <div className="admin-stat-info">
                <span className="admin-stat-label">{label}</span>
                <span className="admin-stat-value">{value}</span>
            </div>
        </div>
    )
}

function Toast({ msg, type, show }) {
    return (
        <div className={`admin-toast ${type} ${show ? 'show' : ''}`}>
            <span>{type === 'success' ? '✅' : '❌'}</span>
            <span>{msg}</span>
        </div>
    )
}

function ApproveModal({ show, contact, onClose, onApprove }) {
    const [sending, setSending] = useState(false)
    const [adminEmail, setAdminEmail] = useState('shakeelbhatti143143@gmail.com')
    const [subject, setSubject] = useState('Your Message Has Been Approved ✅')
    const [replyBody, setReplyBody] = useState('Dear Customer,\n\nThank you for reaching out to us. We are pleased to inform you that your message has been reviewed and approved by our team.\n\nWe appreciate your inquiry and will get back to you shortly with a detailed response.\n\nBest regards,\nShakeel\nFrosted Tech Team')

    if (!show || !contact) return null

    const handleApprove = () => {
        setSending(true)
        // Simulate sending email
        setTimeout(() => {
            onApprove(contact, { to: contact.email, from: adminEmail, subject, body: replyBody })
            setSending(false)
        }, 1500)
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>✅ Approve Message</h3>
                    <button className="admin-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="admin-modal-body">
                    <div className="admin-modal-field">
                        <label>From (Admin Email)</label>
                        <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="form-input" />
                    </div>
                    <div className="admin-modal-field">
                        <label>To (Customer Email)</label>
                        <input type="email" value={contact.email || ''} className="form-input" disabled />
                    </div>
                    <div className="admin-modal-field">
                        <label>Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="form-input" />
                    </div>
                    <div className="admin-modal-field">
                        <label>Message Body</label>
                        <textarea
                            className="form-textarea"
                            rows={6}
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                        />
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <button className="admin-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleApprove} disabled={sending} style={{ opacity: sending ? 0.7 : 1 }}>
                        {sending ? '⏳ Sending...' : '📧 Approve & Send Email'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [adminName, setAdminName] = useState('')
    const [contacts, setContacts] = useState([])
    const [newsletters, setNewsletters] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
    const [contactFilter, setContactFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [approvalContact, setApprovalContact] = useState(null)
    const [approvedIds, setApprovedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('shopsphere_approved') || '[]')
        } catch { return [] }
    })

    const showToast = useCallback((msg, type = 'success') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
    }, [])

    const [newEntryNotification, setNewEntryNotification] = useState(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [contactsRes, newslettersRes] = await Promise.all([
                safeFetch('contact_messages', { orderBy: 'created_at', ascending: false }),
                safeFetch('newsletter', { orderBy: 'created_at', ascending: false })
            ])
            // Merge local + Supabase data
            const mergedContacts = getAllMergedContacts(contactsRes.data || [])
            const mergedNewsletters = getAllMergedNewsletters(newslettersRes.data || [])
            setContacts(mergedContacts)
            setNewsletters(mergedNewsletters)
        } catch (err) {
            console.error('Error fetching admin data:', err)
            showToast('Failed to load data from database.', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        const auth = localStorage.getItem('admin-auth')
        if (!auth) {
            navigate('/admin')
            return
        }
        try {
            const parsed = JSON.parse(auth)
            setAdminName(parsed.name || 'Admin')
        } catch {
            navigate('/admin')
        }
        fetchData()
    }, [navigate, fetchData])

    // Listen for real-time data updates from form submissions
    useEffect(() => {
        const handleDataUpdate = (e) => {
            const { type, entry } = e.detail
            if (type === 'contact' && entry) {
                setContacts(prev => [entry, ...prev])
                setNewEntryNotification({
                    message: `📬 New message from ${entry.name}`,
                    time: Date.now()
                })
            } else if (type === 'newsletter' && entry) {
                setNewsletters(prev => [entry, ...prev])
                setNewEntryNotification({
                    message: `📧 New subscriber: ${entry.email}`,
                    time: Date.now()
                })
            }
        }

        window.addEventListener('shopsphere-data-update', handleDataUpdate)
        return () => window.removeEventListener('shopsphere-data-update', handleDataUpdate)
    }, [])

    // Auto-dismiss notification
    useEffect(() => {
        if (!newEntryNotification) return
        const timer = setTimeout(() => setNewEntryNotification(null), 5000)
        return () => clearTimeout(timer)
    }, [newEntryNotification])

    useEffect(() => {
        // Refresh data every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    // Auto-mark messages as read when admin visits messages tab
    useEffect(() => {
        if (activeTab === 'messages') {
            const unreadIds = contacts.filter(c => !c.read).map(c => c.id)
            if (unreadIds.length === 0) return

            // Mark local entries as read
            unreadIds.forEach(id => {
                if (typeof id === 'string' && id.startsWith('local_')) {
                    markLocalContactRead(id)
                }
            })

            // Update state to mark all as read
            setContacts(prev => prev.map(c => unreadIds.includes(c.id) ? { ...c, read: true } : c))
        }
    }, [activeTab, contacts])

    const handleLogout = () => {
        localStorage.removeItem('admin-auth')
        navigate('/admin')
    }

    const handleDeleteContact = async (id) => {
        setDeleting(id)
        try {
            if (typeof id === 'string' && id.startsWith('local_')) {
                deleteLocalContact(id)
                setContacts(prev => prev.filter(c => c.id !== id))
            } else {
                const { error } = await safeDelete('contact_messages', 'id', id)
                if (error) throw error
                setContacts(prev => prev.filter(c => c.id !== id))
            }
            showToast('Message deleted successfully.', 'success')
        } catch (err) {
            console.error('Delete error:', err)
            showToast('Failed to delete message.', 'error')
        } finally {
            setDeleting(null)
        }
    }

    const handleDeleteNewsletter = async (id) => {
        setDeleting(id)
        try {
            if (typeof id === 'string' && id.startsWith('local_')) {
                deleteLocalNewsletter(id)
                setNewsletters(prev => prev.filter(n => n.id !== id))
            } else {
                const { error } = await safeDelete('newsletter', 'id', id)
                if (error) throw error
                setNewsletters(prev => prev.filter(n => n.id !== id))
            }
            showToast('Subscription removed successfully.', 'success')
        } catch (err) {
            console.error('Delete error:', err)
            showToast('Failed to remove subscription.', 'error')
        } finally {
            setDeleting(null)
        }
    }

    const handleApprove = (contact, emailData) => {
        // Save approved ID
        const newApproved = [...approvedIds, contact.id]
        setApprovedIds(newApproved)
        localStorage.setItem('shopsphere_approved', JSON.stringify(newApproved))
        setApprovalContact(null)

        showToast(`✅ Approved! Email sent to ${contact.name} from ${emailData.from}`, 'success')

        // Log the email that would be sent
        console.log('📧 APPROVAL EMAIL SENT', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            body: emailData.body
        })
    }

    const filteredContacts = contacts.filter(c => {
        if (contactFilter === 'read') return c.read
        if (contactFilter === 'unread') return !c.read
        if (contactFilter === 'approved') return approvedIds.includes(c.id)
        if (contactFilter === 'pending') return !approvedIds.includes(c.id)
        return true
    }).filter(c => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            (c.name || '').toLowerCase().includes(term) ||
            (c.email || '').toLowerCase().includes(term) ||
            (c.subject || '').toLowerCase().includes(term) ||
            (c.message || '').toLowerCase().includes(term)
        )
    })

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A'
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        } catch {
            return dateStr
        }
    }

    const renderDashboard = () => (
        <div className="admin-dashboard-grid">
            <StatCard icon="📬" label="Total Messages" value={contacts.length} color="#7c3aed" />
            <StatCard icon="📧" label="Newsletter Subs" value={newsletters.length} color="#6366f1" />
            <StatCard icon="📩" label="Unread Messages" value={contacts.filter(c => !c.read).length} color="#f59e0b" />
            <StatCard icon="✅" label="Approved Messages" value={approvedIds.length} color="#10b981" />
            <StatCard icon="👥" label="Unique Emails" value={new Set([...contacts.map(c => c.email), ...newsletters.map(n => n.email)]).size} color="#10b981" />

            <div className="admin-recent-section">
                <h3>Recent Contact Messages</h3>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="admin-empty">No messages yet.</td>
                                </tr>
                            ) : contacts.slice(0, 5).map(c => (
                                <tr key={c.id} className={!c.read ? 'admin-unread' : ''}>
                                    <td>{c.name || 'N/A'}</td>
                                    <td>{c.email}</td>
                                    <td>{c.subject || 'N/A'}</td>
                                    <td>{formatDate(c.created_at)}</td>
                                    <td>
                                        <span className={`admin-badge ${c.read ? 'read' : 'unread'}`}>
                                            {c.read ? 'Read' : 'New'}
                                        </span>
                                        {approvedIds.includes(c.id) && <span className="admin-badge approved">Approved</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-recent-section">
                <h3>Recent Newsletter Subscribers</h3>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Subscribed On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newsletters.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="admin-empty">No subscribers yet.</td>
                                </tr>
                            ) : newsletters.slice(0, 5).map(n => (
                                <tr key={n.id}>
                                    <td>{n.email}</td>
                                    <td>{formatDate(n.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-sql-section">
                <h3>📊 Database Overview</h3>
                <div className="admin-sql-cards">
                    <div className="admin-sql-card">
                        <h4>contact_messages</h4>
                        <p>Columns: id, name, email, subject, message, read, created_at</p>
                        <span className="admin-sql-count">{contacts.length} records</span>
                    </div>
                    <div className="admin-sql-card">
                        <h4>newsletter</h4>
                        <p>Columns: id, email, created_at</p>
                        <span className="admin-sql-count">{newsletters.length} records</span>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderMessages = () => (
        <div className="admin-messages-section">
            <div className="admin-section-header">
                <h3>Contact Messages ({filteredContacts.length})</h3>
                <div className="admin-filter-bar">
                    <select
                        value={contactFilter}
                        onChange={(e) => setContactFilter(e.target.value)}
                        className="admin-filter-select"
                    >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </div>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="admin-empty">
                                    {contacts.length === 0 ? 'No messages in database.' : 'No messages match your filter.'}
                                </td>
                            </tr>
                        ) : filteredContacts.map((c, idx) => (
                            <tr key={c.id} className={!c.read ? 'admin-unread' : ''}>
                                <td>{idx + 1}</td>
                                <td><strong>{c.name || 'N/A'}</strong></td>
                                <td><a href={`mailto:${c.email}`} className="admin-email-link">{c.email}</a></td>
                                <td><span className="admin-subject-tag">{c.subject || 'N/A'}</span></td>
                                <td className="admin-message-cell">
                                    <div className="admin-message-preview">{c.message || 'N/A'}</div>
                                </td>
                                <td className="admin-date-cell">{formatDate(c.created_at)}</td>
                                <td>
                                    <div className="admin-status-group">
                                        <span className={`admin-badge ${c.read ? 'read' : 'unread'}`}>
                                            {c.read ? 'Read' : 'New'}
                                        </span>
                                        {approvedIds.includes(c.id) && (
                                            <span className="admin-badge approved">Approved ✅</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="admin-action-group">
                                        {!approvedIds.includes(c.id) && (
                                            <button
                                                className="admin-btn-approve"
                                                onClick={() => setApprovalContact(c)}
                                                title="Approve & send email"
                                            >
                                                ✅
                                            </button>
                                        )}
                                        <button
                                            className="admin-btn-delete"
                                            onClick={() => handleDeleteContact(c.id)}
                                            disabled={deleting === c.id}
                                            title="Delete message"
                                        >
                                            {deleting === c.id ? '⏳' : '🗑️'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderNewsletters = () => (
        <div className="admin-messages-section">
            <div className="admin-section-header">
                <h3>Newsletter Subscribers ({newsletters.length})</h3>
            </div>
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Email</th>
                            <th>Subscribed On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsletters.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="admin-empty">No subscribers yet.</td>
                            </tr>
                        ) : newsletters.map((n, idx) => (
                            <tr key={n.id}>
                                <td>{idx + 1}</td>
                                <td><a href={`mailto:${n.email}`} className="admin-email-link">{n.email}</a></td>
                                <td>{formatDate(n.created_at)}</td>
                                <td>
                                    <button
                                        className="admin-btn-delete"
                                        onClick={() => handleDeleteNewsletter(n.id)}
                                        disabled={deleting === n.id}
                                        title="Remove subscriber"
                                    >
                                        {deleting === n.id ? '⏳' : '🗑️'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderDatabase = () => (
        <div className="admin-database-section">
            <div className="admin-section-header">
                <h3>🗄️ Database Schema & Access</h3>
            </div>

            <div className="admin-sql-explorer">
                <div className="admin-sql-table-detail">
                    <h4>Table: contact_messages</h4>
                    <div className="admin-table-wrapper">
                        <table className="admin-table admin-schema-table">
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>id</td><td><code>int8</code></td><td>Primary key (auto-increment)</td></tr>
                                <tr><td>created_at</td><td><code>timestamptz</code></td><td>Auto-set timestamp</td></tr>
                                <tr><td>name</td><td><code>text</code></td><td>Sender's full name</td></tr>
                                <tr><td>email</td><td><code>text</code></td><td>Sender's email address</td></tr>
                                <tr><td>subject</td><td><code>text</code></td><td>Message subject</td></tr>
                                <tr><td>message</td><td><code>text</code></td><td>Message body content</td></tr>
                                <tr><td>read</td><td><code>bool</code></td><td>Read status (default: false)</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="admin-sql-code">
                        <strong>SQL CREATE TABLE:</strong>
                        <pre>{`CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);`}</pre>
                    </div>
                </div>

                <div className="admin-sql-table-detail" style={{ marginTop: '2rem' }}>
                    <h4>Table: newsletter</h4>
                    <div className="admin-table-wrapper">
                        <table className="admin-table admin-schema-table">
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>id</td><td><code>int8</code></td><td>Primary key (auto-increment)</td></tr>
                                <tr><td>created_at</td><td><code>timestamptz</code></td><td>Auto-set timestamp</td></tr>
                                <tr><td>email</td><td><code>text</code></td><td>Subscriber's email (unique)</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="admin-sql-code">
                        <strong>SQL CREATE TABLE:</strong>
                        <pre>{`CREATE TABLE newsletter (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL UNIQUE
);`}</pre>
                    </div>
                </div>

                <div className="admin-sql-query">
                    <h4>🔍 Sample Queries</h4>
                    <div className="admin-sql-query-item">
                        <strong>All contact messages (newest first):</strong>
                        <pre>SELECT * FROM contact_messages ORDER BY created_at DESC;</pre>
                    </div>
                    <div className="admin-sql-query-item">
                        <strong>Unread messages count:</strong>
                        <pre>SELECT COUNT(*) FROM contact_messages WHERE read = false;</pre>
                    </div>
                    <div className="admin-sql-query-item">
                        <strong>All newsletter subscribers:</strong>
                        <pre>SELECT * FROM newsletter ORDER BY created_at DESC;</pre>
                    </div>
                    <div className="admin-sql-query-item">
                        <strong>Find messages by email:</strong>
                        <pre>SELECT * FROM contact_messages WHERE email = 'user@example.com';</pre>
                    </div>
                </div>
            </div>

            <div className="admin-supabase-note">
                <h4>⚡ Supabase Integration</h4>
                <p>
                    This dashboard connects to your Supabase project automatically.
                    Make sure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>
                    are set in your <code>.env</code> file.
                </p>
                <p>
                    Tables <code>contact_messages</code> and <code>newsletter</code> should be created
                    in your Supabase SQL editor using the CREATE TABLE statements above.
                </p>
            </div>
        </div>
    )

    return (
        <div className="admin-dashboard-page">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">🛡️</div>
                    <h2>Admin Panel</h2>
                </div>

                <div className="admin-sidebar-user">
                    <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
                    <div className="admin-user-info">
                        <span className="admin-user-name">{adminName}</span>
                        <span className="admin-user-role">Administrator</span>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span>📊</span> Dashboard
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <span>📬</span> Messages
                        {contacts.filter(c => !c.read).length > 0 && (
                            <span className="admin-nav-badge">{contacts.filter(c => !c.read).length}</span>
                        )}
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'newsletter' ? 'active' : ''}`}
                        onClick={() => setActiveTab('newsletter')}
                    >
                        <span>📧</span> Subscribers
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'database' ? 'active' : ''}`}
                        onClick={() => setActiveTab('database')}
                    >
                        <span>🗄️</span> Database
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <a href="/admin/settings" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
                        <span>⚙️</span> Settings
                    </a>
                    <a href="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
                        <span>🏠</span> View Site
                    </a>
                    <button className="admin-nav-item admin-logout-btn" onClick={handleLogout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <h1>
                        {activeTab === 'dashboard' && '📊 Dashboard Overview'}
                        {activeTab === 'messages' && '📬 Contact Messages'}
                        {activeTab === 'newsletter' && '📧 Newsletter Subscribers'}
                        {activeTab === 'database' && '🗄️ Database Access'}
                    </h1>
                    <div className="admin-topbar-actions">
                        {newEntryNotification && (
                            <div className="admin-live-notification">
                                {newEntryNotification.message}
                            </div>
                        )}
                        <button className="admin-btn-refresh" onClick={fetchData} title="Refresh data">
                            🔄 Refresh
                        </button>
                        <span className="admin-topbar-time">
                            {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <div className="admin-loading">
                            <div className="admin-spinner"></div>
                            <p>Loading data...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'messages' && renderMessages()}
                            {activeTab === 'newsletter' && renderNewsletters()}
                            {activeTab === 'database' && renderDatabase()}
                        </>
                    )}
                </div>
            </main>

            {/* Approve Modal */}
            <ApproveModal
                show={!!approvalContact}
                contact={approvalContact}
                onClose={() => setApprovalContact(null)}
                onApprove={handleApprove}
            />

            <Toast {...toast} />
        </div>
    )
}