import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Helper for toast notifications
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. READ: Fetch all tasks on mount
  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (HTTP ${response.status})`);
      }
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setTasks(result.data);
      } else {
        throw new Error(result.message || 'Failed to load tasks data');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(
        'Could not connect to the backend server. Make sure the Node/Express backend is running on port 5000 and MongoDB is active.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. CREATE: Add new task
  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create task');
      }

      // Real-time local state update
      setTasks((prevTasks) => [result.data, ...prevTasks]);
      showToast('Task created successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Create task error:', err);
      showToast(err.message, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. UPDATE: Update existing task details
  const handleUpdateTask = async (taskData) => {
    if (!editingTask || !editingTask._id) return false;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update task');
      }

      // Real-time local state update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === editingTask._id ? result.data : task
        )
      );
      setEditingTask(null);
      showToast('Task updated successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Update task error:', err);
      showToast(err.message, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Change from card/table dropdown
  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update task status');
      }

      // Real-time local state update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? result.data : task
        )
      );
      showToast(`Task moved to ${newStatus}`, 'info');
    } catch (err) {
      console.error('Status change error:', err);
      showToast(err.message, 'error');
    }
  };

  // 4. DELETE: Remove task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete task');
      }

      // Real-time local state update
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      if (editingTask && editingTask._id === taskId) {
        setEditingTask(null);
      }
      showToast('Task deleted successfully', 'success');
    } catch (err) {
      console.error('Delete task error:', err);
      showToast(err.message, 'error');
    }
  };

  const handleStartEdit = (task) => {
    setEditingTask(task);
    // Smooth scroll to form
    const formElement = document.getElementById('task-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Dynamic Dashboard Stats Calculation
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-app">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="logo-badge">📋</div>
          <div>
            <h1 className="header-title">TaskFlow Dashboard</h1>
            <p className="header-subtitle">
              Interactive Dynamic Task Management Platform • MERN Stack
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-reload"
            onClick={fetchTasks}
            disabled={isLoading}
            title="Refresh Tasks from Backend"
          >
            🔄 {isLoading ? 'Syncing...' : 'Sync Tasks'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-content">
        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card stat-total">
            <div className="stat-icon">📑</div>
            <div className="stat-info">
              <span className="stat-label">Total Tasks</span>
              <strong className="stat-value">{totalTasks}</strong>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <span className="stat-label">Pending</span>
              <strong className="stat-value">{pendingTasks}</strong>
            </div>
          </div>

          <div className="stat-card stat-progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <span className="stat-label">In Progress</span>
              <strong className="stat-value">{inProgressTasks}</strong>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">{completedTasks}</strong>
            </div>
          </div>

          {/* Progress Bar Widget */}
          <div className="stat-card stat-rate">
            <div className="stat-info progress-summary">
              <div className="rate-text-row">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-rate-percent">{completionPercentage}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Backend Error Alert if any */}
        {error && (
          <div className="alert-banner alert-warning">
            <div className="alert-content">
              <strong>Backend Connection Notice:</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={fetchTasks}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Two-Column Responsive Layout: Form on Side / Top, Tasks on Main */}
        <div className="dashboard-grid">
          {/* Task Form Column */}
          <aside id="task-form-section" className="form-column">
            <TaskForm
              onSubmitTask={editingTask ? handleUpdateTask : handleCreateTask}
              editingTask={editingTask}
              onCancelEdit={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          </aside>

          {/* Task List / Board Column */}
          <section className="tasks-column">
            {isLoading && tasks.length === 0 ? (
              <div className="loading-card">
                <div className="spinner"></div>
                <p>Loading dashboard tasks from server...</p>
              </div>
            ) : (
              <TaskList
                tasks={tasks}
                onStartEdit={handleStartEdit}
                onDeleteTask={handleDeleteTask}
                onQuickStatusChange={handleQuickStatusChange}
              />
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Interactive Dynamic Task Dashboard Platform • React.js &amp; Express.js</p>
      </footer>
    </div>
  );
}

export default App;
