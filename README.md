# Azure Pipelines support for https://taskfile.dev

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/paulvarache.taskfile-pipeline-task)
![Azure DevOps builds](https://img.shields.io/azure-devops/build/paulvarache/taskfile/3)

This project creates a Azure DevOps extension to add Azure Pipelines tasks integrating `task`.

The extension can be found on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=paulvarache.taskfile-pipeline-task)

## Features

### Install `task`

The `UseTaskfile@0` task will download and add to the path a version of `task`.

Due to the Github API rate limits and the limited range of IP the vmImages of Azure Pipelines use, using github to retrieve releases of `task` causes issues. This tool caches the list of release and uses this cache. If the version is not found in cache, it will fallback to using the github API.
