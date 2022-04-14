'use strict'
const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')

const { renderTask } = require('../models/renders/task')

const appCrud = require('../app/crud')

const helpers = require('./helpers')

router.use(function (req, res, next) {
  if (typeof req.user === 'undefined') {
    res.status(403).send({ msg: 'Authorization required' })
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
  const tasks = await appCrud.getUsersTasks(req.user.id)

  res.send(tasks.map(renderTask))
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
    res.send(renderTask(task))
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      res.status(400).send({ msg })
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
  const { taskId } = req.params

  try {
    const task = await appCrud.getUsersTaskById(req.user, taskId)
    if (task === null) {
      res.status(422).send({ msg: 'Task not found' })
    } else {
      console.log(task)
      res.send(renderTask(task))
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
  const { taskId } = req.params

  try {
    await appCrud.updateTaskData(req.user.id, taskId, req.body.task)
    res.send()
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      const msg = e.errors.map(x => x.message).join('\n')
      res.status(400).send({ msg })
    } else {
      console.log(e)
      helpers.sendServerError(res)
    }
  }
})

router.delete('/:taskId', async function (req, res) {
  const { taskId } = req.params

  appCrud.deleteTask(taskId)
  res.send()
})

module.exports = router
