import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// التطبيق صار جاهزاً — أخفِ شاشة الإقلاع الفورية
requestAnimationFrame(() => {
  window.dispatchEvent(new Event("app-ready"));
});
