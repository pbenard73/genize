const createTemplate = data => {
	const name = data.name
	const template = `import { hocBuilder } from 'reactizy'

const ${name} = hocBuilder({
	apis: [],
	reduxers:[],
	hocs: {},
	thunks: {},
	fusion: [],
	customs: {},
	options: {
		bindAll: false,
		name: 'call'
	}
})

export default ${name}`

	return template
}

module.exports = createTemplate
