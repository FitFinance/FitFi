# FitFi Backend Documentation

Welcome to the **FitFi Backend**! This guide provides all the necessary steps and information to set up and work with the backend effectively.

---

## Getting Started

To begin, ensure you have the required global dependencies installed. These tools are essential for development, linting, and documentation generation.

---

## Installation Steps

### Install Global Dependencies

Run the following command to install all required global dependencies:

```bash
npm run preinstall
```

#### What is `preinstall`?

The `preinstall` script, defined in the `package.json` file, ensures that all necessary tools are installed globally before proceeding with the main project setup. This step is crucial for maintaining a consistent development environment.

Here is the relevant snippet from `package.json`:

```json
{
  "scripts": {
    "preinstall": "npm i docsify-cli -g && npm i nodemon -g && npm i concurrently -g && npm i eslint -g && npm i prettier -g"
  }
}
```

---

### List of Global Dependencies

Below is a list of the global dependencies installed by the `preinstall` script, along with their purposes:

- **`prettier`**: A code formatter to ensure consistent code style.
- **`eslint`**: A linter for identifying and fixing problems in JavaScript and TypeScript code.
- **`docsify-cli`**: A tool for generating and managing project documentation.
- **`nodemon`**: A utility that automatically restarts the server when file changes are detected during development.
- **`concurrently`**: A tool for running multiple commands simultaneously in a single terminal.

---

## Additional Information

### Why Use Global Dependencies?

Global dependencies are tools that are installed system-wide and can be accessed from any project. They help streamline the development process by providing consistent functionality across different environments.

### How to Verify Installation?

After running the `preinstall` command, you can verify the installation of each dependency by running the following commands:

```bash
prettier --version
eslint --version
docsify --version
nodemon --version
concurrently --version
```

If all commands return version numbers, the dependencies are installed correctly.

---

## Running the Backend

This section explains how to start the backend in both development and production environments.

### Development Mode

To start the backend in development mode, use the following command:

```bash
npm run dev
```

#### What Happens in Development Mode?

- **TypeScript Compiler (`tsc --watch`)**: Watches for changes in TypeScript files and compiles them to JavaScript in real-time.
- **Nodemon**: Automatically restarts the server whenever changes are detected in the compiled JavaScript files.
- **Concurrently**: Runs both the TypeScript compiler and the server watcher simultaneously.

This setup ensures a smooth development experience by automating repetitive tasks.

### Production Mode

To start the backend in production mode, use the following commands:

1. Build the project:

```bash
npm run build
```

This compiles the TypeScript files into JavaScript and places them in the `dist` directory.

2. Start the server:

```bash
npm start
```

#### What Happens in Production Mode?

- The `build` script compiles the TypeScript code into optimized JavaScript files.
- The `start` script runs the compiled server file (`dist/server.js`) using Node.js.

This setup is optimized for running the backend in a production environment.

---

## Troubleshooting Development Commands

If the development commands fail for any reason, you can manually run the required processes in separate terminals. This ensures that both the TypeScript compiler and the server watcher are running correctly.

### Steps to Resolve

1. Open two terminal windows.

2. In the first terminal, run the TypeScript compiler in watch mode:

```bash
tsx --watch
```

3. In the second terminal, start the server using `nodemon`:

```bash
nodemon dist/server.js
```

By running these commands in separate terminals, you can ensure that the development environment functions as expected, even if the `npm run dev` command fails.

---
