// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Web3Slots {
    // Settings
    address payable public owner;
    uint256 public pricePerSpin;
    uint8 public houseEarningsPercent;

    // Storage
    uint256 private houseEarningsTotal;

    event Spin(address indexed player, uint16 result, uint256 winnings);

    constructor(uint256 _pricePerSpin, uint8 _houseEarningsPercent) payable {
        require(_houseEarningsPercent > 0 && _houseEarningsPercent < 100, "Illegal house earnings percent provided.");
        require(_pricePerSpin > 0, "Price per spin must be greater than 0.");

        owner = payable(msg.sender);
        pricePerSpin = _pricePerSpin;
        houseEarningsPercent = _houseEarningsPercent;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender is not the owner!");
        _;
    }

    function getJackpot() public view returns(uint256){
        return address(this).balance/2;
    }

    function getHouseEarningsTotal() public view onlyOwner returns(uint256){
        return houseEarningsTotal;
    }

    function spin() public payable {
        // make sure this is the owner
        require(msg.value >= pricePerSpin, "Player didn't send enough ETH");

        // House needs to take its cut
        houseEarningsTotal += msg.value * houseEarningsPercent / 100;

        // I understand this is not a truly random number, but it will do for this example
        uint16 spinResult = uint16(block.difficulty % 1000);

        if (spinResult == 777) {
            // Player hit a jackpot! Sending half of total
            uint256 winnings = (address(this).balance - houseEarningsTotal) / 2;
            payable(msg.sender).transfer(winnings);
            emit Spin(msg.sender, spinResult, winnings);
        } else if (spinResult / 100 == spinResult % 10 && spinResult % 10 == (spinResult / 10) % 10) {
            // Player rolled 3 in a row!
            uint256 winnings = (address(this).balance - houseEarningsTotal) / 10;
            payable(msg.sender).transfer(winnings);
            emit Spin(msg.sender, spinResult, winnings);
        } else {
            // Player didn't win anything
            emit Spin(msg.sender, spinResult, 0);
        }
    }

    function withdrawHouseEarnings() public onlyOwner{
        payable(owner).transfer(houseEarningsTotal);
    }
}
