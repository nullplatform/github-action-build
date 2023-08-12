# Nullplatform Build GitHub Action

<p align="center">
  <a href="https://github.com/nullplatform/github-action-build/actions"><img alt="javscript-action status" src="https://github.com/nullplatform/github-action-build/workflows/units-test/badge.svg"></a>
</p>

You can use the GitHub Action to automate the build process on Nullplatform.

## Code

Install the dependencies

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid credentials (3ms)
  ✓ logins into nullplatform (504ms)
  ✓ other test (95ms)
...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

Update version in ``package.json`` file and then run:

```bash
npm run update:version
```

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: nullplatform/github-action-build@v1
with:
  action: create
  state: pending
  application_id: 20455
  commit.id: ${{ github.event.head_commit.id }}
  commit.permalink: ${{ github.event.head_commit.url }}
  description: ${{ github.event.head_commit.message }}
  branch: ${{ github.ref#refs/heads/ }}
```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
