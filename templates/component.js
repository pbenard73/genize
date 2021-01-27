const createTemplate = data => {
	const hoc = data.hocName
	const hasHoc = hoc.trim() !== ''

	const topHoc = hasHoc === true ? `import ${hoc} from './../hocs/${hoc}'` : ''
	const bottomExport = hasHoc === true ? `${hoc}()(${data.name})` : data.name
	let template = ''

	if (data.isClass === true) {
		template = `class ${data.name} extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	render() {
		return <div>${data.name}</div>
	}
}`
	} else {
		template = `const ${data.name} = props => {
	return <div>${data.name}</div>
}`
	}

	return `import React from 'react'
${topHoc}

${template}

export default ${bottomExport}`
}

module.exports = createTemplate
