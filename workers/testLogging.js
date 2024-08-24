// Create this file just to check Log is working properly or not

const fs = require('fs').promises;
const path = require('path');
const taskLogPath = path.join(__dirname, '../../logs/task.log');

async function testLogging() {
  try {
    // Simulate task completion
    const userId = 'testUser';
    await fs.appendFile(taskLogPath, `${userId} - Task completed at - ${new Date().toISOString()}\n`);

    // Read the log file
    const logContent = await fs.readFile(taskLogPath, 'utf8');

    // Check if the log content includes the test entry
    if (logContent.includes(userId)) {
      console.log('Logging test passed.');
    } else {
      console.error('Logging test failed: Entry not found.');
    }
  } catch (error) {
    console.error('Error during logging test:', error.message);
  }
}

testLogging();
