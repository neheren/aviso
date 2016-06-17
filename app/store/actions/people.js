export function addPerson(person = { name: 'Anonymous', birthyear: 1980 }) {

	return { type: 'addPerson', data: person };

}

export function addDelayed(person = { name: 'Anonymous', birthyear: 1980 }) {

	return dispatch => {

		setTimeout(() => dispatch({ type: 'addPerson', data: person }), 4000);

	};

}
