# Node.js API Cluster with Rate Limiting and Task Queueing

## Overview

This project demonstrates a Node.js API cluster with two replica sets, equipped with a rate-limiting mechanism and a task queueing system. The API is designed to handle tasks with specific rate limits and process them efficiently. It includes:

- **Rate Limiting**: Enforces limits on the number of tasks a user can perform per second and per minute.
- **Task Queueing**: Manages tasks using a Redis-based queue, ensuring tasks are processed in accordance with rate limits.
- **Logging**: Records task completions with timestamps in a log file.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server-side application.
- **Express**: Web framework for handling HTTP requests and responses.
- **Redis**: In-memory data structure store used for task queueing.
- **Cluster Module**: Provides support for creating a Node.js cluster to improve performance and reliability.
- **Rate Limiter**: Middleware to enforce rate limits on API requests.
- **File System**: For logging task completions to a file.

## Project Structure

- **`index.js`**: The main entry point of the application. It sets up the Node.js cluster, handles routing, and integrates middleware.
- **`taskQueues.js`**: Contains the logic for adding and retrieving tasks from the Redis queue.
- **`rate.middleware.js`**: Implements the rate-limiting middleware to control the rate of API requests.
- **`taskWorkers.js`**: Defines the task processing logic and handles logging task completions.


