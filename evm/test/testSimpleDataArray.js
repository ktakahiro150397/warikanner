const SimpleDataArray = artifacts.require("SimpleDataArray");

contract("SimpleDataArray", accounts => {
    it("should add and retrieve values from the array.", async () => {
        const instance = await SimpleDataArray.deployed();
        await instance.addData("test message", { from: accounts[0] });
        
        const storedData = await instance.getDataById(0);
        assert.equal(storedData.message, "test message", "The value 'test message' was not stored in the array.");
        assert.equal(storedData.author, accounts[0], "The sender address does not match.");
    });

   

});
contract("SimpleDataArray", accounts => {
    it("should return the correct length of the data array.", async () => {
        const instance = await SimpleDataArray.deployed();
        
        await instance.addData("another message1", { from: accounts[1] });
        await instance.addData("another message2", { from: accounts[2] });
        await instance.addData("another message3", { from: accounts[3] });
        await instance.addData("another message4", { from: accounts[4] });
        await instance.addData("another message5", { from: accounts[5] });
        
        const length = await instance.getDataCount();
        assert.equal(length.toNumber(), 5, "The data array length should be 1 after adding one item.");
    });
});


contract("SimpleDataArray : Array Data", accounts => {
    it("should retrieve my data entries.", async () => {
        const instance = await SimpleDataArray.deployed();

        await instance.addData("my message1", { from: accounts[0] });
        await instance.addData("my message2", { from: accounts[0] });
        await instance.addData("another message1", { from: accounts[1] });
        await instance.addData("another message2", { from: accounts[1] });
        await instance.addData("my message3", { from: accounts[0] });
        await instance.addData("another message3", { from: accounts[1] });
        await instance.addData("another message4", { from: accounts[1] });

        const myData = await instance.getEntriesByAuthor(accounts[0]);
        assert.equal(myData.length, 3, "The number of entries for accounts[0] should be 3.");
        assert.equal(myData[0], 0, "First message does not match.");
        assert.equal(myData[1], 1, "Second message does not match.");
        assert.equal(myData[2], 4, "Third message does not match.");
    })

});