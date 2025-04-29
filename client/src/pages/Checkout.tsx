import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

const Checkout = () => {
  const { toast } = useToast();
  const [match, params] = useRoute("/checkout/:id");
  const [, setLocation] = useLocation();
  const eventId = params?.id || "";
  
  const urlParams = new URLSearchParams(window.location.search);
  const quantityParam = urlParams.get("quantity") || "1";
  const [quantity] = useState(parseInt(quantityParam));

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  // Set page title
  useEffect(() => {
    document.title = "Checkout - TicketMaster";
  }, []);

  const purchaseMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", `/api/purchases`, data),
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Your tickets have been confirmed.",
        variant: "default",
      });
      setIsSubmitting(false);
      
      // Redirect to a success page or back to the homepage
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !cardNumber || !expiry || !cvc) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to complete your purchase.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate purchase process
    const purchaseData = {
      eventId,
      quantity,
      totalAmount: event ? event.price * quantity : 0,
      customerName: name,
      customerEmail: email,
      // Note: In a real app, you'd use a secure payment processor and not send card details directly
    };
    
    purchaseMutation.mutate(purchaseData);
  };

  if (!match || isLoading) return null;
  
  const totalAmount = event ? event.price * quantity : 0;

  return (
    <div className="container mx-auto my-12 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Enter your payment details to complete your purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. John Smith" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="e.g. john@example.com" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <Input 
                    id="card" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value)} 
                    placeholder="•••• •••• •••• ••••" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      value={expiry} 
                      onChange={(e) => setExpiry(e.target.value)} 
                      placeholder="MM/YY" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input 
                      id="cvc" 
                      value={cvc} 
                      onChange={(e) => setCvc(e.target.value)} 
                      placeholder="123" 
                      required 
                    />
                  </div>
                </div>
                
                <Button className="w-full mt-6" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {event && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-600">{formatDate(event.date)} • {event.time}</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tickets ({quantity})</span>
                      <span>${(event.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>$0.00</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-gray-500">
              <p>All purchases are final. No refunds or exchanges.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
