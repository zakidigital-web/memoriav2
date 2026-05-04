import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { preloadBootstrap } from "./lib/bootstrap";

async function startApp() {
  try {
    await preloadBootstrap();
  } catch (error) {
    console.warn("Gagal preload bootstrap aplikasi:", error);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void startApp();
