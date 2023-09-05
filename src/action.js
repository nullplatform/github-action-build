const dotenv = require('dotenv');
const core = require('@actions/core');
const github = require('@actions/github');
const HttpClient = require('./client');
const { isEmpty } = require('./validate');
const {
  Input, Output, BuildStatus, ActionType,
} = require('./enums');

dotenv.config();

const client = new HttpClient();

const getAction = () => core.getInput(Input.ACTION);

const setFailed = (error) => {
  core.setFailed(error);
  process.exit(1);
};

const createBuild = () => {
  core.info('Validating inputs...');

  const status = BuildStatus.IN_PROGRESS;
  const applicationId = core.getInput(Input.APPLICATION_ID);
  const commitId = core.getInput(Input.COMMIT_ID) || github.context.sha;
  const commitPermalink = core.getInput(Input.COMMIT_PERMALINK)
    || `${github.context.payload.repository.html_url}/commit/${github.context.sha}`;
  const description = core.getInput(Input.DESCRIPTION)
    || (github.context.payload.head_commit && github.context.payload.head_commit.message)
    || `Commit ${github.context.sha}`;
  const branch = core.getInput(Input.BRANCH) || github.context.ref.split('/').pop();

  if (isEmpty(status)) {
    setFailed(`Input "${Input.STATUS}" cannot be empty`);
  }

  if (isEmpty(applicationId)) {
    setFailed(`Input "${Input.APPLICATION_ID}" cannot be empty`);
  }

  if (isEmpty(commitId)) {
    setFailed(`Input "${Input.COMMIT_ID}" cannot be empty`);
  }

  if (isEmpty(commitPermalink)) {
    setFailed(`Input "${Input.COMMIT_PERMALINK}" cannot be empty`);
  }

  if (isEmpty(description)) {
    setFailed(`Input "${Input.DESCRIPTION}" cannot be empty`);
  }

  if (isEmpty(branch)) {
    setFailed(`Input "${Input.BRANCH}" cannot be empty`);
  }

  const body = {
    status,
    application_id: applicationId,
    commit: {
      id: commitId,
      permalink: commitPermalink,
    },
    description,
    branch,
  };

  return client.post('build', body);
};

const createAsset = () => {
  core.info('Validating inputs...');

  const id = core.getInput(Input.ID);
  const commitId = core.getInput(Input.COMMIT_ID) || github.context.sha;
  const imageRepositoryUrl = core.getInput(Input.IMAGE_REPOSITORY_URL);

  if (isEmpty(id)) {
    setFailed(`Input "${Input.ID}" cannot be empty`);
  }

  if (isEmpty(commitId)) {
    setFailed(`Input "${Input.COMMIT_ID}" cannot be empty`);
  }

  if (isEmpty(imageRepositoryUrl)) {
    setFailed(`Input "${Input.IMAGE_REPOSITORY_URL}" cannot be empty`);
  }

  const body = {
    build_id: parseInt(id, 10),
    type: 'docker-image',
    url: `${imageRepositoryUrl}:${commitId}`,
    metadata: {},
  };

  return client.post(`build/${id}/asset`, body);
};

const updateBuild = async () => {
  core.info('Validating inputs...');

  const id = core.getInput(Input.ID);
  const status = core.getInput(Input.STATUS);
  const imageRepositoryUrl = core.getInput(Input.IMAGE_REPOSITORY_URL);

  if (isEmpty(id)) {
    setFailed(`Input "${Input.ID}" cannot be empty`);
  }

  if (isEmpty(status)) {
    setFailed(`Input "${Input.STATUS}" cannot be empty`);
  }

  const body = {
    id: parseInt(id, 10),
    status,
  };

  const build = await client.patch(`build/${id}`, body);

  // @deprecated create asset on build SUCCESSFUL only supports one asset per build
  if (status === BuildStatus.SUCCESSFUL && !isEmpty(imageRepositoryUrl)) {
    await createAsset();
  }

  return build;
};

const run = async () => {
  try {
    const action = getAction();
    let build = null;
    if (action === ActionType.CREATE) {
      build = await createBuild();
      core.info(`Successfully created build with id "${build.id}"`);
    } else if (action === ActionType.UPDATE) {
      build = await updateBuild();
      core.info(`Successfully updated build with id "${build.id}" and status "${build.status}"`);
    } else {
      core.setFailed(`Invalid action type "${action}"`);
    }
    const { id, status, application_id: applicationId } = build;
    core.setOutput(Output.ID, id);
    core.setOutput(Output.STATUS, status);
    core.setOutput(Output.APPLICATION_ID, applicationId);
  } catch (error) {
    core.setFailed(`Build action failed: ${error.message}`);
  }
};

module.exports = run;
