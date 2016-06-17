import React from 'react';
// import styles from './App.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import actions from './store/actions';

class App extends React.Component {

	constructor(props) {

		super(props);
		this.state = { test: 'foo' };

	}

	render() {

		return (

			<div>

				<p>The application object.</p>

				{this.props.children}

			</div>

		);

	}

}

const types = React.PropTypes;

App.propTypes = {
	people: types.array.isRequired,
	actions: types.object.isRequired,
	children: types.any
};

function mapStateToProps(state) {

	return {
		people: state.people
	};

}

function mapDispatchToProps(dispatch) {

	return {
		actions: {
			people: bindActionCreators(actions.people, dispatch)
		}

	};

}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App);
