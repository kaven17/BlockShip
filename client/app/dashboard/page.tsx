"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Package, 
  Truck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { isWalletConnected, getWalletAddress } from '@/lib/web3';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWeb3Connected, setIsWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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
        if (isWalletConnected()) {
          const address = await getWalletAddress();
          setWalletAddress(address);
          setIsWeb3Connected(true);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    // Only run on client
    if (typeof window !== 'undefined') {
      checkWalletConnection();
    }
  }, []);

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Authentication Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`mr-2 h-3 w-3 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p>{isLoggedIn ? 'Logged in' : 'Not logged in'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`mr-2 h-3 w-3 rounded-full ${isWeb3Connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p>{isWeb3Connected ? 'Connected to Ethereum' : 'Not connected to Ethereum'}</p>
            </div>
            {walletAddress && (
              <p className="text-sm text-gray-500 mt-2">
                Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Shipment Overview</CardTitle>
          <CardDescription>Summary of all shipments in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                <Package className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-gray-500 my-8">
        <p>Connect to the Ethereum network and sign in to see your complete dashboard.</p>
      </div>
    </div>
  );
}