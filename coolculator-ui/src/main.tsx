import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./i18n/i18n";
import { App } from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("#root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
