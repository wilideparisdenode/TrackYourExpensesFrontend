// components/ChatbotInjector.jsx
'use client';

import { useEffect } from 'react';

export default function ChatbotInjector() {
  useEffect(() => {
    // Check if we've already injected the chatbot
    if (document.getElementById('botpress-container')) return;

    // Create container div
    const container = document.createElement('div');
    container.id = 'botpress-container';
    container.innerHTML = `
      <style>
        #webchat {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 400px;
          height: 600px;
          z-index: 999;
        }
        #webchat-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #4e73df;
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          z-index: 1000;
        }
      </style>
      <div id="webchat"></div>
      <button id="webchat-toggle">💬</button>
      <script src="https://cdn.botpress.cloud/webchat/v3.1/inject.js"></script>
      <script>
        window.addEventListener('load', function() {
          window.botpressWebChat.init({
            botId: "ebcc3860-f2ea-4d26-af99-f80024d3d179",
            clientId: "17a064e3-b6df-4c85-9648-1dd89a5edf07",
            hostUrl: "https://cdn.botpress.cloud/webchat/v3.1",
            selector: "#webchat",
            botName: "Expense Tracker Assistant"
          });
          
          document.getElementById('webchat-toggle').addEventListener('click', function() {
            window.botpressWebChat.sendEvent({
              type: window.botpressWebChat.isDisplayed() ? 'hide' : 'show'
            });
          });
        });
      </script>
    `;

    document.body.appendChild(container);

    return () => {
      const container = document.getElementById('botpress-container');
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return null;
}