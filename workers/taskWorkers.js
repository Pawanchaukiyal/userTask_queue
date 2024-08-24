const taskQueue = require('../queues/taskQueues');
const fs = require('fs').promises;
const path = require('path');
const Redis = require('ioredis');
const redis = new Redis();

const taskLogPath = path.join(__dirname, '../../logs/task.log');

// Helper function to ensure the log directory exists
async function ensureLogDirectory() {
  const logDir = path.dirname(taskLogPath);
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error(`Error creating log directory: ${error.message}`);
    throw error; // Re-throw to ensure the error is handled by the caller
  }
}

// Function to append a log message to the file
async function logTaskCompletion(user_id) {
  try {
    await ensureLogDirectory(); // Ensure directory exists
    const logMessage = `${user_id} - Task completed at - ${new Date().toISOString()}\n`;
    await fs.appendFile(taskLogPath, logMessage);
  } catch (error) {
    console.error(`Error logging task for user ${user_id}: ${error.message}`);
    // Handle the error as needed, e.g., retry logic, notify admin, etc.
  }
}

// Worker function to process tasks
async function taskWorker() {
  setInterval(async () => {
    try {
      const keys = await redis.keys('tasks:*');
      
      for (const key of keys) {
        const user_id = key.split(':')[1];
        const taskData = await taskQueue.getNextTask(user_id);

        if (taskData) {
          await logTaskCompletion(taskData.user_id);
        }
      }
    } catch (error) {
      console.error('Error processing tasks:', error.message);
      // Handle the error as needed, e.g., log the error, alert the admin, etc.
    }
  }, 1000); // Process one task per second per user
}

module.exports = { taskWorker };
