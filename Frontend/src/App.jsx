import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchTasks();
    } else {
      localStorage.removeItem('token');
    }
  }, [token, statusFilter, page]);

  const fetchTasks = async () => {
    try {
      let url = `${API}/tasks?page=${page}&limit=5`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(res.data.tasks);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering ? { username, email, password } : { email, password };
      const res = await axios.post(`${API}${endpoint}`, payload);
      if (isRegistering) {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        setToken(res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication error');
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await axios.post(`${API}/tasks`, { title, description, priority }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleAuth}>
          {isRegistering && (
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <p onClick={() => setIsRegistering(!isRegistering)} style={{ color: 'blue', cursor: 'pointer', marginTop: '10px' }}>
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Task Dashboard</h2>
        <button onClick={() => setToken('')} style={{ background: '#dc3545' }}>Logout</button>
      </div>

      <form onSubmit={createTask} style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
        <h3>Add New Task</h3>
        <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>Filter Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div style={{ marginTop: '20px' }}>
        {tasks.map(task => (
          <div key={task._id} className="task-card">
            <div>
              <h4>{task.title} [{task.priority}]</h4>
              <p>{task.description}</p>
              <small>Status: <strong>{task.status}</strong></small>
            </div>
            <div>
              <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button onClick={() => deleteTask(task._id)} style={{ background: '#dc3545', marginLeft: '10px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {pages || 1}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}