const core = require('@actions/core');
const github = require('@actions/github');

jest.mock('@actions/core');
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: {
    repo: { owner: 'nullplatform', repo: 'main-providers-api' },
    sha: '',
    ref: '',
    payload: {},
  },
}));

const mockPost = jest.fn();
jest.mock('./client', () => jest.fn(() => ({ post: mockPost })));

const run = require('./action');

const setInputs = (overrides = {}) => {
  const defaults = { action: 'create', 'application-id': 'app-1' };
  const all = { ...defaults, ...overrides };
  core.getInput.mockImplementation((name) => all[name] || '');
};

describe('run (createBuild path)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ id: 1, status: 'in_progress', application_id: 'app-1' });
    github.context.sha = 'abc123';
    github.context.ref = 'refs/heads/main';
    github.context.payload = { repository: { html_url: 'https://github.com/foo/bar' } };
    setInputs();
  });

  test('uses head_commit.message when payload contains it (push event)', async () => {
    github.context.payload.head_commit = { message: 'feat: from push' };

    await run();

    expect(github.getOctokit).not.toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith('build', expect.objectContaining({
      description: 'feat: from push',
    }));
  });

  test('fetches the commit message via the GitHub API when head_commit is absent', async () => {
    setInputs({ 'github-token': 'ghs_x' });
    const getCommit = jest.fn().mockResolvedValue({ data: { message: 'feat: from API' } });
    github.getOctokit.mockReturnValue({ rest: { git: { getCommit } } });

    await run();

    expect(github.getOctokit).toHaveBeenCalledWith('ghs_x');
    expect(getCommit).toHaveBeenCalledWith(expect.objectContaining({ commit_sha: 'abc123' }));
    expect(mockPost).toHaveBeenCalledWith('build', expect.objectContaining({
      description: 'feat: from API',
    }));
  });

  test('falls back to "Commit <sha>" when github-token is empty and head_commit is absent', async () => {
    await run();

    expect(github.getOctokit).not.toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith('build', expect.objectContaining({
      description: 'Commit abc123',
    }));
  });

  test('warns and falls back to "Commit <sha>" when the API call fails', async () => {
    setInputs({ 'github-token': 'ghs_x' });
    const getCommit = jest.fn().mockRejectedValue(new Error('forbidden'));
    github.getOctokit.mockReturnValue({ rest: { git: { getCommit } } });

    await run();

    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('forbidden'));
    expect(mockPost).toHaveBeenCalledWith('build', expect.objectContaining({
      description: 'Commit abc123',
    }));
  });

  test('prefers explicit description input over payload and API', async () => {
    setInputs({ description: 'from input', 'github-token': 'ghs_x' });
    github.context.payload.head_commit = { message: 'feat: from push' };

    await run();

    expect(github.getOctokit).not.toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledWith('build', expect.objectContaining({
      description: 'from input',
    }));
  });
});
