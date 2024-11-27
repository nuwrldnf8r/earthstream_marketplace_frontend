import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AlertCircle, Check, Loader } from 'lucide-react';

// Expanded ABI with fallback options
const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
  'function DECIMALS() view returns (uint8)', // Some tokens use this instead
  'function Decimals() view returns (uint8)'  // Or this
];

export default function TransactionVerification() {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Form state
  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      setLoading(true);
      setError('');
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTokenDecimals = async (contract) => {
    try {
      // Try standard decimals() first
      try {
        return await contract.decimals();
      } catch (e) {
        console.log('Standard decimals() failed, trying alternatives');
      }

      // Try alternative DECIMALS()
      try {
        return await contract.DECIMALS();
      } catch (e) {
        console.log('DECIMALS() failed, trying Decimals()');
      }

      // Try another alternative Decimals()
      try {
        return await contract.Decimals();
      } catch (e) {
        console.log('All decimals attempts failed');
      }

      // If all fails, return default 18
      return 18;
    } catch (err) {
      console.log('Error getting decimals:', err);
      return 18; // Default to 18 if all methods fail
    }
  };

  const parseTransferEvent = (receipt, contract, recipientAddress) => {
    // Look through all logs
    for (const log of receipt.logs) {
      try {
        // Try to parse as Transfer event
        const parsed = contract.interface.parseLog({
          topics: log.topics,
          data: log.data
        });

        // Check if it's a Transfer event and matches our recipient
        if (
          parsed && 
          parsed.name === 'Transfer' && 
          parsed.args.to.toLowerCase() === recipientAddress.toLowerCase()
        ) {
          return parsed;
        }
      } catch (e) {
        console.log('Failed to parse log:', e);
        continue;
      }
    }
    return null;
  };

  const verifyTransaction = async (e) => {
    e.preventDefault();
    
    if (!txHash || !contractAddress || !recipientAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setVerificationResult(null);

      console.log('Verifying transaction:', txHash);
      
      // Get transaction details
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found');
      }

      console.log('Transaction found:', tx);

      // Wait for transaction to be mined if needed
      const receipt = await tx.wait();
      if (!receipt.status) {
        throw new Error('Transaction failed');
      }

      console.log('Transaction receipt:', receipt);

      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        provider
      );

      console.log('Contract instance created');

      // Get decimals with fallback handling
      const decimals = await getTokenDecimals(contract);
      console.log('Token decimals:', decimals);

      // Find and parse transfer event
      const transferEvent = parseTransferEvent(receipt, contract, recipientAddress);
      if (!transferEvent) {
        throw new Error('No matching transfer event found');
      }

      console.log('Transfer event found:', transferEvent);

      // Format verification result
      const result = {
        confirmations: await receipt.confirmations(),
        sender: transferEvent.args.from,
        recipient: transferEvent.args.to,
        amount: ethers.formatUnits(transferEvent.args.value, decimals),
        blockNumber: receipt.blockNumber,
        timestamp: (await provider.getBlock(receipt.blockNumber)).timestamp,
        rawAmount: transferEvent.args.value.toString() // Include raw amount for verification
      };

      console.log('Verification result:', result);
      setVerificationResult(result);

    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="animate-spin" />
          ) : (
            'Connect MetaMask'
          )}
        </button>
      ) : (
        <form onSubmit={verifyTransaction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Hash
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract Address
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Transaction'
            )}
          </button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {verificationResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 mb-4">
            <Check className="shrink-0" />
            <h3 className="font-medium">Transaction Verified</h3>
          </div>
          
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Confirmations:</dt>
              <dd className="font-medium">{verificationResult.confirmations}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Sender:</dt>
              <dd className="font-medium">{verificationResult.sender}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Amount:</dt>
              <dd className="font-medium">{verificationResult.amount}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Raw Amount:</dt>
              <dd className="font-medium">{verificationResult.rawAmount}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Block:</dt>
              <dd className="font-medium">{verificationResult.blockNumber}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-600">Time:</dt>
              <dd className="font-medium">
                {new Date(verificationResult.timestamp * 1000).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}