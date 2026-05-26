'use strict';

/**
 * 支持的 type 有：
 *
 *  [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test]
 *
 * example: git commit -m 'feat: add commitlint'
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'subject-case': [0],
    'scope-case': [0],
  },
};
