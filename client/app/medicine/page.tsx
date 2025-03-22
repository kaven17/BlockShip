"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Goal as Vial, ThermometerSun, Clock } from 'lucide-react';

// Mock data for medicine shelf life
const mockMedicineData = {
  "Insulin": { shelfLife: 30, maxTemp: 8 },
  "Amoxicillin": { shelfLife: 90, maxTemp: 25 },
  "Vaccine": { shelfLife: 180, maxTemp: 5 },
  "Aspirin": { shelfLife: 730, maxTemp: 30 }
};

export default function MedicineTracker() {
  const [formData, setFormData] = useState({
    medicineName: '',
    travelDays: '',
    temperature: '',
  });
  const [result, setResult] = useState<{
    canShip: boolean;
    message: string;
  } | null>(null);

  const checkShipment = () => {
    const medicine = mockMedicineData[formData.medicineName as keyof typeof mockMedicineData];
    
    if (!medicine) {
      setResult({
        canShip: false,
        message: "Medicine not found in database"
      });
      return;
    }

    const travelDays = parseInt(formData.travelDays);
    const temperature = parseFloat(formData.temperature);

    const canShip = travelDays <= medicine.shelfLife && temperature <= medicine.maxTemp;
    
    setResult({
      canShip,
      message: canShip 
        ? `Safe to ship. Medicine shelf life (${medicine.shelfLife} days) exceeds travel time.`
        : `Cannot ship. ${temperature > medicine.maxTemp 
            ? `Temperature too high (max ${medicine.maxTemp}°C)`
            : `Travel time exceeds shelf life (${medicine.shelfLife} days)`}`
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Vial className="mr-2 h-8 w-8" />
        Medicine Shelf Life Tracker
      </h1>

      <Card className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); checkShipment(); }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="medicineName">Medicine Name</Label>
              <Input
                id="medicineName"
                value={formData.medicineName}
                onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                placeholder="Enter medicine name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travelDays" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Travel Days
                </Label>
                <Input
                  id="travelDays"
                  type="number"
                  value={formData.travelDays}
                  onChange={(e) => setFormData({ ...formData, travelDays: e.target.value })}
                  placeholder="Enter travel duration"
                  required
                />
              </div>

              <div>
                <Label htmlFor="temperature" className="flex items-center">
                  <ThermometerSun className="h-4 w-4 mr-1" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="Enter temperature"
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Check Shipment Viability
          </Button>
        </form>

        {result && (
          <Alert className={`mt-6 ${result.canShip ? 'bg-green-50' : 'bg-red-50'}`}>
            <AlertTitle className={result.canShip ? 'text-green-800' : 'text-red-800'}>
              {result.canShip ? 'Shipment Approved' : 'Shipment Not Recommended'}
            </AlertTitle>
            <AlertDescription className={result.canShip ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}
      </Card>
    </div>
  );
}