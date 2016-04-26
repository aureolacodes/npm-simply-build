/**
 * Contains helper functions for simply.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const fs = require('fs');
const path = require('path');

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
 */
function scanTasksDir(tasksDir, task) {
  task = task || '';

  let results = [];

  let directory = path.join(tasksDir, task);
  let items = fs.readdirSync(directory);
  for (let i = 0, len = items.length; i < len; i++) {
    if (items[i][0] !== '.') {
      let item = {};
      item.path = path.join(task, items[i]);
      item.pathAbs = path.join(tasksDir, item.path);
      item.type = getItemType(item.pathAbs);

      results.push(item);
      if (item.type === 'task') {
        results = results.concat(scanTasks(tasksDir, item.path));
      }
    }
  }

  return results;
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
 * @return {string}
 *   The item's type.
 */
function getItemType(filepath) {
  let itemStat = fs.statSync(filepath);
  if (itemStat && itemStat.isDirectory()) {
    return 'task';
  }
  else if (filepath.match(/\.js$/i)) {
    return 'script';
  }
  else if (filepath.match(/\.json$/i)) {
    return 'config';
  }

  return 'binary';
}

module.exports = {
  scanTasksDir: scanTasksDir,
  getItemType: getItemType
};
