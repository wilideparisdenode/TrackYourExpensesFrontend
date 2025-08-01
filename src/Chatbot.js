// components/Chatbot.jsx
'use client';

import { useEffect, useState } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load Botpress script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v3.1/inject.js';
    script.async = true;
    
    script.onload = () => {
      window.botpressWebChat.init({
        botId: "ebcc3860-f2ea-4d26-af99-f80024d3d179",
        clientId: "17a064e3-b6df-4c85-9648-1dd89a5edf07",
        hostUrl: "https://cdn.botpress.cloud/webchat/v3.1",
        selector: "#webchat-root"
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const toggleChat = () => {
    if (window.botpressWebChat) {
      window.botpressWebChat.sendEvent({
        type: isOpen ? 'hide' : 'show'
      });
      setIsOpen(!isOpen);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <div id="webchat-root" style={{
        width: '400px',
        height: '600px',
        display: isOpen ? 'block' : 'none'
      }}></div>
      
      <button 
        onClick={toggleChat}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#4e73df',
          color: 'white',
          border: 'none',
          fontSize: 24,
          cursor: 'pointer',
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}