import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Shield, Mail, Key } from "lucide-react";

// Form schemas
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not logged in
  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Get user role display
  const getUserRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return <Badge className="bg-red-500">Admin</Badge>;
      case "organizer":
        return <Badge className="bg-blue-500">Organizer</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  // Initialize forms
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
      fullName: user.fullName || "",
      bio: user.bio || "",
      profileImage: user.profileImage || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", `/api/user/${user.id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", `/api/user/${user.id}/password`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update password");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    // Only submit fields that have changed
    const changedData = Object.keys(data).reduce((acc, key) => {
      const k = key as keyof typeof data;
      if (data[k] !== user[k as keyof typeof user]) {
        // @ts-ignore
        acc[k] = data[k];
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(changedData).length === 0) {
      toast({
        title: "No changes",
        description: "No changes were made to your profile.",
      });
      return;
    }

    updateProfileMutation.mutate(changedData as z.infer<typeof profileSchema>);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    const { currentPassword, newPassword } = data;
    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profileImage} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-gray-500 text-sm">@{user.username}</span>
              {getUserRoleBadge()}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={updateProfileMutation.isPending} 
                                  placeholder="username" 
                                />
                              </FormControl>
                              <FormDescription>
                                This is your public display name
                              </FormDescription>
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
                                <Input 
                                  {...field} 
                                  type="email" 
                                  disabled={updateProfileMutation.isPending} 
                                  placeholder="email@example.com" 
                                />
                              </FormControl>
                              <FormDescription>
                                Your email address (we will never share it)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={updateProfileMutation.isPending} 
                                  placeholder="John Doe" 
                                />
                              </FormControl>
                              <FormDescription>
                                Your full name (optional)
                              </FormDescription>
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
                                <Input 
                                  {...field} 
                                  disabled={updateProfileMutation.isPending} 
                                  placeholder="https://example.com/avatar.jpg" 
                                />
                              </FormControl>
                              <FormDescription>
                                A URL to your profile image (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                disabled={updateProfileMutation.isPending} 
                                placeholder="Tell us a little about yourself" 
                                className="min-h-32" 
                              />
                            </FormControl>
                            <FormDescription>
                              A brief biography about yourself (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="min-w-32"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </div>
                        ) : "Save Changes"}
                      </Button>
                    </div>
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
                  Update your password and manage account security
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
                              {...field} 
                              type="password" 
                              disabled={updatePasswordMutation.isPending} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your current password to verify your identity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                disabled={updatePasswordMutation.isPending} 
                              />
                            </FormControl>
                            <FormDescription>
                              Choose a strong password (at least 6 characters)
                            </FormDescription>
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
                                {...field} 
                                type="password" 
                                disabled={updatePasswordMutation.isPending} 
                              />
                            </FormControl>
                            <FormDescription>
                              Confirm your new password
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="min-w-32"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </div>
                        ) : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
              
              <CardFooter className="flex flex-col items-start">
                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Account Email</span>
                    </div>
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Account Role</span>
                    </div>
                    <span>{getUserRoleBadge()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">Member Since</span>
                    </div>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;