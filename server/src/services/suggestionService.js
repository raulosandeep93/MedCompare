import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const SUGGESTIONS_FILE = path.join(DATA_DIR, 'feature_suggestions.json');

// Ensure data folder and feature_suggestions.json exist
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUGGESTIONS_FILE)) {
    fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// Basic HTML tag stripping to sanitize user input
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

function sanitizePublic(suggestion) {
  if (!suggestion) return null;
  const { email, ...publicData } = suggestion;
  return publicData;
}

export function getAllSuggestions() {
  try {
    ensureDataStore();
    const raw = fs.readFileSync(SUGGESTIONS_FILE, 'utf8') || '[]';
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    // Sort by votes descending, then newest first
    const sorted = [...items].sort((a, b) => {
      const voteDiff = (b.votes || 0) - (a.votes || 0);
      if (voteDiff !== 0) return voteDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted.map(sanitizePublic);
  } catch (err) {
    console.error('[SuggestionService] Failed to read suggestions:', err);
    return [];
  }
}

export function addSuggestion({ title, category, description, email, authorName }) {
  ensureDataStore();
  const cleanTitle = sanitizeText(title);
  const cleanDesc = sanitizeText(description);
  const cleanCat = sanitizeText(category) || 'General';
  const cleanEmail = sanitizeText(email);
  const cleanAuthor = sanitizeText(authorName) || 'Community Member';

  if (!cleanTitle || !cleanDesc) {
    throw new Error('Title and description are required.');
  }

  if (cleanTitle.length > 120) {
    throw new Error('Title cannot exceed 120 characters.');
  }

  if (cleanDesc.length > 1000) {
    throw new Error('Description cannot exceed 1000 characters.');
  }

  const raw = fs.readFileSync(SUGGESTIONS_FILE, 'utf8') || '[]';
  const items = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];

  const newSuggestion = {
    id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: cleanTitle,
    category: cleanCat,
    description: cleanDesc,
    authorName: cleanAuthor,
    email: cleanEmail,
    votes: 1,
    createdAt: new Date().toISOString()
  };

  items.unshift(newSuggestion);
  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(items, null, 2), 'utf8');

  return sanitizePublic(newSuggestion);
}

export function voteSuggestion(id, action = 'upvote') {
  ensureDataStore();
  const raw = fs.readFileSync(SUGGESTIONS_FILE, 'utf8') || '[]';
  const items = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];

  const targetIndex = items.findIndex((i) => i.id === id);
  if (targetIndex === -1) {
    throw new Error('Feature suggestion not found.');
  }

  const currentVotes = typeof items[targetIndex].votes === 'number' ? items[targetIndex].votes : 0;
  if (action === 'unvote') {
    items[targetIndex].votes = Math.max(0, currentVotes - 1);
  } else {
    items[targetIndex].votes = currentVotes + 1;
  }

  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(items, null, 2), 'utf8');
  return sanitizePublic(items[targetIndex]);
}
