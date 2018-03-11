/* eslint-disable
  multiline-ternary,
*/
import path from 'path';
import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import schema from './options.json';

export default function loader(content) {
  if (!this.emitFile) throw new Error('File Loader\n\nemitFile is required from module system');

  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, 'File Loader');

  const context = options.context || this.rootContext || (this.options && this.options.context);

  const url = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp,
  });

  let outputPath = url;

  if (options.outputPath) {
    if (typeof options.outputPath === 'function') {
      outputPath = options.outputPath(url);
    } else {
      outputPath = path.posix.join(options.outputPath, url);
    }
  }

  const issuerPath = options.context
    ? context
    : (
      this._module &&
      this._module.issuer &&
      this._module.issuer.context
    );


  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

  // use relative public path
  if (options.relative === undefined || options.relative) {
    publicPath = path.relative(issuerPath, path.resolve(context, outputPath))
      .split(path.sep)
      .join('/');
    publicPath = JSON.stringify(publicPath);
  }

  if (options.emitFile === undefined || options.emitFile) {
    this.emitFile(outputPath, content);
  }
  // TODO revert to ES2015 Module export, when new CSS Pipeline is in place
  return `module.exports = ${publicPath};`;
}

export const raw = true;
