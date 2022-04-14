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

/**
 *  @openapi
 *  components:
 *    schemas:
 *      Task:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          title:
 *            type: string
 *          isComplete:
 *            type: boolean
 *          createdAt:
 *            type: string
 *            format: date
 *          updatedAt:
 *            type: string
 *            format: date
 *      NewTask:
 *        type: object
 *        properties:
 *          title:
 *            required: true
 *            type: string
 *    parameters:
 *      taskId:
 *        name: taskId
 *        in: path
 *        required: true
 *        schema:
 *          type: integer
 */

/**
 *  @openapi
 *  /tasks:
 *    get:
 *      description: Get all user's tasks
 *      responses:
 *        200:
 *          description: Returns array of tasks
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Task'
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.get('/', async function (req, res) {
  const tasks = await appCrud.getUsersTasks(req.user.id)

  res.send(tasks.map(renderTask))
})

/**
 *  @openapi
 *  /tasks:
 *    post:
 *      description: Create new task
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                task:
 *                  $ref: '#/components/schemas/NewTask'
 *      responses:
 *        200:
 *          description: Returns created task
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Task'
 *        422:
 *          description: The data failed to be validated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
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

/**
 *  @openapi
 *  /tasks/{taskId}:
 *    get:
 *      description: Get task info by its id
 *      parameters:
 *        - $ref: '#/components/parameters/taskId'
 *      responses:
 *        200:
 *          description: Returns task
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Task'
 *        404:
 *          description: There is no task with this ID
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.get('/:taskId', async function (req, res) {
  const { taskId } = req.params

  try {
    const task = await appCrud.getUsersTaskById(req.user, taskId)
    if (task === null) {
      res.status(404).send({ msg: 'Task not found' })
    } else {
      console.log(task)
      res.send(renderTask(task))
    }
  } catch (e) {
    console.log(e)
    helpers.sendServerError(res)
  }
})

/**
 *  @openapi
 *  /tasks/{taskId}:
 *    put:
 *      description: Change task title and complete status
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                task:
 *                  type: object
 *                  properties:
 *                    title:
 *                      type: string
 *                    isComplete:
 *                      type: boolean
 *      parameters:
 *        - $ref: '#/components/parameters/taskId'
 *      responses:
 *        200:
 *          description: Task updated or nothing changed
 *        500:
 *          $ref: '#/components/responses/ServerError'
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

/**
 *  @openapi
 *  /tasks/{taskId}:
 *    delete:
 *      description: Delete task
 *      parameters:
 *        - $ref: '#/components/parameters/taskId'
 *      responses:
 *        200:
 *          description: Task deleted ot nothing changed
 *        500:
 *          $ref: '#/components/responses/ServerError'
 */
router.delete('/:taskId', async function (req, res) {
  const { taskId } = req.params

  appCrud.deleteTask(taskId)
  res.send()
})

module.exports = router
