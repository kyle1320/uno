import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { UnoClient } from '../games/Uno/UnoClient';
import Homepage from './homepage';

render(
  <Router>
    <Switch>
      <Route exact path="/" component={Homepage} />
      <Route path="/" component={UnoClient} />
    </Switch>
  </Router>,
  document.getElementById('root')!
);

if (process.env.NODE_ENV === 'production') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
