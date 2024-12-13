<h2 align="center">
    <a href="https://httpie.io" target="blank_">
        <img height="100" alt="nullplatform" src="https://nullplatform.com/favicon/android-chrome-192x192.png" />
    </a>
    <br>
    <br>
    Nullplatform Build GitHub Action
    <br>
</h2>

## Overview

The "Nullplatform Build" GitHub Action allows you to query and interact with nullplatform application builds. It provides actions for creating new builds, updating existing builds, and managing associated assets. This action simplifies the process of working with Nullplatform build data within your workflows.

## Table of Contents

- [Overview](#overview)
- [Table of Contents](#table-of-contents)
- [Inputs](#inputs)
  - [`action`](#action)
  - [`id`](#id)
  - [`status`](#status)
  - [`application-id`](#application-id)
  - [`commit-id`](#commit-id)
  - [`commit-permalink`](#commit-permalink)
  - [`description`](#description)
  - [`branch`](#branch)
  - [`image-repository-url`](#image-repository-url)
- [Outputs](#outputs)
  - [`id`](#id-1)
  - [`status`](#status-1)
  - [`application-id`](#application-id-1)
- [Usage](#usage)
  - [Use Case 1: Create a New Build](#use-case-1-create-a-new-build)
  - [Use Case 2: Update an Existing Build](#use-case-2-update-an-existing-build)
- [License](#license)

## Inputs

### `action`

- **Description**: The build action controls what happens to the build. Can be one of: `create`, `update`.
- **Required**: Yes

### `id`

- **Description**: The build id.
- **Required**: No if creating a build, Yes if updating a build

### `status`

- **Description**: The build status. Can be one of: `pending`, `in_progress`, `failed`, `successful`.
- **Required**: No if creating a build, Yes if updating a build

### `application-id`

- **Description**: The application id to build.
- **Required**: Yes if creating a build, No if updating a build

### `commit-id`

- **Description**: The SHA commit. Defaults to current SHA commit
- **Required**: No

### `commit-permalink`

- **Description**: The commit web link.
- **Required**: No

### `description`

- **Description**: The build description. Defaults to the commit message.
- **Required**: No

### `branch`

- **Description**: The build branch. Defaults to the current workflow execution branch.
- **Required**: No

### `image-repository-url`

- **Description**: The image repository URL where the build asset was uploaded.
- **Required**: No

## Outputs

### `id`

- **Description**: The build id.

### `status`

- **Description**: The new build status. Can be one of: `pending`, `in_progress`, `failed`, `successful`.

### `application-id`

- **Description**: The application id built.

## Usage

Here are some common use cases for this GitHub Action:

### Use Case 1: Create a New Build

```yaml
name: Create New Nullplatform Build
on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Login to Nullplatform
      id: login
      uses: nullplatform/github-action-login@v1
      with:
        api-key: ${{ secrets.NULLPLATFORM_API_KEY }}

    - name: Create New Nullplatform Build
      id: create-build
      uses: nullplatform/github-action-build@v1
      with:
        action: create
        application-id: your-app-id

    - name: Use Build ID
      run: echo "New Build ID: ${{ steps.create-build.outputs.id }}"
```

In this example, the GitHub Action creates a new nullplatform build with a 'pending' status using the provided inputs.

### Use Case 2: Update an Existing Build

```yaml
name: Update Nullplatform Build Status
on:
  pull_request:
    types:
      - closed

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Login to Nullplatform
      id: login
      uses: nullplatform/github-action-login@v1
      with:
        api-key: ${{ secrets.NULLPLATFORM_API_KEY }}

    - name: Update Nullplatform Build Status
      id: update-build
      uses: nullplatform/github-action-build@v1
      with:
        action: update
        id: your-build-id
        status: successful

    - name: Use Updated Status
      run: echo "Updated Status: ${{ steps.update-build.outputs.status }}"
```

In this example, the GitHub Action updates an existing nullplatform build's status to 'successful' when a pull request is closed.

## License

This GitHub Action is licensed under the [MIT License](LICENSE).
