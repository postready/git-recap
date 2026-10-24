export interface CommitInfo {
  hash: string;
  date: string;
  author: string;
  subject: string;
}

export interface FetchOptions {
  cwd?: string;
  since?: string;
  until?: string;
  range?: string;
  maxCount?: number;
}

export interface PostReadyUpdatesOutput {
  date: string;
  formattedDate: string;
  title: string;
  summary: string;
  items: string[];
  markdown: string;
  html: string;
}

export declare function parseGitLog(rawOutput: string): CommitInfo[];
export declare function fetchCommits(options?: FetchOptions): CommitInfo[];
export declare function humanizeCommitMessage(subject: string): string;

export declare function formatPostReadyUpdates(
  commits: CommitInfo[],
  options?: { title?: string; summary?: string }
): PostReadyUpdatesOutput;

export declare function formatSocialRecap(
  commits: CommitInfo[],
  options?: { title?: string }
): string;

export declare function formatChangelog(
  commits: CommitInfo[],
  options?: { version?: string }
): string;
