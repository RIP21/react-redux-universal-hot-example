import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import PrettyError from 'pretty-error';
import chalk from 'chalk';
import http from 'http';

import { RouterContext, match } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';
import { trigger } from 'redial';

import createHistory from 'react-router/lib/createMemoryHistory';
import config from './config';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import Html from './helpers/Html';
import getRoutes from './routes';
//import { load as loadAuth} from './redux/modules/auth';

const targetUrl = `http://${config.apiHost}:${config.apiPort}`;
const pretty = new PrettyError();
const app = new Express();
const server = new http.Server(app);
const proxy = httpProxy.createProxyServer({
  target: targetUrl,
  changeOrigin: true
});

app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

app.use(Express.static(path.join(__dirname, '..', 'static')));
app.use(Express.static(path.join(__dirname, '..', 'content')));

// Proxy to API server
app.use('/api', (req, res) => {
  proxy.web(req, res, {target: targetUrl});
});

// added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
proxy.on('error', (error, req, res) => {
  if (error.code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, {'content-type': 'application/json'});
  }

  const json = {error: 'proxy_error', reason: error.message};
  res.end(JSON.stringify(json));
});

app.use((req, res) => {
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }
  const client = new ApiClient(req);
  const memoryHistory = createHistory(req.originalUrl);
  const store = createStore(memoryHistory, client);
  const history = syncHistoryWithStore(memoryHistory, store);

  function hydrateOnClient() {
    res.send(`<!doctype html>\n${
      ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} store={store}/>)}`);
  }

  if (__DISABLE_SSR__) {
    hydrateOnClient();
    return;
  }

  match({
    history,
    routes: getRoutes(store),
    location: req.originalUrl
  }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));
      res.status(500);
      hydrateOnClient();
    } else if (renderProps) {
      const {components} = renderProps;
      const locals = {
        path: renderProps.location.pathname,
        query: renderProps.location.query,
        params: renderProps.params,
        dispatch: store.dispatch,
        getState: store.getState,
      };

      trigger('fetch', components, locals)
        .then(() => {
          try {
            const component = (
              <Provider store={store} key="provider">
                <RouterContext {...renderProps} />
              </Provider>
            );
            res.status(200);

            global.navigator = {userAgent: req.headers['user-agent']};
            res.send(`<!doctype html>\n${
              ReactDOM.renderToString(<Html
                assets={webpackIsomorphicTools.assets()}
                component={component}
                store={store}
              />)}`);
          } catch (err) {
            res.status(503);
          }
        })
        .catch(() => {
          res.status(503);
        });
    }
  });
});

if (config.port) {
  server.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    }
    if (!__DEVELOPMENT__) {
      console.log('The app is running at:');
      console.log();
      console.log(`  ${chalk.cyan(`${config.host}:${config.port}/`)}`);
      console.log(`  ${chalk.yellow('Production server')} is running, talking to API server on port ${chalk.cyan(config.apiPort)}`);
      console.log();
    }
  });
} else {
  console.error(chalk.red('ERROR: No PORT environment variable has been specified'));
}
