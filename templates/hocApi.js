const createTemplate = () => {
    const template = `import { hocBuilder, domainize } from 'reactizy'
import main from './../reduxers/main'
import api from './../apis/api'
import env from './../env'

let apis = []

if (env.env === 'dev') {
    apis = [domainize('http://localhost:5000/api', api)]
} else {
    apis = [domainize('/api', api)]
}

const hoc = hocBuilder({
	apis,
	reduxers:[main],
	hocs: {},
	thunks: {},
	fusion: [],
	customs: {},
	options: {
		bindAll: false,
		name: 'call'
	}
})

export default hoc`

    return template
}

module.exports = createTemplate
