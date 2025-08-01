// components/ChatbotWidget.jsx
'use client';

import { useEffect, useState } from 'react';

export default function ChatbotWidget() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if already initialized
    if (window.botpressWebChat) {
      setIsInitialized(true);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v3.1/webchat.js';
    script.id = 'botpress-webchat-script';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for botpressWebChat to be available
      const checkInterval = setInterval(() => {
        if (window.botpressWebChat) {
          clearInterval(checkInterval);
          initializeChatbot();
        }
      }, 100);
    };

    document.body.appendChild(script);

    const initializeChatbot = () => {
      window.botpressWebChat.init({
        configUrl: 'https://files.bpcontent.cloud/2025/08/01/06/20250801060859-IK4CU0XC.json',
        composerPlaceholder: 'Ask me anything...',
        botId: 'your-bot-id',
        hostUrl: 'https://cdn.botpress.cloud/webchat/v3.1',
        messagingUrl: 'https://messaging.botpress.cloud',
        clientId: 'your-client-id',
        lazySocket: true,
        themeName: 'prism',
        frontendVersion: 'v3.1',
        showPoweredBy: false,
        enableConversationDeletion: true,
      });

      window.botpressWebChat.onEvent(() => {
        setIsInitialized(true);
      }, ['LIFECYCLE.LOADED']);
    };

    return () => {
      const existingScript = document.getElementById('botpress-webchat-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}