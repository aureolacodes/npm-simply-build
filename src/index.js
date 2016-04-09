#!/usr/bin/env node

/**
 * Main entry file of the simply-build package.
 *
 * @author Christian Hanne <support@aureola.codes>
 * @copyright 2016, Aureola
 */
'use strict';

const Simply = require('./lib/simply.js');

var config = require(process.cwd() + '/package.json');
var tasksDir = config.simply ? config.simply.directory : 'tasks';

var simply = new Simply(process.cwd(), tasksDir);
simply.run(process.argv[2] || null);
