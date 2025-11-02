import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider.tsx";
import { ToastProvider } from "./components/Toast.tsx";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <StrictMode>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </StrictMode>
  </AppProvider>
);
