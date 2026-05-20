/**
 * embed.js — MegaThink Chatbot floating bubble
 *
 * Paste ONE script tag before </body> on megathinkonline.com:
 *
 *   <script
 *     src="https://YOUR-VERCEL-URL.vercel.app/embed.js"
 *     data-chatbot-url="https://YOUR-VERCEL-URL.vercel.app/widget"
 *     defer
 *   ></script>
 *
 * That's it. No other changes needed.
 */
(function () {
  "use strict";

  const script = document.currentScript || document.querySelector('script[data-chatbot-url]');
  const WIDGET_URL = script?.getAttribute("data-chatbot-url") || "https://megathink-chatbot.vercel.app/widget";

  /* ── Styles ── */
  const style = document.createElement("style");
  style.textContent = `
    #mt-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, #1a3c8f 0%, #2563eb 100%);
      color: #fff; border: none; cursor: pointer; font-size: 24px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(26,60,143,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #mt-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 30px rgba(26,60,143,0.55);
    }
    #mt-frame-wrap {
      position: fixed; bottom: 96px; right: 24px; z-index: 999998;
      width: 380px; height: 580px;
      border-radius: 20px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
      overflow: hidden;
      display: none; opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
      transform: translateY(12px);
    }
    #mt-frame-wrap.open {
      display: block;
    }
    #mt-frame-wrap.visible {
      opacity: 1;
      transform: translateY(0);
    }
    #mt-frame {
      width: 100%; height: 100%; border: none; display: block;
    }
    @media (max-width: 480px) {
      #mt-frame-wrap {
        width: calc(100vw - 20px);
        height: calc(100vh - 110px);
        right: 10px; bottom: 80px;
        border-radius: 16px;
      }
    }
  `;
  document.head.appendChild(style);

  /* ── Bubble button ── */
  const bubble = document.createElement("button");
  bubble.id = "mt-bubble";
  bubble.setAttribute("aria-label", "Open Mega Think chatbot");
  bubble.innerHTML = "💬";

  /* ── iframe wrapper ── */
  const wrap = document.createElement("div");
  wrap.id = "mt-frame-wrap";

  const iframe = document.createElement("iframe");
  iframe.id = "mt-frame";
  iframe.title = "Mega Think Course & Tutor Finder";
  iframe.allow = "clipboard-write";
  // Lazy-load the iframe URL only when opened for performance
  let loaded = false;

  wrap.appendChild(iframe);
  document.body.appendChild(wrap);
  document.body.appendChild(bubble);

  /* ── Toggle logic ── */
  let isOpen = false;

  bubble.addEventListener("click", () => {
    isOpen = !isOpen;
    bubble.innerHTML = isOpen ? "✕" : "💬";
    bubble.setAttribute("aria-label", isOpen ? "Close chatbot" : "Open Mega Think chatbot");

    if (isOpen) {
      if (!loaded) {
        iframe.src = WIDGET_URL;
        loaded = true;
      }
      wrap.classList.add("open");
      requestAnimationFrame(() => wrap.classList.add("visible"));
    } else {
      wrap.classList.remove("visible");
      setTimeout(() => wrap.classList.remove("open"), 260);
    }
  });
})();
