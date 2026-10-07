import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Bot,
  Zap,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import api from '../services/api';

const SAMPLE_PROMPTS = [
  {
    title: 'Laptop Screen Issue',
    text: 'My MacBook screen is flickering with black horizontal lines and the fan spins constantly at maximum volume.'
  },
  {
    title: 'AC Not Cooling',
    text: 'The AC indoor blower is blowing ambient warm air and the outdoor unit makes a loud buzzing click every 3 minutes.'
  },
  {
    title: 'Phone Battery Drain',
    text: 'My iPhone battery drops from 100% to 15% in less than 2 hours and gets hot near the camera while charging.'
  },
  {
    title: 'Washing Machine Noise',
    text: 'The washing machine vibrates violently and makes a metal grinding noise during the spin cycle.'
  }
];

export default function AiAssistantPage({ setActivePage, setInitialCategory, setInitialProblem }) {
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (queryText) => {
    const textToSubmit = (queryText || inputText).trim();
    if (!textToSubmit) return;

    setAnalyzing(true);
    setError('');
    setDiagnosis(null);

    try {
      const res = await api.ai.diagnose(textToSubmit);
      if (res.success && res.data) {
        setDiagnosis(res.data);
      } else {
        throw new Error(res.message || 'Diagnosis generation failed.');
      }
    } catch (err) {
      setError(err.message || 'Could not connect to AI service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBookWithDiagnosis = () => {
    if (diagnosis) {
      if (setInitialCategory) setInitialCategory(diagnosis.category || 'Other');
      if (setInitialProblem) setInitialProblem(`[AI Diagnosed: ${diagnosis.possibleIssue}]\n\nCustomer reported: ${inputText || 'Issue as analyzed'}`);
      setActivePage('request');
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '2.5rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-accepted" style={{ marginBottom: '0.75rem', padding: '0.35rem 0.8rem' }}>
          <Sparkles size={14} color="#0284c7" /> Smart AI Diagnostic Assistant
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Describe Your Hardware Problem
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
          Get an immediate AI root-cause analysis, estimated repair budget, and actionable safety steps before scheduling a technician.
        </p>
      </div>

      {/* Main Diagnostic Input Card */}
      <div className="card card-padded" style={{ marginBottom: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
        >
          <label className="form-label" style={{ fontSize: '0.95rem' }}>
            What is happening with your device or appliance?
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe the symptoms in your own words (e.g., 'My laptop won't turn on after a light liquid spill, but the orange charging light blinks')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ fontSize: '0.95rem', marginBottom: '1rem' }}
            id="input-ai-problem"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              🔒 No sensitive data stored. Safe, read-only AI diagnosis.
            </span>
            <button
              type="submit"
              disabled={analyzing || !inputText.trim()}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
              id="btn-run-ai-diagnosis"
            >
              <Sparkles size={16} /> {analyzing ? 'Analyzing Symptoms...' : 'Analyze Problem'}
            </button>
          </div>
        </form>

        {/* Quick sample prompt chips */}
        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.65rem' }}>
            Or try one of these common symptoms:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.65rem' }}>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  handleAnalyze(sample.text);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#93c5fd'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.2rem' }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sample.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* AI Diagnostic Output Result Card */}
      {diagnosis && (
        <div
          className="card card-padded"
          style={{
            border: '2px solid #bae6fd',
            background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0f2fe', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  AI Diagnostic Assessment
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                  Powered by {diagnosis.engine || 'RepairHub Diagnostic Engine'}
                </span>
              </div>
            </div>

            <span className="badge badge-accepted" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              Category: {diagnosis.category}
            </span>
          </div>

          {/* Root cause issue */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
              Possible Issue Identified:
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              {diagnosis.possibleIssue}
            </div>
          </div>

          {/* Suggested next steps */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Zap size={15} /> Suggested Immediate Step:
            </div>
            <p style={{ fontSize: '0.925rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
              {diagnosis.suggestedNextStep}
            </p>
          </div>

          {/* Two-column badges: Cost & Inspection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Estimated Cost Range
              </span>
              <strong style={{ fontSize: '1.35rem', color: '#047857' }}>
                {diagnosis.estimatedCostRange}
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#065f46', display: 'block', marginTop: '0.15rem' }}>
                Includes standard labor & OEM components
              </span>
            </div>

            <div style={{ background: diagnosis.professionalInspectionRecommended ? '#fff7ed' : '#f0fdf4', border: diagnosis.professionalInspectionRecommended ? '1px solid #fed7aa' : '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: diagnosis.professionalInspectionRecommended ? '#9a3412' : '#166534', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                Professional Inspection
              </span>
              <strong style={{ fontSize: '1.15rem', color: diagnosis.professionalInspectionRecommended ? '#c2410c' : '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {diagnosis.professionalInspectionRecommended ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                {diagnosis.professionalInspectionRecommended ? 'Highly Recommended' : 'DIY Troubleshooting Possible'}
              </strong>
              <span style={{ fontSize: '0.725rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                Based on hardware risk level
              </span>
            </div>
          </div>

          {/* Preventative tip */}
          {diagnosis.preventativeTip && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              <Lightbulb size={16} color="#eab308" />
              <span><strong>Preventative Tip:</strong> {diagnosis.preventativeTip}</span>
            </div>
          )}

          {/* Call to action: Book with this diagnosis */}
          <div style={{ borderTop: '1px solid #e0f2fe', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              onClick={handleBookWithDiagnosis}
              className="btn btn-primary btn-lg"
              id="btn-book-from-ai"
            >
              Book Repair With This Diagnosis <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
