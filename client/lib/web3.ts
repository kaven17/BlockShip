import Web3 from "web3";
import { AbiItem } from "web3";

// ✅ Smart Contract ABI
const ShipmentContractABI: readonly AbiItem[] = [
  {
    inputs: [
      { internalType: "string", name: "_shipmentId", type: "string" },
      { internalType: "string", name: "_origin", type: "string" },
      { internalType: "string", name: "_destination", type: "string" },
      { internalType: "string", name: "_product", type: "string" },
    ],
    name: "createShipment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_shipmentId", type: "string" },
      { internalType: "string", name: "_status", type: "string" },
      { internalType: "string", name: "_location", type: "string" },
    ],
    name: "updateShipmentStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_shipmentId", type: "string" }],
    name: "getShipmentDetails",
    outputs: [
      {
        components: [
          { internalType: "string", name: "shipmentId", type: "string" },
          { internalType: "string", name: "origin", type: "string" },
          { internalType: "string", name: "destination", type: "string" },
          { internalType: "string", name: "product", type: "string" },
          { internalType: "string", name: "status", type: "string" },
          { internalType: "string", name: "currentLocation", type: "string" },
          { internalType: "address", name: "owner", type: "address" },
        ],
        internalType: "struct BlockShipContract.Shipment",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ✅ Contract Address (from .env)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
if (!CONTRACT_ADDRESS) {
  console.error("⚠️ NEXT_PUBLIC_CONTRACT_ADDRESS is missing in .env.local");
}

// ✅ Global Web3 Variables
let web3Instance: Web3 | null = null;
let shipmentContract: any = null;
let selectedAccount: string | null = null;
let isConnecting = false; // Prevents duplicate requests

// ✅ **Connect Wallet Function (Prevents duplicate calls)**
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 provider detected. Please install MetaMask.");
  }

  // If already connected, return the account
  if (selectedAccount) {
    return selectedAccount;
  }

  // Implement better protection against concurrent calls
  if (isConnecting) {
    // Instead of throwing an error, wait for the existing connection to complete
    let attempts = 0;
    while (isConnecting && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      attempts++;
    }
    
    // If we now have a selected account, return it
    if (selectedAccount) {
      return selectedAccount;
    }
    
    // If still connecting after waiting, throw a more helpful error
    if (isConnecting) {
      throw new Error("Wallet connection is taking too long. Please try again.");
    }
  }

  try {
    isConnecting = true; // Prevent duplicate calls

    // Check if already connected
    const existingAccounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (existingAccounts.length > 0) {
      selectedAccount = existingAccounts[0];
      console.log("✅ Already Connected:", selectedAccount);
      return selectedAccount;
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.");
    }

    selectedAccount = accounts[0];

    // Initialize Web3 instance
    web3Instance = new Web3(window.ethereum);

    if (!CONTRACT_ADDRESS) throw new Error("Contract address is missing!");

    // Initialize contract
    shipmentContract = new web3Instance.eth.Contract(
      ShipmentContractABI,
      CONTRACT_ADDRESS
    );

    console.log("✅ Wallet Connected:", selectedAccount);
    return selectedAccount;
  } catch (error: any) {
    console.error("❌ Error connecting to wallet:", error.message);
    throw error;
  } finally {
    isConnecting = false; // Reset flag
  }
};

// ✅ **Get Wallet Address**
export const getWalletAddress = async (): Promise<string | null> => {
  if (!web3Instance) throw new Error("Web3 not initialized. Connect wallet first.");

  if (selectedAccount) return selectedAccount;

  const accounts = await web3Instance.eth.getAccounts();
  selectedAccount = accounts[0];
  return selectedAccount;
};

// ✅ **Check if Wallet is Connected**
export const isWalletConnected = (): boolean => {
  // Make sure this function returns a boolean, not undefined or null
  return !!(web3Instance && selectedAccount);
};

// ✅ **Create Shipment**
export const createShipment = async (
  shipmentId: string,
  origin: string,
  destination: string,
  product: string
) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error("Web3 not initialized. Connect wallet first.");
  }

  try {
    const tx = await shipmentContract.methods
      .createShipment(shipmentId, origin, destination, product)
      .send({ from: selectedAccount });

    console.log("✅ Shipment Created:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error creating shipment:", error);
    throw error;
  }
};

// ✅ **Update Shipment Status**
export const updateShipmentStatus = async (
  shipmentId: string,
  status: string,
  location: string
) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error("Web3 not initialized. Connect wallet first.");
  }

  try {
    const tx = await shipmentContract.methods
      .updateShipmentStatus(shipmentId, status, location)
      .send({ from: selectedAccount });

    console.log("✅ Shipment Status Updated:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error updating shipment status:", error);
    throw error;
  }
};

// ✅ **Get Shipment Details**
export const getShipmentDetails = async (shipmentId: string) => {
  if (!web3Instance || !shipmentContract) {
    throw new Error("Web3 not initialized. Connect wallet first.");
  }

  try {
    const details = await shipmentContract.methods.getShipmentDetails(shipmentId).call();
    console.log("✅ Shipment Details:", details);
    return details;
  } catch (error) {
    console.error("❌ Error getting shipment details:", error);
    throw error;
  }
};

// ✅ **Listen for Account Changes (Optional)**
if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log("⚠️ Wallet Disconnected");
      selectedAccount = null;
    } else {
      selectedAccount = accounts[0];
      console.log("🔄 Wallet Changed:", selectedAccount);
    }
  });
}

// ✅ **Declare Global Type for Window.ethereum**
declare global {
  interface Window {
    ethereum?: any;
  }
}