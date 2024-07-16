// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint256 public balance;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed recipient, uint256 amount);
    event Transfer(address indexed to, uint256 amount);

    enum TransactionType { Deposit, Withdraw }

    struct Transaction {
        TransactionType transactionType;
        address account;
        uint256 amount;
        uint256 timestamp;
    }

    Transaction[] public transactions;

    constructor(uint256 initBalance) {
        require(initBalance > 0, "Initial balance must be greater than zero");
        owner = msg.sender;
        balance = initBalance;
        // Record initial balance as deposit by owner
        transactions.push(Transaction({
            transactionType: TransactionType.Deposit,
            account: owner,
            amount: initBalance,
            timestamp: block.timestamp
        }));
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactions;
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balance += msg.value;
        emit Deposit(msg.sender, msg.value);
        // Record the deposit transaction
        transactions.push(Transaction({
            transactionType: TransactionType.Deposit,
            account: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _withdrawAmount, "Insufficient balance");

        balance -= _withdrawAmount;
        payable(msg.sender).transfer(_withdrawAmount);

        emit Withdraw(msg.sender, _withdrawAmount);
        // Record the withdrawal transaction
        transactions.push(Transaction({
            transactionType: TransactionType.Withdraw,
            account: msg.sender,
            amount: _withdrawAmount,
            timestamp: block.timestamp
        }));
    }

    function transfer(address payable _to, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_to != address(0), "Invalid recipient address");
        require(balance >= _amount, "Insufficient balance");

        balance -= _amount;
        _to.transfer(_amount);

        emit Transfer(_to, _amount);
        // Record the transfer transaction as part of withdrawal
        transactions.push(Transaction({
            transactionType: TransactionType.Withdraw,
            account: _to,
            amount: _amount,
            timestamp: block.timestamp
        }));
    }
}
