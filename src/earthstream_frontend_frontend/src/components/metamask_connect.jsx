import { BrowserProvider } from "ethers";
import React, { useState } from "react";


const MetamaskConnect = ({ onConnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Metamask is not installed!");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      // Ensure Avalanche Mainnet
      const network = await provider.getNetwork();
      if (network.chainId !== 43114) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xA86A" }], // Avalanche Mainnet
        });
      }

      setIsConnected(true);
      setError("");
      onConnect(provider, accounts[0], true);
    } catch (err) {
      setError(err.message || "Failed to connect.");
    }
  };

  return (
    <div>
      <button
        onClick={connectWallet}
        style={{
          padding: "10px 20px",
          backgroundColor: "#FF7D00",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isConnected ? "Connected" : "Connect Metamask"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default MetamaskConnect;
