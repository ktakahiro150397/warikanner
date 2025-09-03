const SimpleStorage = artifacts.require("SimpleStorage");
const SimpleDataArray = artifacts.require("SimpleDataArray");

module.exports = function(deployer) {
    deployer.deploy(SimpleStorage);
    deployer.deploy(SimpleDataArray);
}
