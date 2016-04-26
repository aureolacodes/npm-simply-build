/**
 * Contains the Simply main class.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const helper = require('./helper');

const getTasks = helper.getTasks;
const scanTasksDir = helper.scanTasksDir;

/**
 * Defines the Simply main class.
 *
 * The class is responsible for executing files located in a
 * configurable folder. Root and tasks folder can be defined
 * in the constructor.
 */
class Simply {

  /**
   * Sets up basic configuration of the class.
   *
   * @param {string} rootDir
   *   Directory the simply command is executed in.
   * @param {string} tasksDir
   *   Tasks directory, relative to the rootDir.
   */
  constructor(rootDir, tasksDir) {
    tasksDir = tasksDir || 'tasks';
    this._directory = path.join(rootDir, tasksDir);
  }

  /**
   * Runs the task with the given name.
   *
   * Searches for files located inside a subfolder of the
   * tasks directory. The name of the subfolder is defined
   * by the task's name.
   *
   * Passes all executable files to a function executing
   * each file after the other.
   *
   * @param {Array} tasks
   *   Names of the tasks we want to execute.
   */
  run(tasks) {
    tasks = tasks || [];
    if (tasks.length === 0) {
      console.log('No tasks specified.');
    }

    for (let i = 0, len = tasks.length; i < len; i++) {
      this.runTask(tasks[i]);
    }
  }

  /**
   * Runs the task with the given name.
   *
   * @param {string} task
   *   Name of the task.
   */
  runTask(task) {
    let item = this._getTask(task);
    if (!item) {
      console.log(`Task ${task} not found.`);
    }
    else {
      console.log(`Running task "${task}":`);
      this._execTask(item);
    }
  }

  /**
   * Lists all registered groups and their tasks in execution order.
   */
  list() {
    console.log('The following tasks are available:');

    let tasks = getTasks(this._directory);
    for (let i = 0, len = tasks.length; i < len; i++) {
      console.log('-- ' + tasks[i].path);
    }
  }

  /**
   * Returns the requested task if found.
   *
   * @param {string} task
   *   Name of the tasks as defined in list.
   *
   * @return {object|null}
   *   Either task item or null, if not found.
   *
   * @private
   */
  _getTask(task) {
    let tasks = getTasks(this._directory);
    for (let i = 0, len = tasks.length; i < len; i++) {
      if (tasks[i].path === task) {
        return tasks[i];
      }
    }

    return null;
  }

  /**
   * Handles the execution of a given task item.
   *
   * @param {object} item
   *   A task item.
   *
   * @private
   */
  _execTask(item) {
    let items = scanTasksDir(this._directory, item.path);
    items.forEach(this._execItem.bind(this));
  }

  /**
   * Handles the execution of a given item.
   *
   * @param {object} item
   *   Single item object.
   *
   * @private
   */
  _execItem(item) {
    let output;
    let command = '';

    if (item.type === 'script') {
      command = 'node ' + item.pathAbs;
    }
    else if (item.type === 'binary') {
      command = item.pathAbs;
    }

    // Other items should not be executed.
    else {
      return;
    }

    console.log(`- ${item.pathAbs}`);

    try {
      output = execSync(command, {encoding: 'UTF-8'});
      if (output) {
        console.log(output);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

}

module.exports = Simply;
