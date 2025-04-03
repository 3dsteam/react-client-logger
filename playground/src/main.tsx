import { ClientLoggerProvider } from "../../src";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <ClientLoggerProvider overrideConsole>
        <App />
    </ClientLoggerProvider>,
);
