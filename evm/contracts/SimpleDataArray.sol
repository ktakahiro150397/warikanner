    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract SimpleDataArray {

        struct DataEntry {
            uint id;
            string message;
            address author;
            uint timestamp;
        }

        // IDとデータのマッピング
        mapping(uint => DataEntry) public dataEntries;
        // 作成者とIDのマッピング
        mapping(address => uint[]) public authorEntries;

        uint public nextId;

        event DataAdded(uint indexed id, address indexed author, string message);

        function addData(string calldata _message) public {
            uint currentId = nextId++;

            dataEntries[currentId] = DataEntry({
                id: currentId,
                message: _message,
                author: msg.sender,
                timestamp: block.timestamp
            });
            authorEntries[msg.sender].push(currentId);

            emit DataAdded(currentId, msg.sender, _message);
        }

        function getDataCount() public view returns (uint) {
            return nextId;
        }

        function getDataById(uint _id) public view returns (DataEntry memory) {
            require(_id < nextId, "Data entry does not exist");
            return dataEntries[_id];
        }

        function getEntriesByAuthor(address _author) public view returns (uint[] memory) {
            uint[] memory ids = authorEntries[_author];
            // DataEntry[] memory entries = new DataEntry[](ids.length);
            // for (uint i = 0; i < ids.length; i++) {
            //     entries[i] = dataEntries[ids[i]];
            // }
            return ids;
        }

    }