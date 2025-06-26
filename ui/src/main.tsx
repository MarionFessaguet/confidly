import "@fontsource-variable/anybody/wdth.css";
import "@fontsource/inter/latin-400.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.tsx";
import "@fontsource/mulish/latin-400.css";
import "@fontsource/mulish/latin-600.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
