module.exports = `import React from 'react'
import hoc from './../hocs/hoc'
import { Link } from 'react-router-dom'

class Other extends React.Component {
	render() {
		return (
			<>
			    <h1>It is another Page</h1>
			    <p><Link to="/">Go to Home Page</Link></p>
			</>
		)
	}
}

export default hoc()(Other)`
