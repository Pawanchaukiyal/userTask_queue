const Redis = require('ioredis');
const redis = new Redis();

class TaskQueue {
  // Method to add a task to the queue for a specific user
  async addTask(user_id) {
    try {
      const taskData = JSON.stringify({ user_id, timestamp: Date.now() });
      const result = await redis.lpush(`tasks:${user_id}`, taskData);
      
      // Optional: Check if the operation was successful
      if (result === 0) {
        throw new Error('Failed to add task to the queue');
      }
    } catch (error) {
      console.error(`Error adding task for user ${user_id}:`, error.message);
      // Handle the error as needed (e.g., retry logic, logging, etc.)
      throw error; // Re-throw the error to be handled by the caller if necessary
    }
  }

  // Method to retrieve the next task for a specific user
  async getNextTask(user_id) {
    try {
      const taskData = await redis.rpop(`tasks:${user_id}`);
      
      if (!taskData) {
        // Handle the case where there are no tasks in the queue
        console.warn(`No tasks found for user ${user_id}`);
        return null;
      }

      return JSON.parse(taskData);
    } catch (error) {
      console.error(`Error retrieving next task for user ${user_id}:`, error.message);
      // Handle the error as needed (e.g., retry logic, logging, etc.)
      throw error; // Re-throw the error to be handled by the caller if necessary
    }
  }
}

module.exports = new TaskQueue();
