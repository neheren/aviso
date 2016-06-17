const initialState = [{
	name: 'Kristian Videmark Parkov',
	birthyear: 1980
}];

const reducers = {

	addPerson: function(state, action) {

		const people = state.slice();

		people.push(action.data);

		return people;

	}

};

export default function(state = initialState, action) {

	if (action.type in reducers) {

		return reducers[action.type](state, action);

	}

	return state;

}
