// app/receiver/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Package,
  MapPin,
  Truck,
  Shield,
  ExternalLink,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { getDatabase, ref, get } from "firebase/database";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { getWalletAddress, connectWallet } from "@/lib/web3";

// Define the Shipment interface
interface Shipment {
  shipmentId: string;
  source: string;
  destination: string;
  contents: string;
  documentUrl: string;
  ipfsHash?: string;
  nftTokenId?: string;
  timestamp: string;
  status?: string;
  receiverId?: string;
}

export default function ReceiverPage() {
  const [shipmentId, setShipmentId] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const { toast } = useToast();

  // Check auth state on load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Check if wallet is connected on load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) return;
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWeb3Connected(true);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    if (typeof window !== "undefined") {
      checkWalletConnection();
    }
  }, []);

  // Function to handle Google login
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Login successful",
        description: "You have been successfully logged in with Google",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Function to handle wallet connection
  const handleConnectWallet = async () => {
    if (isWeb3Connected) return;

    setIsLoading(true);
    try {
      await connectWallet();
      const address = await getWalletAddress();
      setWalletAddress(address);
      setIsWeb3Connected(true);
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      let errorMessage = "Please make sure MetaMask is installed and unlocked";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Wallet connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch shipment by ID
  const fetchShipmentById = async (shipmentId: string) => {
    if (!shipmentId) {
      console.error("Please provide a valid shipment ID.");
      return null;
    }

    const firebaseUrl = `https://blockship-16599-default-rtdb.firebaseio.com/shipments/${shipmentId}.json`;

    try {
      const response = await fetch(firebaseUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data) {
        console.log("Shipment Data:", data);
        return data;
      } else {
        console.log("No shipment found with the provided ID.");
        return null;
      }
    } catch (error) {
      console.error("Error retrieving shipment data:", error);
      return null;
    }
  };

  // Function to fetch shipment data from Firebase
  const fetchShipment = async () => {
    if (!shipmentId) {
      toast({
        title: "Error",
        description: "Please enter a shipment ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const shipmentData = await fetchShipmentById(shipmentId);

      if (shipmentData) {
        setShipment(shipmentData);
        toast({
          title: "Shipment found",
          description: `Shipment ID: ${shipmentData.shipmentId}`,
        });
      } else {
        toast({
          title: "Error",
          description: "No shipment found with this ID",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching shipment data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch shipment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to view the document from IPFS
  const viewDocument = () => {
    if (!shipment || !shipment.documentUrl) {
      toast({
        title: "Error",
        description: "Document URL not available",
        variant: "destructive",
      });
      return;
    }

    window.open(shipment.documentUrl, "_blank");
  };

  // Function to view NFT on blockchain explorer
  const viewNFT = () => {
    if (!shipment || !shipment.nftTokenId) {
      toast({
        title: "Error",
        description: "NFT information not available",
        variant: "destructive",
      });
      return;
    }

    const contractAddress = "0x7F02cCB62e466962c6e929691B159E0369eb5a6a"; // Replace with actual contract address
    window.open(
      `https://etherscan.io/token/${contractAddress}?a=${shipment.nftTokenId}`,
      "_blank"
    );
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Document Receiver Portal</h1>

      {/* Authentication Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Log in and connect your wallet to access shipment documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Google Account
              </Label>
              {!isLoggedIn ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  Sign in with Google
                </Button>
              ) : (
                <div className="flex items-center bg-green-50 text-green-700 p-2 rounded">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Logged in successfully</span>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Blockchain Wallet
              </Label>
              {!isWeb3Connected ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Connecting...
                    </>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              ) : (
                <div className="flex items-center bg-green-50 text-green-700 p-2 rounded">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>
                    Wallet connected: {walletAddress?.substring(0, 6)}...
                    {walletAddress?.substring(walletAddress.length - 4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Your Shipment Document</CardTitle>
          <CardDescription>
            Enter the shipment ID provided by the shipper to find your document
            NFT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              placeholder="Enter Shipment ID"
            />
            <Button onClick={fetchShipment} disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shipment Details */}
      {shipment && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
            <CardDescription>Details of the shipment you searched for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                <span>
                  <strong>ID:</strong> {shipment.shipmentId}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  <strong>Source:</strong> {shipment.source}
                </span>
              </div>
              <div className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                <span>
                  <strong>Destination:</strong> {shipment.destination}
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>
                  <strong>Contents:</strong> {shipment.contents}
                </span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex space-x-4">
              <Button onClick={viewDocument} variant="outline">
                <ExternalLink className="h-5 w-5 mr-2" />
                View Document
              </Button>
              {shipment.nftTokenId && (
                <Button onClick={viewNFT} variant="outline">
                  <Shield className="h-5 w-5 mr-2" />
                  View NFT
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}