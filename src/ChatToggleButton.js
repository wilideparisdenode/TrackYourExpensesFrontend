// components/ChatToggleButton.jsx
'use client';

import { useState, useEffect } from 'react';
import styles from './ChatToggleButton.module.css';

export default function ChatToggleButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check periodically if Botpress is ready
    const checkInterval = setInterval(() => {
      if (window.botpressWebChat) {
        setIsReady(true);
        clearInterval(checkInterval);
      }
    }, 300);

    return () => clearInterval(checkInterval);
  }, []);

  const toggleChat = () => {
    if (!isReady) {
      console.warn('Botpress not ready yet');
      return;
    }

    const webchat = document.getElementById('webchat-container');
    if (!webchat) return;

    if (isVisible) {
      webchat.style.display = 'none';
      window.botpressWebChat.sendEvent({ type: 'hide' });
    } else {
      webchat.style.display = 'block';
      window.botpressWebChat.sendEvent({ type: 'show' });
    }
    setIsVisible(!isVisible);
  };

  return (
    <button 
      className={styles.toggleButton} 
      onClick={toggleChat}
      disabled={!isReady}
      aria-label="Toggle chat"
    >
      {isVisible ? '✕' : '💬'}
      {!isReady && <span className={styles.loadingIndicator} />}
    </button>
  );
}