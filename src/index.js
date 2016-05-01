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
const Simply = require('./lib/Simply.js');

var simply = new Simply(appCfg.simply);

program
  .version(config.version)
  .usage('<group ...>')
  .option('-l, --list', 'List registered task groups.')
  .option('-i, --install', 'Installs all task dependencies.')
  .option('-s, --save', 'Saves task dependencies to package.json.')
  .parse(process.argv);

if (program.list === true) {
  simply.list();
}
else if (program.install === true) {
  simply.install(program.save);
}
else if (program.args.length === 0) {
  console.log('Use "simply --list" to list available tasks.');
}
else {
  simply.run(program.args);
}
