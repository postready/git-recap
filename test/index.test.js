import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitLog, humanizeCommitMessage, formatPostReadyUpdates, formatSocialRecap, formatChangelog } from '../src/index.js';

test('parseGitLog parses custom formatted git logs and filters noise', () => {
  const sample = `
abc1234|2026-10-23|eco-null|feat(export): add one-click pdf export
def5678|2026-10-23|eco-null|fix: prevent layout shift on mobile
1112223|2026-10-23|eco-null|chore(release): bump version to 1.1.0
4445556|2026-10-23|eco-null|Merge pull request #12 from branch
7778889|2026-10-23|eco-null|docs: update installation instructions
`;

  const parsed = parseGitLog(sample);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].hash, 'abc1234');
  assert.equal(parsed[0].subject, 'feat(export): add one-click pdf export');
  assert.equal(parsed[1].subject, 'fix: prevent layout shift on mobile');
  assert.equal(parsed[2].subject, 'docs: update installation instructions');
});

test('humanizeCommitMessage converts conventional commits into clean customer prose', () => {
  assert.equal(
    humanizeCommitMessage('feat(editor): allow multi-column drag and drop (#42)'),
    'Allow multi-column drag and drop.'
  );
  assert.equal(
    humanizeCommitMessage('fix: resolve session token expiration loop'),
    'Resolve session token expiration loop.'
  );
});

test('formatPostReadyUpdates returns valid structured object with HTML and Markdown', () => {
  const commits = [
    { hash: '123', date: '2026-10-23', author: 'eco-null', subject: 'feat: add dark mode preview' },
    { hash: '456', date: '2026-10-23', author: 'eco-null', subject: 'fix: align button typography' }
  ];

  const result = formatPostReadyUpdates(commits, { title: 'October Polish Release' });
  assert.equal(result.title, 'October Polish Release');
  assert.equal(result.items.length, 2);
  assert.ok(result.markdown.includes('###'));
  assert.ok(result.html.includes('<details class="group'));
  assert.ok(result.html.includes('<li>Add dark mode preview.</li>'));
});

test('formatSocialRecap produces post ready for X and LinkedIn', () => {
  const commits = [
    { hash: '123', date: '2026-10-23', author: 'eco-null', subject: 'feat: add dark mode preview' }
  ];
  const social = formatSocialRecap(commits);
  assert.ok(social.includes('What we shipped recently'));
  assert.ok(social.includes('https://postready.org'));
});
