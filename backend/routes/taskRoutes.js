const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (with optional status or priority filtering)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      status: status || 'Pending',
      createdAt: new Date(),
    });

    const savedTask = await newTask.save();
    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating task',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const { title, description, priority, dueDate, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (status !== undefined) updateData.status = status;

    if (updateData.title === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while updating task',
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: deletedTask._id },
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
      error: error.message,
    });
  }
});

module.exports = router;
