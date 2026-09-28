import { useState, useEffect } from 'react';

function TaskForm({ onSubmitTask, editingTask, onCancelEdit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Pending',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'Medium',
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split('T')[0]
          : '',
        status: editingTask.status || 'Pending',
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Pending',
      });
      setErrors({});
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 120) {
      newErrors.title = 'Title cannot exceed 120 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
    };

    const success = await onSubmitTask(payload);
    if (success && !editingTask) {
      // Reset form if creating new task
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Pending',
      });
      setErrors({});
    }
  };

  return (
    <div className="task-form-card">
      <div className="form-header">
        <div className="form-header-title">
          <span className="form-icon">{editingTask ? '✏️' : '➕'}</span>
          <h3>{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
        </div>
        {editingTask && (
          <button
            type="button"
            className="btn-text cancel-btn"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            ✕ Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Implement user authentication..."
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting}
            maxLength={120}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className="form-textarea"
            placeholder="Provide context, acceptance criteria, or relevant links..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Priority, Due Date, Status Row */}
        <div className="form-row">
          {/* Priority */}
          <div className="form-group col">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟠 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group col">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="Pending">⏳ Pending</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value="Completed">✅ Completed</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="form-group col">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {editingTask ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Task...' : '➕ Add Task'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
