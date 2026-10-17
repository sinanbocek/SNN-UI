import { createRoot } from "react-dom/client";
import "../../registry/foundation/snn-foundation.css";
import "../../registry/foundation/snn-chart-palette.css";
import "../../registry/foundation/fonts/snn-font-plex.css";
import "../../registry/foundation/fonts/snn-font-modern.css";
import "../../registry/foundation/fonts/snn-font-document.css";
import "../../registry/foundation/fonts/snn-font-soft.css";
import "./galeri.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
