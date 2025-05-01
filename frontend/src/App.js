import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TodoList from './artifacts/contracts/TodoList.sol/TodoList.json';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const todoContract = new ethers.Contract(contractAddress, TodoList.abi, signer);
          setContract(todoContract);

          loadTodos(todoContract);
        } catch (error) {
          console.error("Error initializing:", error);
          alert("Error initializing: " + error.message);
        }
      }
    };

    init();
  }, []);

  const loadTodos = async (todoContract) => {
    try {
      const userTodos = await todoContract.getUserTodos();
      const todoDetails = await Promise.all(
        userTodos.map(async (todoId) => {
          const todo = await todoContract.getTodo(todoId);
          return {
            id: todoId.toNumber(),
            content: todo.content,
            isCompleted: todo.isCompleted,
            timestamp: new Date(todo.timestamp.toNumber() * 1000).toLocaleString()
          };
        })
      );
      setTodos(todoDetails);
    } catch (error) {
      console.error("Error loading todos:", error);
      alert("Error loading todos: " + error.message);
    }
  };

  const createTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      setLoading(true);
      const tx = await contract.createTodo(newTodo);
      await tx.wait();
      setNewTodo('');
      loadTodos(contract);
      alert("Todo created successfully!");
    } catch (error) {
      console.error("Error creating todo:", error);
      alert("Error creating todo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todoId) => {
    try {
      setLoading(true);
      const tx = await contract.toggleTodo(todoId);
      await tx.wait();
      loadTodos(contract);
    } catch (error) {
      console.error("Error toggling todo:", error);
      alert("Error toggling todo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      setLoading(true);
      const tx = await contract.deleteTodo(todoId);
      await tx.wait();
      loadTodos(contract);
      alert("Todo deleted successfully!");
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Error deleting todo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Blockchain Todo List</h1>
        <p>Connected Account: {account}</p>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createTodo()}
          />
          <button
            className="add-button"
            onClick={createTodo}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Todo'}
          </button>
        </div>

        <div className="todo-list">
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <div className="todo-content">
                <button
                  className={`toggle-button ${todo.isCompleted ? 'completed' : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                  disabled={loading}
                >
                  {todo.isCompleted ? "✓" : "○"}
                </button>
                <span className={todo.isCompleted ? 'completed-text' : ''}>
                  {todo.content}
                </span>
              </div>
              <div className="todo-actions">
                <span className="timestamp">{todo.timestamp}</span>
                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
