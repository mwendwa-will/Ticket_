import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, User, Settings, LogOut, Key, CreditCard, Bell } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Get user details
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ["/api/user", user.id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/user/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user details");
      return await res.json();
    },
    enabled: !!user,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", `/api/user/${user.id}`, data);
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", `/api/user/${user.id}/password`, data);
      if (!res.ok) throw new Error("Failed to update password");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // General profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userDetails?.fullName || user.fullName || "",
      email: userDetails?.email || user.email || "",
      bio: userDetails?.bio || "",
      phone: userDetails?.phone || "",
      profileImage: userDetails?.profileImage || "",
    },
    values: {
      fullName: userDetails?.fullName || user.fullName || "",
      email: userDetails?.email || user.email || "",
      bio: userDetails?.bio || "",
      phone: userDetails?.phone || "",
      profileImage: userDetails?.profileImage || "",
    },
  });

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      },
    });
  };

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-16 min-h-[calc(100vh-64px)]">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userDetails?.profileImage || ""} alt={userDetails?.fullName || user.username} />
              <AvatarFallback className="text-lg">{userDetails?.fullName?.[0] || user.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{userDetails?.fullName || user.username}</h2>
              <p className="text-sm text-gray-500">{userDetails?.role || user.role}</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium">
              Account
            </div>
            <div className="divide-y">
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={() => setActiveTab("general")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>General</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={() => setActiveTab("security")}
              >
                <Key className="mr-2 h-4 w-4" />
                <span>Security</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={() => setActiveTab("billing")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-4 py-2 h-auto"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>
                    Update your personal information and public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={updateProfileMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} disabled={updateProfileMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={updateProfileMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="profileImage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image URL</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={updateProfileMutation.isPending} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={4} 
                                placeholder="Tell us a bit about yourself" 
                                {...field} 
                                disabled={updateProfileMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {updateProfileMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving changes...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Save changes
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                disabled={updatePasswordMutation.isPending} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                disabled={updatePasswordMutation.isPending} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                disabled={updatePasswordMutation.isPending} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {updatePasswordMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating password...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            Update password
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Payments</CardTitle>
                  <CardDescription>
                    Manage your payment methods and view your purchase history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <h3 className="font-semibold mb-2">Billing Management Coming Soon</h3>
                    <p className="text-sm text-gray-500">
                      We're working on adding functionality to manage your payment methods and billing preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <h3 className="font-semibold mb-2">Notification Management Coming Soon</h3>
                    <p className="text-sm text-gray-500">
                      We're working on adding functionality to customize your notification preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;