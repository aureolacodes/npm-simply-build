/**
 * Contains the Simply main class.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const childProcess = require('child_process');
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
   * @param {string} rootDir
   *   Directory the simply command is executed in.
   * @param {string} tasksDir
   *   Tasks directory, relative to the rootDir.
   */
  constructor(rootDir, tasksDir) {
    tasksDir = tasksDir || 'tasks';
    this._directory = rootDir + '/' + tasksDir;
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
   *
   * @param {string} task
   *   Name of the task to execute.
   */
  run(task) {
    if (!task || typeof task !== 'string') {
      throw 'No task specified.';
    }

    console.log(`Simply running "${task}"...`);

    let taskDir = this._directory + '/' + task + '/';
    fs.readdir(taskDir, (error, files) => {
      if (error) {
        throw error;
      }

      this._files = [];
      for (let i = 0, len = files.length; i < len; i++) {
        if (files[i][0] !== '.') {
          this._files.push(taskDir + files[i]);
        }
      }

      this._processFile();
    });
  }

  /**
   * Process the next file in the queue.
   *
   * Takes the next file from the files queue and pushes
   * it to an execution function.
   *
   * @private
   */
  _processFile() {
    let filepath = this._files.shift();
    if (!filepath) {
      console.log('finished.');
    }
    else {
      this._executeFile(filepath);
    }
  }

  /**
   * Executes the file with the given filepath.
   *
   * @param {string} filepath
   *   Path of the file we want to execute.
   *
   * @private
   */
  _executeFile(filepath) {
    let command = '';
    if (filepath.substr(-3) === '.js') {
      command = 'node ' + filepath;
    }
    else {
      command = filepath;
    }

    console.log(`- ${filepath}`);

    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }

      let output = stdout + stderr;
      if (output) {
        console.log(output.trim());
      }

      this._processFile();
    });
  }
}

module.exports = Simply;
