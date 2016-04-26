# Simply Build

## Introduction

`simply` is meant to be a helper tool for those, who don't need feature-rich tools
like grunt, gulp and so on. It helps you create a simple and yet maintenable and
modular workflow for your basic everyday development tasks.

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

## Configuration

The following options can be added to your `package.json`:

```
{
  ...
  "simply": {
    "directory": "change/your/tasks/folder"
  }
}
```

## Development

- Please create issues for any bugs you encounter.
- If you would like to contribute just make sure jshint is happy.
- Also I would like to keep `simply` as simple as possible.
