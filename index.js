// index.js

import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();

const title = gradient.pastel.multiline(`
     ╔═════════════════════════════════════╗
     ║        ✨ Shikara AI ✨             ║
     ╚═════════════════════════════════════╝
`);

const info = boxen(
  `
  ${chalk.bold('Version')}    : ${chalk.cyan('v1.2')}
  ${chalk.bold('Author')}     : ${chalk.green('Rehannn')}
  ${chalk.bold('WhatsApp')}   : ${chalk.yellow('6285256930785')}
  ${chalk.bold('Powered by')} : ${chalk.magenta('Google Gemini')}
  `,
  {
    borderStyle: 'round',
    padding: 1,
    margin: 1,
    borderColor: 'cyan',
    backgroundColor: '#1e1e1e',
    title: 'Information',
    titleAlignment: 'center',
  }
);

console.log(title);
console.log(info);
console.log(chalk.blue('Starting Shikara AI...'));
const child = spawn('node cusbot.js', {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  console.log(chalk.gray(`\n[Shikara AI] Process exited with code ${code}`));
});
