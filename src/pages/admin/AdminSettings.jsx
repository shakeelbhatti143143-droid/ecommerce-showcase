import React, { useState, useEffect } from 'react'
import { getAdminProfile, saveAdminProfile, getSiteContent, saveSiteContent } from '../../services/localStore'

function ProfileModal({ show, profile, onClose, onSave }) {
    const [form, setForm] = useState({ ...profile })

    useEffect(() => {
        if (show) setForm({ ...profile })
    }, [show, profile])

    if (!show) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div className="admin-modal-header">
                    <h3>👤 Edit Profile</h3>
                    <button className="admin-modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="admin-modal-field">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="admin-modal-field">
                            <label>Bio</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            />
                        </div>
                        <div className="admin-modal-field">
                            <label>Location</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="admin-modal-field">
                            <label>Phone</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="admin-modal-field">
                            <label>Profile Picture URL</label>
                            <input
                                type="text"
                                value={form.picture || ''}
                                onChange={(e) => setForm({ ...form, picture: e.target.value })}
                                className="form-input"
                                placeholder="https://example.com/photo.jpg"
                            />
                        </div>
                    </div>
                    <div className="admin-modal-footer">
                        <button type="button" className="admin-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ContentEditorModal({ show, section, data, onClose, onSave }) {
    const [form, setForm] = useState({})

    useEffect(() => {
        if (show && data) setForm({ ...data })
    }, [show, data])

    if (!show) return null

    const renderFields = () => {
        switch (section) {
            case 'home':
                return (
                    <>
                        <div className="admin-modal-field">
                            <label>Hero Title</label>
                            <input type="text" value={form.hero_title || ''} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Hero Subtitle</label>
                            <textarea className="form-textarea" rows={3} value={form.hero_subtitle || ''} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />
                        </div>
                        <div className="admin-modal-field">
                            <label>CTA Button Text</label>
                            <input type="text" value={form.cta_text || ''} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="form-input" />
                        </div>
                    </>
                )
            case 'features':
                return (
                    <>
                        <div className="admin-modal-field">
                            <label>Section Title</label>
                            <input type="text" value={form.section_title || ''} onChange={(e) => setForm({ ...form, section_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Section Description</label>
                            <textarea className="form-textarea" rows={3} value={form.section_desc || ''} onChange={(e) => setForm({ ...form, section_desc: e.target.value })} />
                        </div>
                    </>
                )
            case 'pricing':
                return (
                    <>
                        <div className="admin-modal-field">
                            <label>Section Title</label>
                            <input type="text" value={form.section_title || ''} onChange={(e) => setForm({ ...form, section_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Section Description</label>
                            <textarea className="form-textarea" rows={3} value={form.section_desc || ''} onChange={(e) => setForm({ ...form, section_desc: e.target.value })} />
                        </div>
                    </>
                )
            case 'about':
                return (
                    <>
                        <div className="admin-modal-field">
                            <label>Mission Title</label>
                            <input type="text" value={form.mission_title || ''} onChange={(e) => setForm({ ...form, mission_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Mission Text</label>
                            <textarea className="form-textarea" rows={3} value={form.mission_text || ''} onChange={(e) => setForm({ ...form, mission_text: e.target.value })} />
                        </div>
                        <div className="admin-modal-field">
                            <label>Vision Title</label>
                            <input type="text" value={form.vision_title || ''} onChange={(e) => setForm({ ...form, vision_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Vision Text</label>
                            <textarea className="form-textarea" rows={3} value={form.vision_text || ''} onChange={(e) => setForm({ ...form, vision_text: e.target.value })} />
                        </div>
                    </>
                )
            case 'contact':
                return (
                    <>
                        <div className="admin-modal-field">
                            <label>Page Title</label>
                            <input type="text" value={form.page_title || ''} onChange={(e) => setForm({ ...form, page_title: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Page Description</label>
                            <textarea className="form-textarea" rows={2} value={form.page_desc || ''} onChange={(e) => setForm({ ...form, page_desc: e.target.value })} />
                        </div>
                        <div className="admin-modal-field">
                            <label>Office Location</label>
                            <input type="text" value={form.office || ''} onChange={(e) => setForm({ ...form, office: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Email</label>
                            <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Phone</label>
                            <input type="text" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" />
                        </div>
                        <div className="admin-modal-field">
                            <label>Business Hours</label>
                            <input type="text" value={form.hours || ''} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="form-input" />
                        </div>
                    </>
                )
            default:
                return <p>No editable fields for this section.</p>
        }
    }

    const sectionTitles = {
        home: 'Home Page',
        features: 'Features Page',
        pricing: 'Pricing Page',
        about: 'About Page',
        contact: 'Contact Page'
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>✏️ Edit {sectionTitles[section] || section}</h3>
                    <button className="admin-modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(section, form) }}>
                    <div className="admin-modal-body">
                        {renderFields()}
                    </div>
                    <div className="admin-modal-footer">
                        <button type="button" className="admin-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AdminSettings() {
    const [profile, setProfile] = useState(getAdminProfile())
    const [activeTab, setActiveTab] = useState('profile')
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [editingSection, setEditingSection] = useState(null)
    const [siteContent, setSiteContent] = useState(getSiteContent())
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
    }

    useEffect(() => {
        const handleProfileUpdate = (e) => {
            if (e.detail && e.detail.name) {
                setProfile({ ...profile, ...e.detail })
            }
        }
        window.addEventListener('shopsphere-profile-update', handleProfileUpdate)
        return () => window.removeEventListener('shopsphere-profile-update', handleProfileUpdate)
    }, [profile])

    useEffect(() => {
        const handleContentUpdate = (e) => {
            if (e.detail && e.detail.content) {
                setSiteContent(e.detail.content)
            }
        }
        window.addEventListener('shopsphere-content-update', handleContentUpdate)
        return () => window.removeEventListener('shopsphere-content-update', handleContentUpdate)
    }, [])

    const handleSaveProfile = (updated) => {
        saveAdminProfile(updated)
        setProfile(updated)
        setShowProfileModal(false)
        showToast('Profile updated successfully!')
    }

    const handleSaveContent = (section, data) => {
        saveSiteContent(section, data)
        setEditingSection(null)
        showToast('Content updated successfully! Changes are live.')
    }

    const sections = [
        { key: 'home', label: 'Home', icon: '🏠' },
        { key: 'features', label: 'Features', icon: '⚡' },
        { key: 'pricing', label: 'Pricing', icon: '💎' },
        { key: 'about', label: 'About', icon: '📖' },
        { key: 'contact', label: 'Contact', icon: '📬' },
    ]

    return (
        <div className="admin-settings-page">
            <div className="admin-settings-header">
                <h1>⚙️ Settings & CMS</h1>
                <p>Manage your profile and update site content</p>
            </div>

            <div className="admin-settings-tabs">
                <button className={`admin-settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                    👤 Profile
                </button>
                <button className={`admin-settings-tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
                    ✏️ Site Content
                </button>
            </div>

            <div className="admin-settings-content">
                {activeTab === 'profile' && (
                    <div className="admin-profile-card">
                        <div className="admin-profile-header">
                            <div className="admin-profile-avatar">
                                {profile.picture ? (
                                    <img src={profile.picture} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    profile.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="admin-profile-info">
                                <h2>{profile.name}</h2>
                                <p>{profile.bio}</p>
                                <div className="admin-profile-meta">
                                    <span>📍 {profile.location}</span>
                                    <span>📧 {profile.email}</span>
                                    <span>📞 {profile.phone}</span>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => setShowProfileModal(true)}>
                                ✏️ Edit Profile
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="admin-cms-grid">
                        {sections.map((section) => (
                            <div key={section.key} className="admin-cms-card">
                                <div className="admin-cms-card-header">
                                    <span className="admin-cms-icon">{section.icon}</span>
                                    <h3>{section.label} Page</h3>
                                </div>
                                <div className="admin-cms-card-body">
                                    <p><strong>Title:</strong> {siteContent[section.key]?.hero_title || siteContent[section.key]?.section_title || siteContent[section.key]?.page_title || 'N/A'}</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingSection(section.key)}>
                                    ✏️ Edit
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ProfileModal
                show={showProfileModal}
                profile={profile}
                onClose={() => setShowProfileModal(false)}
                onSave={handleSaveProfile}
            />

            <ContentEditorModal
                show={!!editingSection}
                section={editingSection}
                data={editingSection ? siteContent[editingSection] : null}
                onClose={() => setEditingSection(null)}
                onSave={handleSaveContent}
            />

            <Toast {...toast} />
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