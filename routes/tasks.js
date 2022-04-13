'use strict'
const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')

const { renderTask } = require('./renders/task')

const appCrud = require('../app/crud')

const helpers = require('./helpers')

router.use(function (req, res, next) {
  if (typeof req.user === 'undefined') {
    helpers.sendError(res, 422, { msg: 'Authorization required' })
    return
  }
  next()
})

/*
  GET / - get all user's tasks

  POST / - create new task
    params: {task: {title}}

  GET /:taskId - get task by id

  PUT /:taskId - change task data
    params: {task: {title, isComplete}}

  DELETE /:taskId - delete task
*/

/*
  Get all tasks
*/
router.get('/', async function (req, res) {
  const user = req.user

  const tasks = await user.getTasks()

  helpers.sendOk(res, tasks.map(renderTask))
})

/*
  Create new task
  Required fields: description
*/
router.post('/', async function (req, res) {
  try {
    const taskData = req.body.task
    taskData.userId = req.user.id
    const task = await appCrud.createTask(taskData)
    helpers.sendOk(res, renderTask(task))
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      helpers.sendError(res, 422, { msg })
    } else {
      console.log(e)
      helpers.sendServerError(res)
    }
  }
})

/*
  Get task by id
*/
router.get('/:taskId', async function (req, res) {
  let { taskId } = req.params

  try {
    const task = await appCrud.getUsersTaskById(req.user, taskId)
    if (task === null) {
      helpers.sendError(res, 422, { msg: 'Task not found' })
    } else {
      console.log(task)
      helpers.sendOk(res, renderTask(task))
    }
  } catch (e) {
    console.log(e)
    helpers.sendServerError(res)
  }
})

/*
  Update task's data
*/
router.put('/:taskId', async function (req, res) {
  let { taskId } = req.params

  try {
    await appCrud.updateTaskData(req.user, taskId, req.body.task)
    helpers.sendOk(res, {})
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      helpers.sendError(res, 422, { msg })
    } else {
      console.log(e)
      helpers.sendServerError(res)
    }
  }
})

router.delete('/:taskId', async function (req, res) {
  let { taskId } = req.params

  appCrud.deleteTask(taskId)
  helpers.sendOk(res, {})
})

module.exports = router
