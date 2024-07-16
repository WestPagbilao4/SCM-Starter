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

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const atmABI = atm_abi.abi;

  // Function to connect to MetaMask wallet
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
      }
    } else {
      alert("MetaMask wallet extension not detected");
    }
  };

  // Function to get instance of the deployed contract
  const getATMContract = (provider) => {
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
    getBalance(atmContract);
  };

  // Function to get balance from the contract
  const getBalance = async (contract) => {
    try {
      const balance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(balance)); // Convert from wei to ETH
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Function to deposit ETH into the contract
  const deposit = async () => {
    try {
      const tx = await atm.deposit({ value: ethers.utils.parseEther("1") }); // Depositing 1 ETH (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
    } catch (error) {
      console.error("Error depositing ETH:", error);
    }
  };

  // Function to withdraw ETH from the contract
  const withdraw = async () => {
    try {
      const tx = await atm.withdraw(ethers.utils.parseEther("1")); // Withdrawing 1 ETH (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
    } catch (error) {
      console.error("Error withdrawing ETH:", error);
    }
  };

  // Function to transfer ETH to another address
  const transfer = async () => {
    try {
      const tx = await atm.transfer(recipient, ethers.utils.parseEther(transferAmount)); // Transfer amount (in wei)
      await tx.wait(); // Wait for transaction to be mined
      getBalance(atm);
    } catch (error) {
      console.error("Error transferring ETH:", error);
    }
  };

  // Function to initialize user connection and UI
  const initUser = () => {
    // Check if MetaMask is installed
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    // If no account connected, provide a button to connect
    if (!account) {
      return (
        <button onClick={connectWallet}>Connect MetaMask Wallet</button>
      );
    }

    // Display user's account and balance, provide buttons for actions
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
      </div>
    );
  };

  // Hook to initialize wallet connection on component mount
  useEffect(() => {
    connectWallet();
  }, []);

  // Render UI
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
