# Simply Build

## Introduction

`simply` is meant to be a helper tool for creating a simple, yet maintainable
and modular workflow for your basic everyday development tasks. Simply is
modular by design, so sharing, adding or removing task is as simple as copying
or removing a folder.

The deployment process is divided into tasks. Tasks are represented by
subfolders inside a customizable root directory. Tasks can define their own
dependencies which are managed by simply using basic npm logic.

## Installation

```
npm install simply-build -g
```

## Basic usage

Execute a single task:
```
simply task
```

Chaining tasks together. Tasks run synchronously, so each task
will wait for the previous one.
```
simply task1 task2 task3
```

Listing all available tasks:
```
simply --list
```

## Description

I will give you a basic overview how `simply` works.

All this tool does is search for directories in a folder `tasks`.
These folders represent your `tasks`. All scripts you put inside your
subfolders will be executed by `simply`. Scripts will be executed in
alphabetical order.

So a basic setup might look like this:
```
./tasks/compile/babelify.js
./tasks/compile/uglify.js
./tasks/test/jshint
```

This would define two tasks `compile` & `test`. To execute those tasks run
`simply compile` or `simply test`.

Scripts can be either Javascript files, shell scripts, binaries or anything
else which is executable on your OS.

Check the following repository for a basic example:<br />
https://github.com/aureolacodes/npm-simply-build-example

## Dependencies

Every task can define it's own dependencies. Just create a .json file inside
your task folder & add dependencies using the npm syntax.

For convenience you may want to use `npm init` and `npm install` to manage
dependencies per task. Install or update task dependencies using:

```
simply --install
```

Please note that there is currently no mechanism to deal with concurrent
dependencies.

## Configuration

The following options can be added to your `package.json`:

| Option | Default | Description |
| --- | --- | --- |
| directory | tasks | Defines the tasks directory. |
| extBinary | ["","sh","bat","exe"] | Extensions of binary files. |
| extScript | ["js"] | Extensions of script files. |
| extConfig | ["json"] | Extensions of config files. |

Example:
```json
{
  "simply": {
    "directory": "change/your/tasks/folder",
    "extBinary": ["","sh","bat","exe"],
    "extScript": ["js"],
    "extConfig": ["json"]
  }
}
```

## Development

- Please create issues for any bugs you encounter.
- If you would like to contribute just make sure jshint is happy.
- Also I would like to keep `simply` as simple as possible.
