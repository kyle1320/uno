import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Homepage from "./homepage";
import { UnoRoot } from "./UnoRoot";

const root = createRoot(document.getElementById("root")!);
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/:roomName" element={<UnoRoot />} />
    </Routes>
  </Router>
);
