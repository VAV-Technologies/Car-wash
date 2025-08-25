'use client';

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { BuyerPersonaTypes, PreferredInvestmentSizes, asianCountries } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

// Schema for buyer creation
const BuyerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  buyerPersonaType: z.string().optional(),
  buyerPersonaOther: z.string().optional(),
  investmentFocusDescription: z.string().optional(),
  preferredInvestmentSize: z.string().optional(),
  keyIndustriesOfInterest: z.string().optional(),
  validateEmail: z.boolean().default(false)
});

// Schema for seller creation
const SellerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  country: z.string().optional(),
  initialCompanyName: z.string().optional(),
  validateEmail: z.boolean().default(false)
});

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: any) => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [createdUser, setCreatedUser] = useState<any>(null);
  const { toast } = useToast();

  const buyerForm = useForm<z.infer<typeof BuyerSchema>>({
    resolver: zodResolver(BuyerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      country: "",
      buyerPersonaType: "",
      buyerPersonaOther: "",
      investmentFocusDescription: "",
      preferredInvestmentSize: "",
      keyIndustriesOfInterest: "",
      validateEmail: false
    }
  });

  const sellerForm = useForm<z.infer<typeof SellerSchema>>({
    resolver: zodResolver(SellerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      country: "",
      initialCompanyName: "",
      validateEmail: false
    }
  });

  const watchedBuyerPersonaType = buyerForm.watch("buyerPersonaType");

  const handleSubmit = (values: any, role: "buyer" | "seller") => {
    setError("");
    setCreatedUser(null);

    startTransition(async () => {
      try {
        // Get auth token for API call
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('sb-'))
          ?.split('=')[1];

        if (!authToken) {
          setError('Authentication required. Please login again.');
          return;
        }

        // Parse token to get access_token
        let accessToken;
        try {
          const tokenData = JSON.parse(decodeURIComponent(authToken));
          accessToken = tokenData.access_token;
        } catch {
          accessToken = authToken; // fallback if it's already the token
        }

        const response = await fetch('/api/admin/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...values,
            role
          })
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Failed to create user');
          toast({
            variant: "destructive",
            title: "Creation Failed",
            description: result.error || 'Failed to create user'
          });
          return;
        }

        setCreatedUser(result.user);
        toast({
          title: "User Created Successfully",
          description: (
            <div className="space-y-1">
              <p>{result.user.fullName} ({result.user.email})</p>
              <p className="text-sm text-muted-foreground">They can now login with their credentials</p>
            </div>
          ) as any
        });

        // Reset form
        if (role === "buyer") {
          buyerForm.reset();
        } else {
          sellerForm.reset();
        }

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.user);
        }

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onOpenChange(false);
          setCreatedUser(null);
          setError("");
        }, 2000);

      } catch (error) {
        console.error('Error creating user:', error);
        setError('An unexpected error occurred');
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while creating the user"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Create a new buyer or seller account with pre-verified email. The user will be able to login immediately.
          </DialogDescription>
        </DialogHeader>

        {createdUser && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              User created successfully! Email: {createdUser.email}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buyer" | "seller")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buyer">Create Buyer</TabsTrigger>
            <TabsTrigger value="seller">Create Seller</TabsTrigger>
          </TabsList>

          <TabsContent value="buyer" className="space-y-4">
            <Form {...buyerForm}>
              <form onSubmit={buyerForm.handleSubmit((values) => handleSubmit(values, "buyer"))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={buyerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Doe" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buyerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john@example.com" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={buyerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Min 8 characters" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buyerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1234567890" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={buyerForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {asianCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="buyerPersonaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buyer Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select buyer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BuyerPersonaTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedBuyerPersonaType === "Other" && (
                  <FormField
                    control={buyerForm.control}
                    name="buyerPersonaOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your specific role" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={buyerForm.control}
                  name="investmentFocusDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Focus</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., SaaS businesses in Southeast Asia..."
                          disabled={isPending}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="preferredInvestmentSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Investment Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investment size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PreferredInvestmentSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="keyIndustriesOfInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Industries of Interest</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g., Technology, E-commerce, Healthcare..."
                          disabled={isPending}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="validateEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Validate email format</FormLabel>
                        <FormDescription>
                          Perform basic email format validation (optional)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Buyer...
                      </>
                    ) : (
                      "Create Buyer"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="seller" className="space-y-4">
            <Form {...sellerForm}>
              <form onSubmit={sellerForm.handleSubmit((values) => handleSubmit(values, "seller"))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sellerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jane Smith" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sellerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="jane@example.com" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sellerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Min 8 characters" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sellerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1234567890" disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={sellerForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {asianCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="initialCompanyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My Business Inc." disabled={isPending} />
                      </FormControl>
                      <FormDescription>
                        Optional - can be added later
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="validateEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Validate email format</FormLabel>
                        <FormDescription>
                          Perform basic email format validation (optional)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Seller...
                      </>
                    ) : (
                      "Create Seller"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}