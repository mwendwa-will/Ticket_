import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Clock, MapPin, DollarSign, Check, TicketIcon } from "lucide-react";

// Form validation schema
const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  genre: z.string().min(3, "Genre must be at least 3 characters"),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  capacity: z.string().regex(/^\d+$/, "Capacity must be a number"),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventCreationPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0], // Today's date
      time: "19:00",
      location: "",
      price: "",
      genre: "",
      imageUrl: "",
      capacity: "",
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormValues) => {
      const res = await apiRequest("POST", "/api/events", eventData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create event");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created successfully",
        description: "Your event has been created and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-events"] });
      setLocation("/my-events");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };
  
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create a New Event
          </h1>
          <p className="text-gray-600">
            Fill in the details below to create and publish your event.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Enter all the information about your event. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a descriptive title for your event" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed prominently on your event page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of your event" 
                            className="min-h-32" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Include all important details about what attendees can expect.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Date and Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Date and Time</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                type="date" 
                                className="pl-10" 
                                {...field} 
                                disabled={createEventMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                type="time" 
                                className="pl-10" 
                                {...field} 
                                disabled={createEventMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Location and Capacity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location and Capacity</h3>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input 
                              placeholder="Venue name and address" 
                              className="pl-10" 
                              {...field} 
                              disabled={createEventMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Maximum number of attendees" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          The total number of tickets available for this event.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Category and Price */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Category and Price</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category/Genre *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Concert, Festival, Workshop" 
                              {...field} 
                              disabled={createEventMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="0.00" 
                                className="pl-10" 
                                {...field} 
                                disabled={createEventMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Event Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Event Image</h3>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a URL for your event image" 
                            {...field} 
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image that represents your event. Recommended size: 800x500px.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("imageUrl") && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      <div className="aspect-video w-full max-w-md mx-auto overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={form.watch("imageUrl")} 
                          alt="Event preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/800x500/e2e8f0/64748b?text=Image+not+found";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating Event...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TicketIcon className="h-4 w-4" />
                      Create Event
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCreationPage;