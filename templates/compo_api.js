const createTemplate = () => {
    const topHoc = `import hoc from './../hocs/hoc'`
    const bottomExport = `hoc()(MyComponent)`

		const template = `class MyComponent extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
            api: null
        }
	}

    componentDidMount() {
        this.props.api.call('main')
        .then(() => this.setState({api:true}))
        .catch(() => this.setState({api:false}))
    }

	render() {
        if (this.state.api === null) {
            return <div>Api is calling</div>
        }

        if (this.state.api === true) {
            return <div>Api is Linked</div>
        }

        if (this.state.api === false) {
            return <div>Api is not linked, does your express server is running ?</div>
        }
	}
}`

	return `import React from 'react'
${topHoc}

${template}

export default ${bottomExport}`
}

module.exports = createTemplate
