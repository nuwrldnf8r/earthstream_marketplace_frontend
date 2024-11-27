// TransactionHandler.jsx
import React, { useState } from "react";
import { ethers } from "ethers";

const TransactionHandler = ({
  provider,
  sender,
  contractAddress,
  amount,
  recipient,
  transactionHash,
}) => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const validateTransaction = async () => {
    try {
      setModalOpen(true);
      setStatus("Validating transaction...");

      // Fetch the transaction details
      const tx = await provider.getTransaction(transactionHash);

      if (!tx) {
        throw new Error("Transaction not found on the blockchain.");
      }

      // Validate sender, recipient, and amount
      if (tx.from.toLowerCase() !== sender.toLowerCase()) {
        throw new Error("Sender address does not match.");
      }

      if (tx.to.toLowerCase() !== contractAddress.toLowerCase()) {
        throw new Error("Transaction is not directed to the specified contract.");
      }

      // Decode the data to validate amount and recipient
      const iface = new ethers.utils.Interface([
        "function transfer(address to, uint256 value)",
      ]);
      const decodedData = iface.parseTransaction({ data: tx.data });

      if (decodedData.args[0].toLowerCase() !== recipient.toLowerCase()) {
        throw new Error("Recipient address does not match.");
      }

      if (!decodedData.args[1].eq(ethers.BigNumber.from(amount))) {
        throw new Error("Transfer amount does not match.");
      }

      setStatus("Transaction successfully validated!");
    } catch (err) {
      setError(err.message || "Failed to validate transaction.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setStatus("");
    setError("");
  };

  return (
    <div>
      <button
        onClick={validateTransaction}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Validate Transaction
      </button>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
            }}
          >
            {status && <p style={{ color: "green" }}>{status}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button
              onClick={closeModal}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                backgroundColor: "#FF7D00",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHandler;
