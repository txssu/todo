'use strict'

module.exports = {
  renderTask (task) {
    return {
      task: {
        id: task.id,
        title: task.title,
        isComplete: task.isComplete,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    }
  }
}
