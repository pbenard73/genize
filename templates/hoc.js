const createTemplate = data => {
    const name = data.name
    const reduxer =
        data.reduxers === undefined
            ? ""
            : `import ${data.reduxers} from './../reduxers/${data.reduxers}'
`

    const template = `import { hocBuilder } from 'reactizy'
${reduxer}
const ${name} = hocBuilder({
	apis: [],
	reduxers:[${data.reduxers || ""}],
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
