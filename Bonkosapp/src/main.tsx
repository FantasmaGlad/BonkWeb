import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, type Page } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App page={document.body.dataset.page as Page} />
    </StrictMode>,
  );
}
