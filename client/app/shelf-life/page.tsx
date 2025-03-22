"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Thermometer, 
  Droplets, 
  AlertCircle
} from 'lucide-react';

export default function ShelfLifePage() {
  const [searchBatch, setSearchBatch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchBatch) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Medicine Shelf-Life Predictor</h1>
      
      {/* Search Box */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Track Medicine Shelf-Life</CardTitle>
          <CardDescription>Enter the batch number to get real-time shelf-life information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter batch number (e.g. MED-1234)"
              value={searchBatch}
              onChange={(e) => setSearchBatch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchBatch || isSearching}>
              {isSearching ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* No Medicine Found State */}
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Enter a batch number</h2>
            <p className="text-gray-500 max-w-md">
              Enter a medicine batch number above to view its shelf-life prediction,
              storage requirements, and environmental data analysis.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Environmental Conditions Preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Environmental Monitoring</CardTitle>
          <CardDescription>Overview of optimal storage conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg flex items-center">
              <Thermometer className="h-10 w-10 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Temperature</p>
                <p className="text-2xl font-medium">2°C - 8°C</p>
              </div>
            </div>
            
            <div className="p-4 bg-cyan-50 rounded-lg flex items-center">
              <Droplets className="h-10 w-10 text-cyan-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Humidity</p>
                <p className="text-2xl font-medium">30% - 65%</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg flex items-center">
              <AlertCircle className="h-10 w-10 text-yellow-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Light Exposure</p>
                <p className="text-2xl font-medium">Minimal</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}