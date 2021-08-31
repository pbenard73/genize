const createTemplate = data => {
    const name = data.name
    const reduxer =
        data.reduxers === undefined
            ? ""
            : `import ${data.reduxers} from './../reduxers/${data.reduxers}'
`

    const template = `import hookBuilder from 'reactizy/core/hookBuilder'
${reduxer}
const ${name} = hookBuilder({
	apis: [],
	reduxers:[${data.reduxers || ""}],
	options: {
		bindAll: false,
		name: 'call'
	}
})

export default ${name}`

    return template
}

module.exports = createTemplate
