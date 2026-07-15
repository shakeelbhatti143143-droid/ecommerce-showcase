/**
 * LocalStorage-based data store fallback.
 * When Supabase isn't configured, form submissions are saved here
 * and the admin dashboard reads from both Supabase + this store.
 */

const CONTACTS_KEY = 'shopsphere_contacts'
const NEWSLETTER_KEY = 'shopsphere_newsletter'
const ADMIN_PROFILE_KEY = 'shopsphere_admin_profile'
const SITE_CONTENT_KEY = 'shopsphere_site_content'

function getContacts() {
    try {
        const data = localStorage.getItem(CONTACTS_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

function getNewsletters() {
    try {
        const data = localStorage.getItem(NEWSLETTER_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

function setContacts(contacts) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
}

function setNewsletters(newsletters) {
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(newsletters))
}

function generateId() {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

// Admin Profile
export function getAdminProfile() {
    try {
        const data = localStorage.getItem(ADMIN_PROFILE_KEY)
        return data ? JSON.parse(data) : {
            name: 'Shakeel',
            email: 'shakeelbhatti143143@gmail.com',
            phone: '0319-9476936',
            picture: null,
            bio: 'Administrator of ShopSphere e-commerce platform.',
            location: 'Islamabad, Chak Shazad, Frosted Tech'
        }
    } catch {
        return {
            name: 'Shakeel',
            email: 'shakeelbhatti143143@gmail.com',
            phone: '0319-9476936',
            picture: null,
            bio: 'Administrator of ShopSphere e-commerce platform.',
            location: 'Islamabad, Chak Shazad, Frosted Tech'
        }
    }
}

export function saveAdminProfile(profile) {
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new CustomEvent('shopsphere-profile-update', { detail: profile }))
    return profile
}

// Site Content Management
export function getSiteContent() {
    try {
        const data = localStorage.getItem(SITE_CONTENT_KEY)
        return data ? JSON.parse(data) : getDefaultSiteContent()
    } catch {
        return getDefaultSiteContent()
    }
}

function getDefaultSiteContent() {
    return {
        home: {
            hero_title: 'Build Your E-Commerce Empire',
            hero_subtitle: 'Launch, manage, and scale your online store with our all-in-one platform. No coding required.',
            cta_text: 'Start Free Today 🚀'
        },
        features: {
            section_title: 'Everything You Need to Sell Online',
            section_desc: 'Powerful features to help you build, grow, and manage your e-commerce business.',
        },
        pricing: {
            section_title: 'Simple, Transparent Pricing',
            section_desc: 'Choose the plan that fits your business. No hidden fees.',
        },
        about: {
            mission_title: 'Our Mission',
            mission_text: 'To empower every entrepreneur — from solo sellers to global brands — with the technology, insights, and tools they need to build thriving online businesses.',
            vision_title: 'Our Vision',
            vision_text: 'A world where anyone with a great product idea can reach global customers within minutes.',
        },
        contact: {
            page_title: "We'd Love to Hear From You",
            page_desc: 'Have a question, want a demo, or just want to say hello? Our team typically responds within 24 hours.',
            office: 'Islamabad, Chak Shazad, Frosted Tech',
            email: 'shakeelbhatti143143@gmail.com',
            phone: '0319-9476936',
            hours: 'Mon – Fri, 9:00 AM – 6:00 PM PKT'
        }
    }
}

export function saveSiteContent(section, data) {
    const content = getSiteContent()
    content[section] = { ...content[section], ...data }
    localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(content))
    window.dispatchEvent(new CustomEvent('shopsphere-content-update', { detail: { section, content } }))
    return content
}

// Contact & Newsletter functions (unchanged)
export function saveContactLocally(data) {
    const contacts = getContacts()
    const entry = {
        id: generateId(),
        created_at: new Date().toISOString(),
        name: data.name || '',
        email: data.email || '',
        subject: data.subject || '',
        message: data.message || '',
        read: false,
        source: 'local'
    }
    contacts.unshift(entry)
    setContacts(contacts)
    window.dispatchEvent(new CustomEvent('shopsphere-data-update', {
        detail: { type: 'contact', entry }
    }))
    return entry
}

export function saveNewsletterLocally(data) {
    const newsletters = getNewsletters()
    const exists = newsletters.some(n => n.email === data.email.toLowerCase())
    if (exists) {
        return { duplicate: true }
    }
    const entry = {
        id: generateId(),
        created_at: new Date().toISOString(),
        email: data.email.toLowerCase(),
        source: 'local'
    }
    newsletters.unshift(entry)
    setNewsletters(newsletters)
    window.dispatchEvent(new CustomEvent('shopsphere-data-update', {
        detail: { type: 'newsletter', entry }
    }))
    return entry
}

export function getLocalContacts() {
    return getContacts()
}

export function getLocalNewsletters() {
    return getNewsletters()
}

export function markLocalContactRead(id) {
    const contacts = getContacts()
    const updated = contacts.map(c => c.id === id ? { ...c, read: true } : c)
    setContacts(updated)
}

export function deleteLocalContact(id) {
    const contacts = getContacts().filter(c => c.id !== id)
    setContacts(contacts)
}

export function deleteLocalNewsletter(id) {
    const newsletters = getNewsletters().filter(n => n.id !== id)
    setNewsletters(newsletters)
}

export function getAllMergedContacts(supabaseContacts = []) {
    const local = getLocalContacts()
    const localEmails = new Set(local.map(c => c.email + '|' + c.message))
    const filteredRemote = supabaseContacts.filter(c => !localEmails.has(c.email + '|' + c.message))
    return [...local, ...filteredRemote]
}

export function getAllMergedNewsletters(supabaseNewsletters = []) {
    const local = getLocalNewsletters()
    const localEmails = new Set(local.map(n => n.email))
    const filteredRemote = supabaseNewsletters.filter(n => !localEmails.has(n.email))
    return [...local, ...filteredRemote]
}