const createTemplate = () => {
    const template = `import { domainize } from 'reactizy'
import hookBuilder from 'reactizy/core/hookBuilder'
import main from './../reduxers/main'
import api from './../apis/api'
import env from './../env'

let apis = []

if (env.env === 'dev') {
    apis = [domainize(\`$\{env.api}/api\`, api)]
} else {
    apis = [domainize('/api', api)]
}

const useReactizy = hookBuilder({
	apis,
	reduxers:[main],
	options: {
		bindAll: false,
		name: 'call'
	}
})

export default useReactizy`

    return template
}

module.exports = createTemplate
