const core = require('@actions/core');
const github = require('@actions/github');
const { getCommitMessage } = require('./commit');

jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: { repo: { owner: 'nullplatform', repo: 'github-action-build' } },
}));

describe('getCommitMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null when github-token input is empty', async () => {
    core.getInput.mockReturnValue('');

    const result = await getCommitMessage('abc123');

    expect(result).toBeNull();
    expect(github.getOctokit).not.toHaveBeenCalled();
  });

  test('returns the commit message from the GitHub API', async () => {
    core.getInput.mockReturnValue('token');
    const getCommit = jest.fn().mockResolvedValue({ data: { message: 'feat: hello' } });
    github.getOctokit.mockReturnValue({ rest: { git: { getCommit } } });

    const result = await getCommitMessage('abc123');

    expect(result).toBe('feat: hello');
    expect(github.getOctokit).toHaveBeenCalledWith('token');
    expect(getCommit).toHaveBeenCalledWith({
      owner: 'nullplatform',
      repo: 'github-action-build',
      commit_sha: 'abc123',
    });
  });

  test('warns and returns null when the GitHub API call fails', async () => {
    core.getInput.mockReturnValue('token');
    const getCommit = jest.fn().mockRejectedValue(new Error('boom'));
    github.getOctokit.mockReturnValue({ rest: { git: { getCommit } } });

    const result = await getCommitMessage('abc123');

    expect(result).toBeNull();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });
});
