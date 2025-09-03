const MyToken = artifacts.require('./MyToken.sol')

module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
  const initialSupply = 10000;
  _deployer.deploy(MyToken, initialSupply);
};
