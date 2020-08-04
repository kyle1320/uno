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
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
