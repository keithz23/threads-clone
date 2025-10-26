import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <StrictMode>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </StrictMode>
  </AppProvider>
);
