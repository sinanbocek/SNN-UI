import { createRoot } from "react-dom/client";
import "../../registry/foundation/snn-foundation.css";
import "../../registry/foundation/snn-chart-palette.css";
import "./galeri.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
