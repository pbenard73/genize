module.exports = `import React from 'react'
import { Link } from 'react-router-dom'
import logo from "./../logo.svg"
import MyComponent from './../components/MyComponent'

const Home = () => (
  <>
      <img src={logo} className='App-logo' alt='logo' />
      <MyComponent />
      <p>
    Edit <code>src/App.js</code> and save to reload.
      </p>
      <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
    Learn React
      </a>
      <p><Link to="/other">Go to other Page</Link></p>
  </>
)

export default Home`
