import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import App from './App.js';
import Home from './components/Home';
import About from './components/About';
import configureStore from './store/configureStore';

const store = configureStore();
const history = useRouterHistory(createHashHistory)({ queryKey: false });

ReactDOM.render(

	<Provider store={store}>

		<Router history={history}>

			<Route path="/" component={App}>

				<IndexRoute component={Home} />
				<Route path="about" component={About} />

			</Route>

		</Router>

	</Provider>

	,

	document.getElementById('root')
);
