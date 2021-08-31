module.exports = `import { Store } from "reactizy"
import Home from './pages/Home'
import Page from './pages/Other'
import { Switch, Route } from 'react-router-dom'
import useReactizy from './hooks/useReactizy'
import logo from "./logo.svg"
import "./App.css"

function App() {
    return (
        <Store pool={[useReactizy]}>
          <div className='App'>
            <header className='App-header'>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/other" exact component={Page} />
              <Route><h1>Not Found</h1></Route>
            </Switch>
            </header>
          </div>
        </Store>
    )
}

export default App`
