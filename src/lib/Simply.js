/**
 * Contains the Simply main class.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');

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
   * @param {object} config
   *   Object with configuration options. The following options are available:
   *   - rootDir {string}
   *     Root directory of the application.
   *   - tasksDir {string}
   *     Path to the tasks directory.
   *   - extBinary {Array}
   *     Array of extensions of binary files.
   *   - extScript {Array}
   *     Array of extensions of script files.
   *   - extConfig {Array}
   *     Array of extensions of config files.
   */
  constructor(config) {
    config = config || {};

    this._config = config;
    this._config.rootDir = config.rootDir || process.cwd();
    this._config.tasksDir = config.tasksDir || 'tasks';
    this._config.extBinary = config.extBinary || ['', 'sh', 'bat', 'exe'];
    this._config.extScript = config.extScript || ['js'];
    this._config.extConfig = config.extConfig || ['json'];

    this._directory = path.join(this._config.rootDir, this._config.tasksDir);
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

    let tasks = this._getTasks(this._directory);
    for (let i = 0, len = tasks.length; i < len; i++) {
      console.log('-- ' + tasks[i].path);
    }
  }

  /**
   * Installs all task dependencies.
   *
   * @param {bool} save
   *   Dependencies will be stored in package.json if true.
   */
  install(save) {
    console.log('Installing task dependencies...');

    let suffix = save ? ' -D' : '';
    let dependencies = this._getDependencies();
    for (let key of Object.keys(dependencies)) {
      try {
        let command = `npm i ${key}@${dependencies[key]}${suffix}`;
        console.log(command);

        let output = execSync(command, {
          encoding: 'UTF-8'
        });

        if (output) {
          console.log(output);
        }
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Returns an object with all collected dependencies.
   *
   * @return {object}
   *   Dependencies object.
   *
   * @private
   */
  _getDependencies() {
    let dependencies = {};

    let items = this._getConfig(this._directory);
    for (let i = 0, len = items.length; i < len; i++) {
      try {
        let data = fs.readFileSync(items[i].pathAbs, 'utf8');
        let config = JSON.parse(data);

        if (config.dependencies) {
          for (let key of Object.keys(config.dependencies)) {
            dependencies[key] = config.dependencies[key];
          }
        }

        if (config.devDependencies) {
          for (let key of Object.keys(config.devDependencies)) {
            dependencies[key] = config.devDependencies[key];
          }
        }
      }
      catch (error) {
        console.log(error);
      }
    }

    return dependencies;
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
    let tasks = this._getTasks(this._directory);
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
    let items = this._scanTasksDir(this._directory, item.path);
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

  /**
   * Returns the item type for a given file path.
   *
   * Possible item types are "task", "script", "config" or "binary". Depending
   * on the type, the items will be handled differently by simply.
   *
   * @param {string} filepath
   *   File path of the item in question.
   *
   * @return {string|null}
   *   The item's type or null, if item is invalid.
   *
   * @private
   */
  _getItemType(filepath) {
    let filename = path.basename(filepath);
    if (filename[0] === '.' || filename === 'node_modules') {
      return null;
    }

    let itemStat = fs.lstatSync(filepath);
    if (itemStat && itemStat.isDirectory()) {
      return 'task';
    }

    let matches = filename.match(/\.([^\.]+)$/i);
    let extension = matches ? matches[1] : '';
    
    if (this._config.extBinary.indexOf(extension) !== -1) {
      return 'binary';
    }
    if (this._config.extScript.indexOf(extension) !== -1) {
      return 'script';
    }
    if (this._config.extConfig.indexOf(extension) !== -1) {
      return 'config';
    }

    return null;
  }

  /**
   * Returns an array of items inside the tasks directory.
   *
   * @param {string} tasksDir
   *   The tasks directory from which the scan has started.
   * @param {string} task
   *   The (task) subdirectory we want to scan inside the tasks dir.
   *
   * @return {Array}
   *   Array of items inside the tasks directory.
   *
   * @private
   */
  _scanTasksDir(tasksDir, task) {
    task = task || '';

    let results = [];

    let directory = path.join(tasksDir, task);
    let items = fs.readdirSync(directory);
    for (let i = 0, len = items.length; i < len; i++) {
        let item = {};
        item.path = path.join(task, items[i]);
        item.pathAbs = path.join(tasksDir, item.path);
        item.type = this._getItemType(item.pathAbs);

        results.push(item);
        if (item.type === 'task') {
          results = results.concat(this._scanTasksDir(tasksDir, item.path));
        }
    }

    return results;
  }

  /**
   * Returns all tasks located inside the task directory.
   *
   * @param {string} tasksDir
   *   The tasks directory.
   *
   * @return {Array}
   *   Array of task items.
   *
   * @private
   */
  _getTasks(tasksDir) {
    return this._scanTasksDir(tasksDir).filter(item => {
      return item.type === 'task';
    });
  }

  /**
   * Returns all config files located inside the task directory.
   *
   * @param {string} tasksDir
   *   The tasks directory.
   *
   * @return {Array}
   *   Array of config items.
   *
   * @private
   */
  _getConfig(tasksDir) {
    return this._scanTasksDir(tasksDir).filter(item => {
      return item.type === 'config';
    });
  }

}

module.exports = Simply;
