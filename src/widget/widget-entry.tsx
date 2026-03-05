/**
 * Femibot Chat Widget — Standalone entry point
 *
 * This file is the entry point that Vite builds into a single JS bundle.
 * It injects its own CSS keyframes, creates a mount div, and renders the
 * ChatWidget React component. Drop the built JS file into any page
 * (WordPress, static HTML, etc.) and the floating chat bubble appears.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './ChatWidget';
import type { ChatWidgetProps } from './ChatWidget';

// ── Inject keyframe animations (no external CSS needed) ────────────────────
const STYLE_ID = 'femibot-widget-styles';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    @keyframes femibot-scaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(20px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    @keyframes femibot-fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes femibot-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    @keyframes femibot-spin {
      to { transform: rotate(360deg); }
    }

    /* Reset styles inside the widget so WordPress themes don't break it */
    #femibot-chat-widget *,
    #femibot-chat-widget *::before,
    #femibot-chat-widget *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    #femibot-chat-widget button {
      font-family: inherit;
    }
    #femibot-chat-widget textarea {
      font-family: inherit;
    }

    /* Markdown inside the widget */
    .femibot-markdown a { color: #9333ea; text-decoration: underline; }
    .femibot-markdown ul { list-style-type: disc; padding-left: 20px; }
    .femibot-markdown ol { list-style-type: decimal; padding-left: 20px; }
  `;
  document.head.appendChild(style);
}

// ── Mount ──────────────────────────────────────────────────────────────────
const MOUNT_ID = 'femibot-chat-widget';
let container = document.getElementById(MOUNT_ID);
if (!container) {
  container = document.createElement('div');
  container.id = MOUNT_ID;
  document.body.appendChild(container);
}

// Read configuration from the global window object (set by WordPress snippet)
const cfg: ChatWidgetProps = (window as any).FEMIBOT_CONFIG || {};

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ChatWidget {...cfg} />
  </React.StrictMode>,
);
