// SPDX-License-Identifier: MIT

pragma solidity >=0.8.4 <0.9.0;

contract Lottery {
    address public owner;
    address payable[] public players;
    uint256 public lotteryId;
    mapping(uint256 => address payable) public lotteryHistory;

    constructor() {
        owner = msg.sender;
        lotteryId = 1;
    }

    function getWinnerByLottery(uint256 lottery)
        public
        view
        returns (address payable)
    {
        return lotteryHistory[lottery];
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function enter() public payable {
        require(msg.value > 100000000000000000);

        // address of player entering lottery
        players.push(payable(msg.sender));
    }

    function getRandomNumber() public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(owner, block.timestamp)));
    }

    function pickWinner() public onlyowner {
        uint256 index = getRandomNumber() % players.length;
        address payable winner = payable(players[index]);
        uint256 wins = (address(this).balance * 8) / 10;
        uint256 funds = address(this).balance - wins;
        winner.transfer(wins);
        payable(winner).transfer(funds);

        lotteryHistory[lotteryId] = winner;
        lotteryId++;

        // reset the state of the contract
        players = new address payable[](0);
    }

    modifier onlyowner() {
        require(msg.sender == owner);
        _;
    }
}
