'use strict';

const { join, resolve, basename } = require('path');
const os = require('os');
const crypto = require('crypto');
const chalk = require('chalk');
const { machineIdSync } = require('node-machine-id');
const uuid = require('uuid/v4');

const hasYarn = require('./utils/has-yarn');
const { trackError, trackUsage } = require('./utils/usage');
const parseDatabaseArguments = require('./utils/parse-db-arguments');
const generateNew = require('./generate-new');

module.exports = (projectDirectory, cliArguments) => {
  const rootPath = resolve(projectDirectory);

  const tmpPath = join(
    os.tmpdir(),
    `strapi${crypto.randomBytes(6).toString('hex')}`
  );

  const scope = {
    rootPath,
    name: basename(rootPath),
    // disable quickstart run app after creation
    runQuickstartApp: cliArguments.run === false ? false : true,
    // use pacakge version as strapiVersion (all packages have the same version);
    strapiVersion: require('../package.json').version,
    debug: cliArguments.debug !== undefined,
    quick: cliArguments.quickstart !== undefined,
    uuid: uuid(),
    deviceId: machineIdSync(),
    tmpPath,
    hasYarn: hasYarn(),
    strapiDependencies: [
      'strapi',
      'strapi-admin',
      'strapi-utils',
      'strapi-plugin-settings-manager',
      'strapi-plugin-content-type-builder',
      'strapi-plugin-content-manager',
      'strapi-plugin-users-permissions',
      'strapi-plugin-email',
      'strapi-plugin-upload',
    ],
    additionalsDependencies: {},
  };

  parseDatabaseArguments({ scope, args: cliArguments });
  initCancelCatcher(scope);

  console.log(`Creating a new Strapi application in ${chalk.green(rootPath)}.`);
  console.log();

  return generateNew(scope).catch(error => {
    console.error(error);
    return trackError({ scope, error }).then(() => {
      process.exit(1);
    });
  });
};

function initCancelCatcher(scope) {
  // Create interface for windows user to let them quit the program.
  if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('SIGINT', function() {
      process.emit('SIGINT');
    });
  }

  process.on('SIGINT', () => {
    console.log('Cancelling');

    trackUsage({ event: 'didStopCreateProject', scope }).then(() => {
      process.exit();
    });
  });
}
