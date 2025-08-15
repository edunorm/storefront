import { config as base } from '@edunorm/eslint-config/base';
import ts from 'typescript-eslint';

export default ts.config(
  ...base
);

