/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, match } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';
import {trigger} from 'redial';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';

import getRoutes from './routes';

const client = new ApiClient();
const _browserHistory = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(_browserHistory, client, window.__data);
const history = syncHistoryWithStore(_browserHistory, store);

ReactGA.initialize('UA-86360910-1'); // Google Analytics with React

const logPageView = () => {
  if (typeof window !== 'undefined') {
    ReactGA.set({page: window.location.pathname});
    ReactGA.pageview(window.location.pathname);
  }
};

const routes = getRoutes(store);

ReactDOM.render(
  <Provider store={store}>
    <Router routes={routes} history={history} onUpdate={logPageView}/>
  </Provider>,
  dest
);

history.listen((location) => {
  match({routes, location}, (error, redirectLocation, renderProps) => {
    if (renderProps) {
      const {components} = renderProps;
      const locals = {
        path: renderProps.location.pathname,
        query: renderProps.location.query,
        params: renderProps.params,
        dispatch: store.dispatch,
        getState: store.getState
      };

      if (window.__INITIAL_STATE__) {
        delete window.__INITIAL_STATE__;
      } else {
        trigger('fetch', components, locals);
      }

      trigger('defer', components, locals);
    }
  });
});

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

//
// if (__DEVTOOLS__ && !window.devToolsExtension) {
//   const DevTools = require('./containers/DevTools/DevTools');
//   ReactDOM.render(
//     <Provider store={store} key="provider">
//       <div>
//         {component}
//         <DevTools />
//       </div>
//     </Provider>,
//     dest
//   );
// }
