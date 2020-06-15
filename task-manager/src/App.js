import React from 'react'
import Footer from './components/Footer'
import AddTodo from './containers/AddTodo'
import VisibleTodoList from './containers/VisibleTodoList'
import './index.css'

const App = () => (
  <div className="application">
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

export default App