import ChatWidget from "@/components/ChatWidget";

/**
 * /widget — This page is loaded inside the <iframe> on megathinkonline.com.
 * Keep it background-transparent so the host page background shows through
 * the rounded corners of the chat window.
 */
export default function WidgetPage() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <ChatWidget />
    </main>
  );
}
