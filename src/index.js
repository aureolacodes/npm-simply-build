#!/usr/bin/env node

/**
 * Main entry file of the simply-build package.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const program = require('commander');
const config = require('../package.json');

const appCfg = require(process.cwd() + '/package.json');
const tasksDir = appCfg.simply ? appCfg.simply.directory : 'tasks';

const Simply = require('./lib/Simply.js');

var simply = new Simply(process.cwd(), tasksDir);

program
  .version(config.version)
  .usage('<group ...>')
  .option('-l, --list', 'List registered task groups.')
  .parse(process.argv);

if (program.list) {
  simply.list();
}
else if (program.args.length === 0) {
  console.log('Use "simply --list" to list available tasks.');
}
else {
  simply.run(program.args[0] || null);
}
