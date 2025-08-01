import { useEffect } from "react";

export default function BotpressChat() {
  useEffect(() => {
    // Inject Botpress script
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.botpressWebChat.init({
        "composerPlaceholder": "Chat with us!",
        "botId": "ebcc3860-f2ea-4d26-af99-f80024d3d179", // <-- Replace with your Botpress bot ID
        "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
        "messagingUrl": "https://messaging.botpress.cloud",
        "clientId": "17a064e3-b6df-4c85-9648-1dd89a5edf07", // <-- Replace with your Botpress bot ID
        "hideWidget": false,
        "showCloseButton": true,
        "showPoweredBy": false
      });
    };
  }, []);

  return null;
}