import chalk from 'chalk';

// Responsible for adding tag and color to the consoles written by application for easy reading
const originalConsoleLog: (...args: unknown[]) => void = console.log;
console.log = (...args: unknown[]) => {
  originalConsoleLog(chalk.bgMagentaBright.black('APP: '), ...args);
};
