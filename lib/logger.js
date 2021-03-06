import cli from 'cli-format';
import { LOG_LEVEL } from './logLevel';
import styles, { get_rc_logo, get_sweet_banner } from './styles';
import prompt from 'prompt';

prompt.message = " * ";
prompt.delimiter = "";

export class Logger {

  constructor() {
    const cols = Math.max(process.stdout.columns, 60);
    this.format = {
      width: Math.min(120, cols),
      filler: ' ',
      ansi: false,
      justify: false,
      paddingLeft: ' ',
      paddingRight: ' ',
      hangingIndent: '',
      trimStartOfLine: true,
      trimEndOfLine: true,
    }

  }

  async printLogo() {
    const logo = await get_rc_logo();
    this.makeSpace();
    console.log(logo);
    this.makeSpace();
  }

  async printBanner(title) {
    const banner = await get_sweet_banner(title);
    this.makeSpace();
    this._message(banner, {style: 'banner', trimStartOfLine: false });
    this.makeDivider('*', 'muted');
  }

  makeSpace(lines = 1) {
    this._message("\n".repeat(lines));
  }

  makeDivider(char = '*', opts) {
    opts = typeof opts === 'object' ? opts : { style: opts };
    this._message(char, Object.assign({...opts}, { filler: char }));
  }

  message(message, opts = {}) {
    this._message(message, opts);
    this.makeSpace();
  }

  columns(cols, opts = {}) {
    this._columns(cols, opts);
    this.makeSpace();
  }

  _columns(cols, opts = {}) {
    if (cols = this.formatColumns(cols, opts)) {
      console.log(cols);
    }
  }

  _message(message, opts = {}) {
    if (message = this.formatMessage(message, opts)) {
      console.log(message);
    }
  }

  _status(message, level, symbol = ' ') {
    const style = `_status_${level}`;
    this._message(` ${symbol}  ${message}\n`, {paddingLeft: '', hangingIndent: '    ', trimStartOfLine: false, style: style});
  }

  status(message) {
    this._status(message, LOG_LEVEL.info, '✓');
  }

  success(message) {
    this._status(message, LOG_LEVEL.success, '✓');
  }

  warning(message) {
    this._status(message, LOG_LEVEL.warning, '!');
  }

  error(message) {
    this.makeSpace(1);
    this._status('\n', LOG_LEVEL.error);
    this._status(message, LOG_LEVEL.error, 'X');
    this._status('\n', LOG_LEVEL.error);
    this.makeSpace(1);
  }

  formatMessage(message, opts = {}) {
    opts = typeof opts === 'object' ? opts : { style: opts };
    const { style } = opts;
    message = cli.wrap(message, this._applyOpts(opts));
    return this.getStyle(style)(message);
  }

  formatColumns(columns) {
    columns = columns.map(col => {
      col = typeof col === 'object' ? col : {content:col};
      return Object.assign(col, {content: this.formatMessage(col.content, col)});
    });
    return cli.columns.wrap(columns);
  }

  getOpts() {
    return this.format;
  }

  setOpts(o) {
    this.format = this._applyOpts(o);
  }

  _applyOpts(o) {
    const Opts = this.getOpts();
    return Object.assign(
      {...Opts},
      Object
        .keys(o)
        .filter(p => Object.keys(Opts).includes(p))
        .reduce((obj, key) => {
          obj[key] = o[key];
          return obj;
        }, {})
    );
  }

  _getStyles() {
    return Object.assign(
      {...styles},
      {
        banner: message => {
          const opts = { style: 'primary', trimStartOfLine: false, paddingLeft: "", paddingRight: "", justify: false, filler: ''};
          this._message(message, opts);
        },
        h1: message => {
          const outerOpts = { style: 'primary' };
          const innerOpts = { style: 'primary', paddingLeft: "* ", paddingRight: "*", justify: false, filler: ' '};
          this._message("*".repeat(this.format.width - 3), outerOpts);
          this._message(' ', innerOpts);
          this._message(message, innerOpts);
          this._message(' ', innerOpts);
          this._message("*".repeat(this.format.width - 3), outerOpts);
        },
        h2: message => {
          this.makeSpace(1);
          this._message(`\n${message}\n\n`, '_emphasis');
        },
        h3: message => {
          this._message(`\n${message}\n`, '_emphasis_less');
        },
        bullet: message => {
          this._message(`  - ${message}`);
        },
      }
    );
  }

  getStyle(style = '') {
    const styles = this._getStyles();
    return style && Object.keys(styles).includes(style) ?
      styles[style] :
      (string) => string
      ;
  }

  async prompt(schema) {
    schema = typeof schema === 'object' ? schema : { properties: { response: { description: schema }}};
    prompt.start();
    return await prompt.get(schema);
  }

  async promptYN(message = 'Y/N') {
    const schema = {
      properties: {
        response: {
          description: message,
          message: "Enter 'y' or 'n'.",
          pattern: /^(y|n|yes|no|t|f|1|0)$/i,
          before: val => !!val.match(/^(y|yes|t|1)$/i),
        }
      }
    };
    return await this.prompt(schema);
  }

}

export const logger = new Logger();
