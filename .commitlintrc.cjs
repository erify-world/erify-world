/** ERIFY™ Commitlint config: conventional commits with allowed types.
 * Emoji flair is encouraged but not enforced here.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'ci',
        'docs',
        'style',
        'perf',
        'refactor',
        'test',
      ],
    ],
    'subject-case': [0, 'always'], // allow sentence case + emojis
    'subject-full-stop': [0, 'never'], // no trailing period requirement
    'header-max-length': [2, 'always', 72],
  },
};
