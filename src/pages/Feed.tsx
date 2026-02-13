import { useEffect } from "react";

const FEED_URL = "https://functions.poehali.dev/fc25db30-3e6f-420d-a679-b3e15d71f54d";

export default function Feed() {
  useEffect(() => {
    window.location.href = FEED_URL;
  }, []);

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <p>Перенаправление на YML-фид...</p>
      <p style={{ marginTop: "16px" }}>
        <a href={FEED_URL}>Открыть фид напрямую</a>
      </p>
    </div>
  );
}
