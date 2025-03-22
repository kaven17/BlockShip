// app/receiver/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  ExternalLink
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { getDatabase, ref, get } from 'firebase/database';
import { auth, signInWithGoogle } from '@/lib/firebase';
import { getWalletAddress, connectWallet } from '@/lib/web3';

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
  const [shipmentId, setShipmentId] = useState('');
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
        if (typeof window === 'undefined' || !window.ethereum) return;
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWeb3Connected(true);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    if (typeof window !== 'undefined') {
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
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
      const db = getDatabase();
      const shipmentRef = ref(db, `shipments/${shipmentId}`);
      const snapshot = await get(shipmentRef);
      
      if (snapshot.exists()) {
        setShipment(snapshot.val());
      } else {
        setShipment(null);
        toast({
          title: "Shipment not found",
          description: "No shipment found with the provided ID",
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

  // Function to claim the document NFT
  const claimDocument = async () => {
    if (!isLoggedIn || !isWeb3Connected || !shipment) {
      toast({
        title: "Authentication required",
        description: "Please log in with Google and connect your wallet to claim this document",
        variant: "destructive",
      });
      return;
    }

    setClaimLoading(true);
    try {
      // Here you would implement the actual NFT claiming logic
      // This would involve a smart contract interaction to transfer the NFT
      
      // Simulate the process with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update Firebase to mark this document as claimed by this receiver
      const db = getDatabase();
      const shipmentRef = ref(db, `shipments/${shipmentId}`);
      
      // For demonstration, we're just updating the state
      setClaimed(true);
      
      toast({
        title: "Document claimed successfully",
        description: "The document has been transferred to your wallet and is now available to view",
      });
    } catch (error) {
      console.error("Error claiming document:", error);
      toast({
        title: "Error",
        description: "Failed to claim document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaimLoading(false);
    }
  };

  // Function to download or view the document from IPFS
  const viewDocument = () => {
    if (!shipment || !shipment.documentUrl) {
      toast({
        title: "Error",
        description: "Document URL not available",
        variant: "destructive",
      });
      return;
    }

    // Open the document URL in a new tab
    window.open(shipment.documentUrl, '_blank');
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

    // Open etherscan or similar explorer in a new tab
    // This is a placeholder URL, should be replaced with the actual blockchain explorer URL
    const contractAddress = "0x7F02cCB62e466962c6e929691B159E0369eb5a6a"; // Replace with actual contract address
    window.open(`https://etherscan.io/token/${contractAddress}?a=${shipment.nftTokenId}`, '_blank');
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Document Receiver Portal</h1>
      
      {/* Authentication Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Log in and connect your wallet to access shipment documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Google Account</Label>
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
              <Label className="text-sm font-medium mb-2 block">Blockchain Wallet</Label>
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
                  <span>Wallet connected: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}</span>
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
          <CardDescription>Enter the shipment ID provided by the shipper to find your document NFT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter shipment ID (e.g., SHIP-1234)"
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={fetchShipment} 
              disabled={!shipmentId || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Shipment Details with NFT Information */}
      {shipment && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shipment & Document Details</CardTitle>
                <CardDescription>ID: {shipment.shipmentId}</CardDescription>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {shipment.status || "In Transit"}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-500 mb-2">Shipment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contents</span>
                    <span className="font-medium">{shipment.contents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origin</span>
                    <span className="font-medium">{shipment.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination</span>
                    <span className="font-medium">{shipment.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{new Date(shipment.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-500 mb-2">Document Information</h3>
                <div className="space-y-3">
                  {shipment.nftTokenId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">NFT Token ID</span>
                      <span className="font-medium">{shipment.nftTokenId}</span>
                    </div>
                  )}
                  {shipment.ipfsHash && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IPFS Hash</span>
                      <span className="font-medium text-xs md:text-sm">
                        {shipment.ipfsHash.substring(0, 15)}...
                      </span>
                    </div>
                  )}
                  {shipment.documentUrl && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Available</span>
                      <span className="text-green-600">
                        <CheckCircle className="h-4 w-4 inline" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium text-lg mb-4">Document NFT Access</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <FileText className="h-10 w-10 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">Shipment Documentation</p>
                      <p className="text-sm text-gray-500">Stored securely on IPFS as an NFT</p>
                    </div>
                  </div>
                  
                  <div className="space-x-3">
                    {claimed ? (
                      <>
                        <Button
                          variant="default"
                          onClick={viewDocument}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        {shipment.nftTokenId && (
                          <Button
                            variant="outline"
                            onClick={viewNFT}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View NFT
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="default"
                        onClick={claimDocument}
                        disabled={claimLoading || !isLoggedIn || !isWeb3Connected}
                      >
                        {claimLoading ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-2" />
                            Claim Document NFT
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {!isLoggedIn || !isWeb3Connected ? (
                  <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Please login with Google and connect your wallet to claim this document
                  </div>
                ) : claimed ? (
                  <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Document NFT claimed successfully! You now have access to view and download this document.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <div className="flex items-center text-sm text-gray-500">
              <Truck className="h-4 w-4 mr-2" />
              Shipment documents are secured through blockchain technology and IPFS storage
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* No Shipment Found State */}
      {!shipment && !isLoading && shipmentId && (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-medium mb-2">Shipment Not Found</h2>
              <p className="text-gray-500 max-w-md">
                We couldn&apos;t find any shipment with the ID &quot;{shipmentId}&quot;. 
                Please check the ID and try again, or contact the shipper for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Initial State - No Search Yet */}
      {!shipment && !isLoading && !shipmentId && (
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">Enter a Shipment ID</h2>
              <p className="text-gray-500 max-w-md">
                Enter the shipment ID above to access your document NFT.
                You&apos;ll need to authenticate with Google and connect your wallet to claim the document.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}