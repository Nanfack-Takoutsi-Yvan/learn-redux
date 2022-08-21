// Constants
const ADD_TODO = 'ADD_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const ADD_GOAL = 'ADD_GOAL'
const REMOVE_GOAL = 'REMOVE_GOAL'
const RECEIVE_DATA = 'RECEIVE_DATA'

// Utils functions
function addTodoAction (todo) {
  return {
    type: ADD_TODO,
    todo
  }
}

function removeTodoAction(id) {
  return {type: REMOVE_TODO,
  id}
}

function toggleTodoAction(id) {
  return {
    type: TOGGLE_TODO,
    id
  }
}

function addGoalAction(goal) {
  return {
    type: ADD_GOAL,
    goal
  }
}

function removeGoalAction (id) {
  return {
    type: REMOVE_GOAL,
    id
  }
}

function receiveDataAction (todos, goals) {
  return {
    type: RECEIVE_DATA,
    todos,
    goals
  }
}

function handleInitialData() {
  return (dispatch) => {
    return Promise.all([
      API.fetchTodos(),
      API.fetchGoals()
    ]).then(([ todos, goals ]) => {
      dispatch(receiveDataAction(todos, goals))
    })
  }
}

function handleRemoveTodo (todo) {
  return (dispatch) => {
    dispatch(removeTodoAction(todo.id))

    return API.deleteTodo(todo.id)
      .catch(() => {
        dispatch(addTodoAction(todo))
        alert('An error occured, try again')
      })
  }
}

function handleAddTodo (name, cB) {
  return (dispatch) => {
    return API.saveTodo(name)
      .then((todo) => {
        dispatch(addTodoAction(todo))
        cB()
      })
      .catch(() => {
        alert('An error occured, try again')
      })
  }
}

function handleToggleTodo(todo) {
  return (dispatch) => {
    dispatch(toggleTodoAction(todo.id))

    return API.saveTodoToggle(todo.id)
      .catch(() => {
        dispatch(toggleTodoAction(todo.id))
        alert('An error occured, try again')
      })
  }
}

function handleRemoveGoal (goal) {
  return (dispatch) => {
    dispatch(removeGoalAction(goal.id))

    return API.deleteGoal(goal.id)
      .catch(() => {
        dispatch(addGoalAction(goal))
        alert('An error occured, try again')
      })
  }
}

function handleAddGoal (name, cB) {
  return (dispatch) => {
    return API.saveGoal(name)
      .then((goal) => {
        dispatch(addGoalAction(goal))
        cB()
      })
      .catch(() => {
        alert('An error occured, try again')
      })
  }
}

// Reducers
function todos (state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo])

    case REMOVE_TODO: 
      return state.filter(todo => todo.id !== action.id)

    case TOGGLE_TODO:
      return state.map((todo) => todo.id !== action.id ? todo : Object.assign({}, todo, {complete: !todo.complete}))

    case RECEIVE_DATA: 
      return action.todos

    default: 
      return state

  }
}

function goals (state = [], action) {
  switch (action.type) {
    case ADD_GOAL: 
      return state.concat([action.goal])

    case REMOVE_GOAL: 
      return state.filter(goal => goal.id !== action.id)

    case RECEIVE_DATA: 
      return action.goals

    default: 
      return state
  }
}

function loading (state = true, action) {
  switch(action.type) {
    case RECEIVE_DATA: 
      return false

    default: 
      return state
  }
}

// State manager
function createStore(reducer) {
  let state
  let listeners = []

  const getState = () => state

  const subscribe = (listener) => {
    listeners.push(listener)
    return () => {
      listeners.filter((l) => l !== listener)
    }
  }

  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
  }

  return {
    getState,
    subscribe,
    dispatch
  }
}