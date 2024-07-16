// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint256 public balance;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed recipient, uint256 amount);
    event Transfer(address indexed to, uint256 amount);

    constructor(uint256 initBalance) {
        require(initBalance > 0, "Initial balance must be greater than zero");
        owner = msg.sender;
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _withdrawAmount, "Insufficient balance");
        
        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);
        
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function transfer(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_to != address(0), "Invalid recipient address");
        require(balance >= _amount, "Insufficient balance");

        balance -= _amount;
        _to.transfer(_amount);
        
        emit Transfer(_to, _amount);
    }
}
