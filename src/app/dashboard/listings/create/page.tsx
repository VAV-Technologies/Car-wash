'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { industries, asianCountries, revenueRanges, profitMarginRanges, askingPriceRanges, dealStructures } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";

const ListingSchema = z.object({
  listingTitleAnonymous: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title too long."),
  industry: z.string().min(1, "Industry is required."),
  locationCountry: z.string().min(1, "Country is required."),
  locationCityRegionGeneral: z.string().min(2, "City/Region is required.").max(50, "City/Region too long."),
  anonymousBusinessDescription: z.string().min(50, "Description must be at least 50 characters.").max(2000, "Description too long (max 2000 chars)."),
  keyStrengthsAnonymous: z.array(z.string().min(1, "Strength cannot be empty.")).min(1, "At least one key strength is required.").max(5, "Maximum of 5 key strengths."),
  annualRevenueRange: z.string().min(1, "Annual revenue range is required."),
  netProfitMarginRange: z.string().optional(),
  askingPriceRange: z.string().min(1, "Asking price range is required."),
  dealStructureLookingFor: z.array(z.string()).optional(),
  reasonForSellingAnonymous: z.string().max(500, "Reason too long (max 500 chars).").optional(),
});

type ListingFormValues = z.infer<typeof ListingSchema>;

export default function CreateListingPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [keyStrengthsFields, setKeyStrengthsFields] = useState<string[]>(['']);


  const form = useForm<ListingFormValues>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      listingTitleAnonymous: "",
      industry: "",
      locationCountry: "",
      locationCityRegionGeneral: "",
      anonymousBusinessDescription: "",
      keyStrengthsAnonymous: [""],
      annualRevenueRange: "",
      netProfitMarginRange: "",
      askingPriceRange: "",
      dealStructureLookingFor: [],
      reasonForSellingAnonymous: "",
    },
  });

  const handleAddStrength = () => {
    if (keyStrengthsFields.length < 5) {
      setKeyStrengthsFields([...keyStrengthsFields, '']);
      // Also update react-hook-form's array
      const currentStrengths = form.getValues("keyStrengthsAnonymous") || [];
      form.setValue("keyStrengthsAnonymous", [...currentStrengths, '']);

    }
  };

  const handleRemoveStrength = (index: number) => {
    if (keyStrengthsFields.length > 1) {
      const newStrengths = keyStrengthsFields.filter((_, i) => i !== index);
      setKeyStrengthsFields(newStrengths);
       // Also update react-hook-form's array
      const currentStrengths = form.getValues("keyStrengthsAnonymous") || [];
      form.setValue("keyStrengthsAnonymous", currentStrengths.filter((_, i) => i !== index));
    }
  };
  
  const handleStrengthChange = (index: number, value: string) => {
    const newStrengths = [...keyStrengthsFields];
    newStrengths[index] = value;
    setKeyStrengthsFields(newStrengths);
    // Also update react-hook-form's array
    const currentStrengths = form.getValues("keyStrengthsAnonymous") || [];
    currentStrengths[index] = value;
    form.setValue("keyStrengthsAnonymous", currentStrengths);
  };


  const onSubmit = (values: ListingFormValues) => {
    // Filter out empty strings from keyStrengthsAnonymous before submission
    const cleanedValues = {
      ...values,
      keyStrengthsAnonymous: values.keyStrengthsAnonymous.filter(strength => strength.trim() !== "")
    };

    startTransition(async () => {
      console.log("Create listing values:", cleanedValues);
      // Placeholder for server action
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: "Listing Created", description: "Your business listing has been successfully created and is pending review/verification." });
      form.reset();
      setKeyStrengthsFields(['']);
      // Potentially redirect: router.push('/dashboard/listings');
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Create New Business Listing</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Section 1: Basic Information</CardTitle>
              <CardDescription>Provide the essential details for your listing. This information will be displayed anonymously initially.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="listingTitleAnonymous" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title (Anonymous)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Profitable E-commerce Store in Southeast Asia" disabled={isPending} /></FormControl>
                    <FormDescription>A catchy, anonymous title for your business.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="industry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                        <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="locationCountry" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Country)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                        <SelectContent>{asianCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={form.control} name="locationCityRegionGeneral" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (General City/Region)</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., Metro Manila, Bangkok Area" disabled={isPending} /></FormControl>
                    <FormDescription>Keep this general for anonymity (e.g., "Nationwide" or a major metro area).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Section 2: Business Details (Anonymous Version)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="anonymousBusinessDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anonymous Business Description</FormLabel>
                    <FormControl><Textarea {...field} rows={6} placeholder="Describe your business, products/services, market position, and growth potential without revealing identifying details." disabled={isPending} /></FormControl>
                    <FormDescription>Max 2000 characters. Be descriptive but maintain anonymity.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keyStrengthsAnonymous"
                render={() => ( // We use Controller for dynamic fields here, but for simplicity, manage state outside for now
                  <FormItem>
                    <FormLabel>Key Strengths (Anonymous)</FormLabel>
                    <FormDescription>List 1-5 key strengths of your business.</FormDescription>
                    {keyStrengthsFields.map((strength, index) => (
                       <div key={index} className="flex items-center gap-2">
                          <Input
                            value={strength}
                            onChange={(e) => handleStrengthChange(index, e.target.value)}
                            placeholder={`Strength ${index + 1}`}
                            disabled={isPending}
                            className="flex-grow"
                          />
                          {keyStrengthsFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStrength(index)} disabled={isPending}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                    ))}
                    {keyStrengthsFields.length < 5 && (
                       <Button type="button" variant="outline" size="sm" onClick={handleAddStrength} disabled={isPending}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Strength
                        </Button>
                    )}
                    <FormMessage>{form.formState.errors.keyStrengthsAnonymous?.message || form.formState.errors.keyStrengthsAnonymous?.[0]?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Section 3: Financial Summary (Ranges - Anonymous)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="annualRevenueRange" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Annual Revenue Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select revenue range" /></SelectTrigger></FormControl>
                                <SelectContent>{revenueRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="netProfitMarginRange" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Net Profit Margin Range (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select profit margin" /></SelectTrigger></FormControl>
                                <SelectContent>{profitMarginRanges.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="askingPriceRange" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Asking Price Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select asking price range" /></SelectTrigger></FormControl>
                            <SelectContent>{askingPriceRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Section 4: Deal Structure (Optional, Anonymous)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="dealStructureLookingFor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Looking for:</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {dealStructures.map((item) => (
                            <FormField
                            key={item}
                            control={form.control}
                            name="dealStructureLookingFor"
                            render={({ field: itemField }) => { // Renamed field to itemField
                                return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={itemField.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? itemField.onChange([...(itemField.value || []), item])
                                            : itemField.onChange(
                                                itemField.value?.filter(
                                                (value) => value !== item
                                                )
                                            );
                                        }}
                                        disabled={isPending}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item}</FormLabel>
                                </FormItem>
                                );
                            }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="reasonForSellingAnonymous" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Selling (Optional, for anonymous summary)</FormLabel>
                    <FormControl><Textarea {...field} rows={3} placeholder="Briefly state your reason for selling (e.g., Retirement, Other ventures)." disabled={isPending} /></FormControl>
                    <FormDescription>Max 500 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Separator />
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPending}>
                Reset Form
            </Button>
            <Button type="submit" className="min-w-[150px]" disabled={isPending}>
                {isPending ? "Submitting..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
