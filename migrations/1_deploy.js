const Conditional = artifacts.require('Conditional');
const AfterBlockCondition = artifacts.require('AfterBlockCondition');
const AfterTimestampCondition = artifacts.require('AfterTimestampCondition');

const CANCEL_TIMEOUT = 300;

async function doMigration(deployer) {
  await Promise.all([
    deployer.deploy(
      Conditional,
      CANCEL_TIMEOUT,
    ),
    deployer.deploy(AfterBlockCondition),
    deployer.deploy(AfterTimestampCondition),
  ]);
}

module.exports = (deployer) => {
  deployer.then(() => doMigration(deployer));
};
