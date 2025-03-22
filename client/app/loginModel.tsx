import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

export default function LoginModal({ showLoginModal, setShowLoginModal }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!showLoginModal) return null;

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful",
        description: "You have been successfully logged in",
      });
      setShowLoginModal(false);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <div className="mb-4">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between">
          <Button onClick={handleLogin}>Login</Button>
          <Button variant="outline" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}