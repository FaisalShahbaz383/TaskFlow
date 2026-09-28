import { useState } from 'react';

function TaskList({ tasks, onStartEdit, onDeleteTask, onQuickStatusChange }) {
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'table'
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  // Categorized tasks for board view
  const categories = [
    { key: 'Pending', label: 'Pending', icon: '⏳', colorClass: 'status-pending' },
    { key: 'In Progress', label: 'In Progress', icon: '⚡', colorClass: 'status-inprogress' },
    { key: 'Completed', label: 'Completed', icon: '✅', colorClass: 'status-completed' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
        return 'badge-priority-low';
      default:
        return 'badge-priority-medium';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'badge-status-pending';
      case 'In Progress':
        return 'badge-status-inprogress';
      case 'Completed':
        return 'badge-status-completed';
      default:
        return 'badge-status-pending';
    }
  };

  return (
    <div className="task-list-container">
      {/* Controls Bar */}
      <div className="task-controls-bar">
        <div className="search-filter-group">
          {/* Search Input */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks by title or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="filter-wrapper">
            <label htmlFor="priority-filter" className="filter-label">
              Priority:
            </label>
            <select
              id="priority-filter"
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟠 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle-group">
          <button
            type="button"
            className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
            onClick={() => setViewMode('board')}
            title="Categorized Status Board View"
          >
            📋 Board View
          </button>
          <button
            type="button"
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            📊 Table View
          </button>
        </div>
      </div>

      {/* Main Content: Board View or Table View */}
      {viewMode === 'board' ? (
        /* Categorized Status Board Layout */
        <div className="status-board-grid">
          {categories.map((cat) => {
            const catTasks = filteredTasks.filter(
              (task) => task.status === cat.key
            );

            return (
              <div key={cat.key} className={`status-column ${cat.colorClass}`}>
                <div className="column-header">
                  <div className="column-title">
                    <span className="column-icon">{cat.icon}</span>
                    <h4>{cat.label}</h4>
                  </div>
                  <span className="task-count-pill">{catTasks.length}</span>
                </div>

                <div className="column-cards">
                  {catTasks.length === 0 ? (
                    <div className="empty-column-state">
                      <p>No {cat.label.toLowerCase()} tasks</p>
                    </div>
                  ) : (
                    catTasks.map((task) => {
                      const overdue = isOverdue(task.dueDate, task.status);
                      const formattedDue = formatDate(task.dueDate);
                      const formattedCreated = formatDate(task.createdAt);

                      return (
                        <div
                          key={task._id}
                          className={`task-card ${
                            overdue ? 'task-card-overdue' : ''
                          }`}
                        >
                          <div className="card-top">
                            <span
                              className={`badge ${getPriorityBadgeClass(
                                task.priority
                              )}`}
                            >
                              {task.priority} Priority
                            </span>
                            <div className="card-actions">
                              <button
                                type="button"
                                className="action-icon-btn edit"
                                title="Edit Task"
                                onClick={() => onStartEdit(task)}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="action-icon-btn delete"
                                title="Delete Task"
                                onClick={() => onDeleteTask(task._id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <h4 className="task-title">{task.title}</h4>

                          {task.description && (
                            <p className="task-description">
                              {task.description}
                            </p>
                          )}

                          <div className="card-meta">
                            {formattedDue && (
                              <div
                                className={`meta-item ${
                                  overdue ? 'meta-overdue' : ''
                                }`}
                              >
                                <span>📅 Due: {formattedDue}</span>
                                {overdue && (
                                  <span className="overdue-tag">Overdue</span>
                                )}
                              </div>
                            )}
                            {formattedCreated && (
                              <div className="meta-item created-date">
                                <span>🕒 Added: {formattedCreated}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Status Shift */}
                          <div className="card-footer">
                            <label className="quick-status-label">
                              Move status:
                            </label>
                            <select
                              className="quick-status-select"
                              value={task.status}
                              onChange={(e) =>
                                onQuickStatusChange(task._id, e.target.value)
                              }
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="In Progress">⚡ In Progress</option>
                              <option value="Completed">✅ Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Responsive Table Layout */
        <div className="table-responsive-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-table-state">
              <p>No tasks found matching your filter criteria.</p>
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title & Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const formattedDue = formatDate(task.dueDate);
                  const formattedCreated = formatDate(task.createdAt);

                  return (
                    <tr key={task._id} className="task-table-row">
                      <td className="task-title-cell">
                        <strong className="table-task-title">
                          {task.title}
                        </strong>
                        {task.description && (
                          <div className="table-task-desc">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          className={`table-status-select ${getStatusBadgeClass(
                            task.status
                          )}`}
                          value={task.status}
                          onChange={(e) =>
                            onQuickStatusChange(task._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className={`badge ${getPriorityBadgeClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        {formattedDue ? (
                          <span
                            className={
                              overdue ? 'due-overdue-text' : 'due-normal-text'
                            }
                          >
                            {formattedDue} {overdue && '⚠️'}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-muted">
                        {formattedCreated || '—'}
                      </td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-sm btn-edit"
                            onClick={() => onStartEdit(task)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-delete"
                            onClick={() => onDeleteTask(task._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskList;
