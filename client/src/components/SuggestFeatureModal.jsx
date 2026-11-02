import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lightbulb,
  ThumbsUp,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import {
  getFeatureSuggestions,
  submitFeatureSuggestion,
  voteFeatureSuggestion
} from '../utils/api';

const VOTED_STORAGE_KEY = 'medcompare_voted_features';

function getStoredVotes() {
  try {
    const raw = localStorage.getItem(VOTED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredVotes(votes) {
  try {
    localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify(votes));
  } catch (err) {
    console.warn('Failed to save votes to localStorage:', err);
  }
}

function getCategoryBadgeStyle(category) {
  switch (category) {
    case 'Savings & Discounts':
      return { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' };
    case 'Search & OCR':
      return { background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' };
    case 'Alerts & Tracking':
      return { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' };
    case 'Safety & Health':
      return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' };
    case 'Convenience':
      return { background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' };
    case 'Platform Integration':
    default:
      return { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' };
  }
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return null;
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return null;
  }
}

export default function SuggestFeatureModal({ isOpen, onClose }) {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [votedIds, setVotedIds] = useState(getStoredVotes);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Platform Integration');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getFeatureSuggestions();
      setIdeas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load feature suggestions:', err);
      setFetchError('Unable to load community suggestions right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      setSubmitError(null);
      setSubmitted(false);
      setVotedIds(getStoredVotes());
    }
  }, [isOpen, fetchSuggestions]);

  if (!isOpen) return null;

  const handleUpvote = async (id) => {
    const isCurrentlyVoted = Boolean(votedIds[id]);
    const action = isCurrentlyVoted ? 'unvote' : 'upvote';

    // Optimistic state update
    const nextVoted = { ...votedIds, [id]: !isCurrentlyVoted };
    setVotedIds(nextVoted);
    saveStoredVotes(nextVoted);

    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const delta = isCurrentlyVoted ? -1 : 1;
          return { ...i, votes: Math.max(0, (i.votes || 0) + delta) };
        }
        return i;
      })
    );

    try {
      const updated = await voteFeatureSuggestion(id, action);
      if (updated && typeof updated.votes === 'number') {
        setIdeas((prev) =>
          prev.map((i) => (i.id === id ? { ...i, votes: updated.votes } : i))
        );
      }
    } catch (err) {
      console.error('Failed to update upvote on server:', err);
      // Revert optimistic update on failure
      const reverted = { ...votedIds };
      setVotedIds(reverted);
      saveStoredVotes(reverted);
      setIdeas((prev) =>
        prev.map((i) => {
          if (i.id === id) {
            const delta = isCurrentlyVoted ? 1 : -1;
            return { ...i, votes: Math.max(0, (i.votes || 0) + delta) };
          }
          return i;
        })
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Please fill in both a title and description.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await submitFeatureSuggestion({
        title: title.trim(),
        category,
        description: description.trim(),
        email: email.trim()
      });

      // Mark user's newly created suggestion as voted by default
      if (created && created.id) {
        const nextVoted = { ...votedIds, [created.id]: true };
        setVotedIds(nextVoted);
        saveStoredVotes(nextVoted);
        setIdeas((prev) => [created, ...prev.filter((i) => i.id !== created.id)]);
      }

      setSubmitted(true);
      setTitle('');
      setDescription('');
      setEmail('');
    } catch (err) {
      console.error('Error submitting feature idea:', err);
      setSubmitError(err.message || 'Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setSubmitError(null);
    setTitle('');
    setDescription('');
    setEmail('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(92vw, 680px)',
          maxWidth: '680px',
          maxHeight: 'min(92dvh, 860px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Suggest a Feature</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Help shape MedCompare — submit real ideas and vote on community requests
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h4
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: 'var(--text-main)'
                }}
              >
                Feature Suggestion Submitted!
              </h4>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  maxWidth: '380px',
                  margin: '0 auto 1.5rem',
                  lineHeight: 1.5
                }}
              >
                Thank you! Your idea has been saved and added to our community suggestions list. Other users can now see and upvote it.
              </p>
              <button
                type="button"
                className="search-submit-btn"
                style={{ margin: '0 auto', padding: '0.65rem 1.5rem' }}
                onClick={() => setSubmitted(false)}
              >
                View Community Suggestions
              </button>
            </div>
          ) : (
            <>
              {/* Propose a feature form */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h4
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    margin: '0 0 0.75rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-main)'
                  }}
                >
                  <Sparkles size={16} color="#3b82f6" />
                  Have an idea? Propose it here:
                </h4>

                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <input
                      type="text"
                      required
                      maxLength={120}
                      placeholder="Feature Title (e.g. WhatsApp Price Drop Alerts)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="composition-text-input"
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="composition-text-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="Platform Integration">Platform Integration</option>
                      <option value="Savings & Discounts">Savings & Discounts</option>
                      <option value="Search & OCR">Search & OCR</option>
                      <option value="Alerts & Tracking">Alerts & Tracking</option>
                      <option value="Convenience">Convenience</option>
                      <option value="Safety & Health">Safety & Health</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    required
                    maxLength={1000}
                    placeholder="Briefly describe how this feature should work and how it helps users..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="composition-text-input"
                    style={{
                      resize: 'vertical',
                      minHeight: '65px',
                      fontFamily: 'inherit',
                      marginBottom: '0.75rem'
                    }}
                  />

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr auto',
                      gap: '0.75rem',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="email"
                      placeholder="Your email (optional, to notify when shipped)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="composition-text-input"
                      style={{ height: '38px', fontSize: '0.8125rem' }}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="execute-composition-btn"
                      style={{
                        background:
                          'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.8125rem',
                        opacity: isSubmitting || !title.trim() || !description.trim() ? 0.6 : 1,
                        cursor:
                          isSubmitting || !title.trim() || !description.trim()
                            ? 'not-allowed'
                            : 'pointer'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Post Idea</span>
                        </>
                      )}
                    </button>
                  </div>

                  {submitError && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        fontSize: '0.78125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>{submitError}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Community Proposed Features List */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Community Proposed Features ({ideas.length})
                  </span>
                  {isLoading && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Loader2 size={12} className="spin" />
                      Loading ideas...
                    </span>
                  )}
                </div>

                {fetchError && (
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <span>{fetchError}</span>
                    <button
                      type="button"
                      onClick={fetchSuggestions}
                      style={{
                        background: 'none',
                        border: 'underline',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.78125rem'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !fetchError && ideas.length === 0 && (
                  <div
                    style={{
                      background: 'var(--bg-card-subtle)',
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: '14px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem'
                      }}
                    >
                      <Sparkles size={20} />
                    </div>
                    <h5
                      style={{
                        margin: '0 0 0.35rem 0',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--text-main)'
                      }}
                    >
                      No community suggestions yet
                    </h5>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        maxWidth: '340px',
                        marginInline: 'auto',
                        lineHeight: 1.45
                      }}
                    >
                      Be the first to suggest a feature! What would make comparing medicine prices even easier for you?
                    </p>
                  </div>
                )}

                {/* Ideas Cards */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  {ideas.map((idea) => {
                    const isVoted = Boolean(votedIds[idea.id]);
                    const badgeStyle = getCategoryBadgeStyle(idea.category);
                    const timeString = formatRelativeDate(idea.createdAt);

                    return (
                      <div
                        key={idea.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: isVoted
                            ? '1px solid #3b82f6'
                            : '1px solid var(--border-color)',
                          borderRadius: '14px',
                          padding: '0.875rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: isVoted
                            ? '0 0 10px rgba(59, 130, 246, 0.15)'
                            : 'none'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                              marginBottom: '0.25rem'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                color: 'var(--text-main)',
                                wordBreak: 'break-word'
                              }}
                            >
                              {idea.title}
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '9999px',
                                ...badgeStyle
                              }}
                            >
                              {idea.category || 'General'}
                            </span>
                            {timeString && (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  color: 'var(--text-muted)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <Calendar size={11} />
                                {timeString}
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: '0.78125rem',
                              color: 'var(--text-muted)',
                              margin: 0,
                              lineHeight: 1.4,
                              wordBreak: 'break-word'
                            }}
                          >
                            {idea.description || idea.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpvote(idea.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '10px',
                            border: isVoted
                              ? '1px solid #3b82f6'
                              : '1px solid var(--border-color)',
                            background: isVoted
                              ? 'rgba(59, 130, 246, 0.12)'
                              : 'var(--bg-card-subtle)',
                            color: isVoted ? '#3b82f6' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '54px',
                            flexShrink: 0
                          }}
                          title={isVoted ? 'Remove upvote' : 'Upvote this idea'}
                        >
                          <ThumbsUp size={14} />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              marginTop: '2px'
                            }}
                          >
                            {idea.votes || 0}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
