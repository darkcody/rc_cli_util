import cliProgress from 'cli-progress';
import { colors } from  './styles';
import chalk from 'chalk';

export class ProgressBar {
  constructor() {
    this.bar = new cliProgress.SingleBar({
      format: chalk.hex(colors.muted)('{bar}') + ' | {percentage}%',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
  }

  start() {
    this.bar.start();
  }

  increment() {
    this.bar.increment();
  }

  update(progress) {
    this.bar.update(progress);
  }

  stop() {
    this.bar.stop();
  }

}