module.exports = `import { Store } from "reactizy"
import MyComponent from "./components/MyComponent"
import useReactizy from './hooks/useReactizy'
import logo from "./logo.svg"
import "./App.css"

function App() {
    return (
        <Store pool={[useReactizy]}>
            <div className='App'>
                <header className='App-header'>
                    <img src={logo} className='App-logo' alt='logo' />
                    <MyComponent />
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
                        Learn React
                    </a>
                </header>
            </div>
        </Store>
    )
}

export default App`
