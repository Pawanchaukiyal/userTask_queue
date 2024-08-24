const cluster = require('cluster');
const os = require('os');
const express = require('express');
const rateLimiter = require('./middleware/rate.middleware');
const taskQueue = require('./queues/taskQueues');
const { taskWorker } = require('./workers/taskWorkers');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on the number of CPU cores
  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });

  taskWorker(); // Start the task worker to process queued tasks
} else {
  const app = express();

  // Middleware to handle JSON parsing errors
  app.use(express.json({
    verify: (req, res, buf, encoding) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        req.jsonParseError = true;
      }
    }
  }));

  // Rate limiting middleware
  app.use('/api/v1/task', rateLimiter);

  // Task route with task counting
  const taskCounter = {};

  app.post('/api/v1/task', (req, res) => {
    // Check if JSON parsing failed
    if (req.jsonParseError) {
      console.error('Error: Malformed JSON or empty body received');
      return res.status(400).json({ error: 'Malformed JSON or empty body' });
    }

    const { user_id } = req.body;

    // Show a message when `user_id` is not provided
    if (!user_id) {
      console.error('Error: User ID is required but not provided.');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Initialize counter if not present
    if (!taskCounter[user_id]) {
      taskCounter[user_id] = 0;
    }

    // Increment counter for the user
    taskCounter[user_id]++;

    // Add task to the queue
    taskQueue.addTask(user_id)
      .then(() => {
        // Send response with task count
        res.status(202).json({ message: `Task queued for user ${user_id}. Count: ${taskCounter[user_id]}` });
      })
      .catch((error) => {
        console.error('Error adding task to the queue:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      });
  });

  // Error-handling middleware to catch unexpected errors
  app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
}
