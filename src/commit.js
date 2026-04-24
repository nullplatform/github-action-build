const core = require('@actions/core');
const github = require('@actions/github');
const { isEmpty } = require('./validate');
const { Input } = require('./enums');

const getCommitMessage = async (sha) => {
  try {
    const token = core.getInput(Input.GITHUB_TOKEN);

    if (isEmpty(token)) {
      return null;
    }

    const octokit = github.getOctokit(token);

    const { data } = await octokit.rest.git.getCommit({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      commit_sha: sha,
    });

    return data.message;
  } catch (error) {
    core.warning(`Could not fetch commit message: ${error.message}`);
    return null;
  }
};

module.exports = { getCommitMessage };
