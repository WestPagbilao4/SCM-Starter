import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [error, setError] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const atmABI = atm_abi.abi;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setEthWallet(provider);
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);
        getATMContract(provider);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        setError("Error connecting to wallet. Check the console for details.");
      }
    } else {
      alert("MetaMask wallet extension not detected");
    }
  };

  const getATMContract = (provider) => {
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
    getBalance(atmContract);
    getTransactionHistory(atmContract);
  };

  const getBalance = async (contract) => {
    try {
      const balance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(balance)); // Convert from wei to ETH
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Error fetching balance. Check the console for details.");
    }
  };

  const getTransactionHistory = async (contract) => {
    try {
      const transactions = await contract.getTransactionHistory();
      const history = transactions.map((tx) => ({
        transactionType: tx.transactionType === 0 ? "Deposit" : "Withdraw",
        account: tx.account,
        amount: ethers.utils.formatEther(tx.amount),
        timestamp: new Date(tx.timestamp * 1000).toLocaleString(),
      }));
      setTransactionHistory(history);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      setError("Error fetching transaction history. Check the console for details.");
    }
  };

  const deposit = async () => {
    try {
      const tx = await atm.deposit({ value: ethers.utils.parseEther("1") }); // Depositing 1 ETH (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
      getTransactionHistory(atm);
    } catch (error) {
      console.error("Error depositing ETH:", error);
      setError("Error depositing ETH. Check the console for details.");
    }
  };

  const withdraw = async () => {
    try {
      const tx = await atm.withdraw(ethers.utils.parseEther("1")); // Withdrawing 1 ETH (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
      getTransactionHistory(atm);
    } catch (error) {
      console.error("Error withdrawing ETH:", error);
      setError("Error withdrawing ETH. Check the console for details.");
    }
  };

  const transfer = async () => {
    try {
      const tx = await atm.transfer(recipient, ethers.utils.parseEther(transferAmount)); // Transfer amount (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
      getTransactionHistory(atm);
    } catch (error) {
      console.error("Error transferring ETH:", error);
      setError("Error transferring ETH. Check the console for details.");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectWallet}>Connect MetaMask Wallet</button>;
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <div>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount to Transfer"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button onClick={transfer}>Transfer</button>
        </div>
        <h2>Transaction History</h2>
        <ul>
          {transactionHistory.map((tx, index) => (
            <li key={index}>
              {tx.timestamp}: {tx.transactionType} of {tx.amount} ETH to/from {tx.account}
            </li>
          ))}
        </ul>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the MetaCrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
