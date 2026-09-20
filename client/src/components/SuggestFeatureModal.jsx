import React, { useState } from 'react';
import { X, Lightbulb, ThumbsUp, Send, CheckCircle2, Sparkles } from 'lucide-react';

const COMMUNITY_IDEAS = [
  {
    id: 'whatsapp_alerts',
    title: '🔔 WhatsApp Price Drop Alerts',
    desc: 'Get notified automatically on WhatsApp when a chronic medicine reaches its lowest recorded price.',
    category: 'Alerts & Tracking',
    votes: 142
  },
  {
    id: 'coupon_aggregator',
    title: '🏷️ Bank & Platform Coupon Codes',
    desc: 'Automatically aggregate promo codes (Cred, HDFC, OneCard) for Apollo, PharmEasy, and Tata 1mg.',
    category: 'Savings',
    votes: 98
  },
  {
    id: 'monthly_refill',
    title: '💊 1-Click Monthly Refill Cart',
    desc: 'Save your family’s chronic prescription list and compare total basket price across all pharmacies at once.',
    category: 'Convenience',
    votes: 84
  },
  {
    id: 'interaction_checker',
    title: '⚠️ Drug Interaction & Side-Effect Warning',
    desc: 'Check if two medicines being purchased together have dangerous drug-drug interactions.',
    category: 'Safety & Health',
    votes: 67
  }
];

export default function SuggestFeatureModal({ isOpen, onClose }) {
  const [ideas, setIdeas] = useState(COMMUNITY_IDEAS);
  const [votedIds, setVotedIds] = useState({});
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('New Platform Integration');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleUpvote = (id) => {
    if (votedIds[id]) {
      // Remove vote
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, votes: i.votes - 1 } : i))
      );
      setVotedIds((prev) => ({ ...prev, [id]: false }));
    } else {
      // Add vote
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, votes: i.votes + 1 } : i))
      );
      setVotedIds((prev) => ({ ...prev, [id]: true }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Add to user submitted state
    setIdeas((prev) => [
      {
        id: `user_${Date.now()}`,
        title: `✨ ${title.trim()}`,
        desc: description.trim(),
        category,
        votes: 1
      },
      ...prev
    ]);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleReset}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Suggest a Feature</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Vote on upcoming ideas or suggest your own feature
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleReset} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Feature Suggestion Submitted!
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
                Thank you for helping shape the future of MedCompare. Your idea has been added to our community roadmap!
              </p>
              <button
                type="button"
                className="search-submit-btn"
                style={{ margin: '0 auto', padding: '0.65rem 1.5rem' }}
                onClick={() => setSubmitted(false)}
              >
                View Community Roadmap
              </button>
            </div>
          ) : (
            <>
              {/* Propose a feature form */}
              <div style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Sparkles size={16} color="#3b82f6" />
                  Have an idea? Propose it here:
                </h4>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="Feature Title (e.g. WhatsApp Price Alerts)"
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
                      <option value="New Platform Integration">Platform Integration</option>
                      <option value="Savings & Discounts">Savings & Discounts</option>
                      <option value="Search & OCR">Search & OCR</option>
                      <option value="Alerts & Tracking">Alerts & Tracking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="Briefly describe how this feature should work and how it helps users..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="composition-text-input"
                    style={{ resize: 'vertical', minHeight: '65px', fontFamily: 'inherit', marginBottom: '0.75rem' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="execute-composition-btn"
                      disabled={!title.trim() || !description.trim()}
                      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '0.55rem 1.25rem', fontSize: '0.8125rem' }}
                    >
                      <Send size={14} />
                      <span>Post Idea</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Community Roadmap / Ideas list */}
              <div>
                <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Community Proposed Features ({ideas.length})
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ideas.map((idea) => {
                    const isVoted = Boolean(votedIds[idea.id]);
                    return (
                      <div
                        key={idea.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: isVoted ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                          borderRadius: '14px',
                          padding: '0.875rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          transition: 'all 0.2s ease',
                          boxShadow: isVoted ? '0 0 10px rgba(59, 130, 246, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {idea.title}
                            </span>
                            <span style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '9999px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6'
                            }}>
                              {idea.category}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                            {idea.desc}
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
                            border: isVoted ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                            background: isVoted ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card-subtle)',
                            color: isVoted ? '#3b82f6' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '54px'
                          }}
                          title={isVoted ? 'Upvoted!' : 'Upvote this idea'}
                        >
                          <ThumbsUp size={14} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '2px' }}>
                            {idea.votes}
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
