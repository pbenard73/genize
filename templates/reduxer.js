const createTemplate = data => {
	const name = data.name[0].toUpperCase() + data.name.substr(1)
	const template = `import { staty } from 'reactizy'

class ${name} {
	state = {
	}

	actions = {
	}
}

export default new ${name}()`

	return template
}

module.exports = createTemplate
