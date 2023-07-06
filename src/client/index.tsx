import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { UnoClient } from '../games/Uno/UnoClient';
import Homepage from './homepage';

createRoot(
  document.getElementById('root')!
).render(
  <Router>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/:roomName" element={<UnoClient />} />
    </Routes>
  </Router>
);
