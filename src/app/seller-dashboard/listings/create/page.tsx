
'use client';

// Force dynamic rendering due to client-side interactivity
export const dynamic = 'force-dynamic'

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { industries, asianCountries, revenueRanges, profitMarginRanges, dealStructures, employeeCountRanges } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, AlertCircle, ShieldCheck, Save, RotateCcw, FileText, Building, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { NobridgeIcon } from '@/components/ui/nobridge-icon';
import Link from "next/link";
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];

const fileValidation = z.instanceof(File)
  .optional()
  .refine(file => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(file => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png, .webp formats are supported.');

const documentFileValidation = z.instanceof(File)
  .optional()
  .refine(file => !file || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(file => !file || ACCEPTED_DOCUMENT_TYPES.includes(file.type), 'Only PDF, XLSX, CSV formats are supported.');

const ListingSchema = z.object({
  listingTitleAnonymous: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title too long."),
  industry: z.string().min(1, "Industry is required."),
  locationCountry: z.string().min(1, "Country is required."),
  locationCityRegionGeneral: z.string().min(2, "City/Region is required.").max(50, "City/Region too long."),
  anonymousBusinessDescription: z.string().min(50, "Description must be at least 50 characters.").max(2000, "Description too long (max 2000 chars)."),

  keyStrength1: z.string().min(5, "Strength must be at least 5 characters.").max(150, "Strength too long (max 150 chars).optional()").optional(),
  keyStrength2: z.string().min(5, "Strength must be at least 5 characters.").max(150, "Strength too long (max 150 chars).").optional(),
  keyStrength3: z.string().min(5, "Strength must be at least 5 characters.").max(150, "Strength too long (max 150 chars).").optional(),

  businessModel: z.string().optional(),
  yearEstablished: z.coerce.number().optional().refine(val => val === undefined || (val >= 1900 && val <= new Date().getFullYear()), {
    message: "Please enter a valid year.",
  }),
  registeredBusinessName: z.string().optional(),
  businessWebsiteUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  socialMediaLinks: z.string().optional(),
  numberOfEmployees: z.string().optional(),

  annualRevenueRange: z.string().min(1, "Annual revenue range is required."),
  netProfitMarginRange: z.string().optional(),
  askingPrice: z.coerce.number({ invalid_type_error: "Asking price must be a number." }).positive({ message: "Asking price must be positive." }).optional(),

  specificAnnualRevenueLastYear: z.coerce.number({ invalid_type_error: "Specific annual revenue must be a number." }).optional(),
  specificNetProfitLastYear: z.coerce.number({ invalid_type_error: "Specific net profit must be a number." }).optional(),
  adjustedCashFlow: z.coerce.number({ invalid_type_error: "Adjusted cash flow must be a number." }).optional(),
  ebitda: z.coerce.number({ invalid_type_error: "EBITDA must be a number." }).optional(),

  dealStructureLookingFor: z.array(z.string()).optional(),
  reasonForSellingAnonymous: z.string().max(500, "Reason too long (max 500 chars).").optional(),
  detailedReasonForSelling: z.string().optional(),

  growthOpportunity1: z.string().min(5, "Growth opportunity must be at least 5 characters.").max(200, "Opportunity too long (max 200 chars).").optional(),
  growthOpportunity2: z.string().min(5, "Growth opportunity must be at least 5 characters.").max(200, "Opportunity too long (max 200 chars).").optional(),
  growthOpportunity3: z.string().min(5, "Growth opportunity must be at least 5 characters.").max(200, "Opportunity too long (max 200 chars).").optional(),

  imageFile1: fileValidation,
  imageFile2: fileValidation,
  imageFile3: fileValidation,
  imageFile4: fileValidation,
  imageFile5: fileValidation,

  financialDocuments: documentFileValidation,
  keyMetricsReport: documentFileValidation,
  ownershipDocuments: documentFileValidation,
  financialSnapshot: documentFileValidation,
  ownershipDetails: documentFileValidation,
  locationRealEstateInfo: documentFileValidation,
  webPresenceInfo: documentFileValidation,
  secureDataRoomLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),

  technologyStack: z.string().optional(),
  actualCompanyName: z.string().optional(),
  fullBusinessAddress: z.string().optional(),
  adjustedCashFlowExplanation: z.string().optional(),
  sellerRoleAndTimeCommitment: z.string().optional(),
  postSaleTransitionSupport: z.string().optional(),
}).refine(data => {
  const strengths = [data.keyStrength1, data.keyStrength2, data.keyStrength3].filter(s => s && s.trim() !== "");
  return strengths.length >= 1;
}, {
  message: "At least one key strength is required.",
  path: ["keyStrength1"],
});

type ListingFormValues = z.infer<typeof ListingSchema>;

export default function CreateSellerListingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { profile } = useAuth();
  const isSellerVerified = profile?.verification_status === 'verified';

  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([null, null, null, null, null]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      listingTitleAnonymous: "", industry: "", locationCountry: "", locationCityRegionGeneral: "", anonymousBusinessDescription: "",
      keyStrength1: "", keyStrength2: "", keyStrength3: "",
      businessModel: "", yearEstablished: undefined, registeredBusinessName: "", businessWebsiteUrl: "", socialMediaLinks: "", numberOfEmployees: undefined,
      annualRevenueRange: "", netProfitMarginRange: "", askingPrice: undefined, specificAnnualRevenueLastYear: undefined, specificNetProfitLastYear: undefined, adjustedCashFlow: undefined, ebitda: undefined,
      dealStructureLookingFor: [], reasonForSellingAnonymous: "", detailedReasonForSelling: "",
      growthOpportunity1: "", growthOpportunity2: "", growthOpportunity3: "",
      imageFile1: undefined, imageFile2: undefined, imageFile3: undefined, imageFile4: undefined, imageFile5: undefined,
      financialDocuments: undefined, keyMetricsReport: undefined, ownershipDocuments: undefined, financialSnapshot: undefined, ownershipDetails: undefined, locationRealEstateInfo: undefined, webPresenceInfo: undefined, secureDataRoomLink: "",
      technologyStack: "", actualCompanyName: "", fullBusinessAddress: "", adjustedCashFlowExplanation: "", sellerRoleAndTimeCommitment: "", postSaleTransitionSupport: "",
    },
  });

  const { clearSavedData, saveNow } = useFormPersistence(form, {
    storageKey: 'create-listing-draft',
    debounceMs: 2000,
    excludeFields: [
      'imageFile1', 'imageFile2', 'imageFile3', 'imageFile4', 'imageFile5',
      'financialDocuments', 'keyMetricsReport', 'ownershipDocuments',
      'financialSnapshot', 'ownershipDetails', 'locationRealEstateInfo', 'webPresenceInfo'
    ],
  });

  const handleImageFileChange = (index: number, file: File | null) => {
    const newPreviewUrls = [...previewUrls];
    // Revoke old object URL if it exists for this slot's preview
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]!);
    }
    if (file) {
      newPreviewUrls[index] = URL.createObjectURL(file);
    } else {
      newPreviewUrls[index] = null;
    }
    setPreviewUrls(newPreviewUrls);
    // Update React Hook Form state
    form.setValue(`imageFile${index + 1}` as `imageFile1`, file || undefined);
  };

  useEffect(() => {
    // Cleanup object URLs on unmount or when previewUrls change for already revoked ones
    return () => {
      previewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []); // Only run on unmount

  const onSubmit = async (values: ListingFormValues) => {
    console.log('[FORM-SUBMIT] Starting submission with values:', Object.keys(values).length, 'fields');
    startTransition(async () => {
      try {
        const requiredFields = {
          listingTitleAnonymous: 'Listing Title',
          anonymousBusinessDescription: 'Business Description',
          askingPrice: 'Asking Price',
          industry: 'Industry',
          locationCountry: 'Country',
          locationCityRegionGeneral: 'City/Region',
          annualRevenueRange: 'Annual Revenue Range',
        };
        const missingFields = Object.entries(requiredFields)
          .filter(([key]) => !values[key as keyof ListingFormValues])
          .map(([, label]) => label);

        if (missingFields.length > 0) {
          toast({
            title: "❌ Missing Required Information",
            description: `Please fill in: ${missingFields.join(', ')}`,
            variant: "destructive"
          });
          return;
        }
        if (!values.askingPrice || values.askingPrice <= 0) {
          toast({ title: "❌ Invalid Asking Price", description: "Please enter a valid asking price greater than 0.", variant: "destructive" });
          return;
        }

        // 🔥 STEP 1: Create listing first (without documents) to get listing ID
        toast({
          title: "🚀 Creating Listing",
          description: "Setting up your business listing...",
        });

        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (!accessToken) throw new Error('Authentication required');

        const initialSubmissionData = {
          listingTitleAnonymous: String(values.listingTitleAnonymous).trim(),
          anonymousBusinessDescription: String(values.anonymousBusinessDescription).trim(),
          askingPrice: Number(values.askingPrice),
          industry: String(values.industry).trim(),
          locationCountry: String(values.locationCountry).trim(),
          locationCityRegionGeneral: String(values.locationCityRegionGeneral).trim(),
          yearEstablished: values.yearEstablished || null,
          registeredBusinessName: values.registeredBusinessName ? String(values.registeredBusinessName).trim() : null,
          businessWebsiteUrl: values.businessWebsiteUrl ? String(values.businessWebsiteUrl).trim() : null,
          socialMediaLinks: values.socialMediaLinks ? String(values.socialMediaLinks).trim() : null,
          numberOfEmployees: values.numberOfEmployees || null,
          businessModel: values.businessModel ? String(values.businessModel).trim() : null,
          annualRevenueRange: values.annualRevenueRange || null,
          netProfitMarginRange: values.netProfitMarginRange || null,
          specificAnnualRevenueLastYear: values.specificAnnualRevenueLastYear || null,
          specificNetProfitLastYear: values.specificNetProfitLastYear || null,
          adjustedCashFlow: values.adjustedCashFlow || null,
          ebitda: values.ebitda || null,
          keyStrength1: values.keyStrength1 ? String(values.keyStrength1).trim() : null,
          keyStrength2: values.keyStrength2 ? String(values.keyStrength2).trim() : null,
          keyStrength3: values.keyStrength3 ? String(values.keyStrength3).trim() : null,
          growthOpportunity1: values.growthOpportunity1 ? String(values.growthOpportunity1).trim() : null,
          growthOpportunity2: values.growthOpportunity2 ? String(values.growthOpportunity2).trim() : null,
          growthOpportunity3: values.growthOpportunity3 ? String(values.growthOpportunity3).trim() : null,
          dealStructureLookingFor: Array.isArray(values.dealStructureLookingFor) ? values.dealStructureLookingFor : [],
          reasonForSellingAnonymous: values.reasonForSellingAnonymous ? String(values.reasonForSellingAnonymous).trim() : null,
          detailedReasonForSelling: values.detailedReasonForSelling ? String(values.detailedReasonForSelling).trim() : null,
          technologyStack: values.technologyStack ? String(values.technologyStack).trim() : null,
          actualCompanyName: values.actualCompanyName ? String(values.actualCompanyName).trim() : null,
          fullBusinessAddress: values.fullBusinessAddress ? String(values.fullBusinessAddress).trim() : null,
          adjustedCashFlowExplanation: values.adjustedCashFlowExplanation ? String(values.adjustedCashFlowExplanation).trim() : null,
          sellerRoleAndTimeCommitment: values.sellerRoleAndTimeCommitment ? String(values.sellerRoleAndTimeCommitment).trim() : null,
          postSaleTransitionSupport: values.postSaleTransitionSupport ? String(values.postSaleTransitionSupport).trim() : null,
          secureDataRoomLink: values.secureDataRoomLink ? String(values.secureDataRoomLink).trim() : null,
          // Start with empty arrays - will be updated after uploads
          image_urls: [],
        };

        const createResponse = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(initialSubmissionData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create listing');
        }

        const createdListing = await createResponse.json();
        const listingId = createdListing.listing.id;

        console.log(`[CREATE-LISTING] Created listing with ID: ${listingId}`);

        // 🔥 STEP 2: Upload documents with correct listing ID
        toast({
          title: "📁 Uploading Documents",
          description: "Uploading your business documents...",
        });

        const documentUploads: Record<string, string | null> = {};
        const documentFieldsToUpload = [
          'financialDocuments', 'keyMetricsReport', 'ownershipDocuments',
          'financialSnapshot', 'ownershipDetails', 'locationRealEstateInfo', 'webPresenceInfo'
        ];

        for (const fieldName of documentFieldsToUpload) {
          const file = values[fieldName as keyof ListingFormValues] as File | undefined;
          const dbFieldName = `${fieldName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')}_url`;
          if (file) {
            console.log(`[CREATE-UPLOAD] Starting ${fieldName} upload for listing: ${listingId}`);

            // 🔥 FIX: Use XMLHttpRequest for progress tracking
            const uploadResult = await new Promise<{ signedUrl: string }>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              const formData = new FormData();
              formData.append('file', file);
              formData.append('document_type', fieldName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''));
              formData.append('listing_id', listingId); // 🔥 FIX: Now we have the listing ID!

              let lastProgress = 0;
              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  const progress = Math.round((e.loaded / e.total) * 100);
                  if (progress !== lastProgress && progress % 20 === 0) { // Log every 20%
                    console.log(`[CREATE-UPLOAD] ${fieldName} progress: ${progress}%`);
                    lastProgress = progress;
                  }
                }
              });

              xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                  try {
                    const result = JSON.parse(xhr.responseText);
                    console.log(`[CREATE-UPLOAD] ${fieldName} uploaded successfully`);
                    resolve(result);
                  } catch (e) {
                    console.error(`[CREATE-UPLOAD] Failed to parse response for ${fieldName}:`, e);
                    reject(new Error(`Failed to parse upload response for ${fieldName}`));
                  }
                } else {
                  // Enhanced error logging with response details
                  try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    console.error(`[CREATE-UPLOAD] Upload failed for ${fieldName}: ${xhr.status}`, {
                      error: errorResponse.error,
                      code: errorResponse.code,
                      details: errorResponse.details
                    });
                    reject(new Error(`Upload failed for ${fieldName}: ${errorResponse.error || xhr.status}`));
                  } catch (e) {
                    console.error(`[CREATE-UPLOAD] Upload failed for ${fieldName}: ${xhr.status} - ${xhr.responseText}`);
                    reject(new Error(`Upload failed for ${fieldName}: ${xhr.status}`));
                  }
                }
              });

              xhr.addEventListener('error', () => {
                console.error(`[CREATE-UPLOAD] Network error uploading ${fieldName}`);
                reject(new Error(`Network error uploading ${fieldName}`));
              });

              xhr.addEventListener('timeout', () => {
                console.error(`[CREATE-UPLOAD] Timeout uploading ${fieldName}`);
                reject(new Error(`Timeout uploading ${fieldName}`));
              });

              xhr.open('POST', '/api/listings/upload');
              xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
              xhr.timeout = 60000; // 60 second timeout
              xhr.send(formData);
            });

            documentUploads[dbFieldName] = uploadResult.signedUrl;
          } else {
            documentUploads[dbFieldName] = null; // Explicitly set to null if no file
          }
        }

        // 🔥 STEP 3: Upload images with listing ID
        toast({
          title: "🖼️ Uploading Images",
          description: "Uploading your business images...",
        });

        const imageUploadPromises: Promise<string | null>[] = [];
        for (let i = 0; i < 5; i++) {
          const file = values[`imageFile${i + 1}` as keyof ListingFormValues] as File | undefined;
          if (file) {
            imageUploadPromises.push(
              (async () => {
                return new Promise<string | null>((resolve, reject) => {
                  const xhr = new XMLHttpRequest();
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('document_type', `image_url_${i + 1}`);
                  formData.append('listing_id', listingId); // 🔥 FIX: Now we have the listing ID!

                  console.log(`[CREATE-IMAGE] Starting image ${i + 1} upload for listing: ${listingId}`);

                  xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                      const progress = (e.loaded / e.total) * 100;
                      console.log(`[CREATE-IMAGE] Image ${i + 1} progress: ${progress.toFixed(1)}%`);
                    }
                  });

                  xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                      try {
                        const result = JSON.parse(xhr.responseText);
                        console.log(`[CREATE-IMAGE] Image ${i + 1} uploaded successfully`);
                        resolve(result.signedUrl);
                      } catch (e) {
                        console.error(`[CREATE-IMAGE] Failed to parse response for image ${i + 1}:`, e);
                        reject(new Error(`Failed to parse response for image ${i + 1}`));
                      }
                    } else {
                      // Enhanced error logging with response details
                      try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        console.error(`[CREATE-IMAGE] Failed to upload image ${i + 1}: ${xhr.status}`, {
                          error: errorResponse.error,
                          code: errorResponse.code,
                          details: errorResponse.details
                        });
                      } catch (e) {
                        console.error(`[CREATE-IMAGE] Failed to upload image ${i + 1}: ${xhr.status} - ${xhr.responseText}`);
                      }
                      reject(new Error(`Failed to upload image ${i + 1}: ${xhr.status}`));
                    }
                  });

                  xhr.addEventListener('error', () => {
                    console.error(`[CREATE-IMAGE] Network error uploading image ${i + 1}`);
                    reject(new Error(`Network error uploading image ${i + 1}`));
                  });

                  xhr.addEventListener('timeout', () => {
                    console.error(`[CREATE-IMAGE] Timeout uploading image ${i + 1}`);
                    reject(new Error(`Timeout uploading image ${i + 1}`));
                  });

                  xhr.open('POST', '/api/listings/upload');
                  xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
                  xhr.timeout = 60000; // 60 second timeout
                  xhr.send(formData);
                });
              })()
            );
          } else {
            imageUploadPromises.push(Promise.resolve(null));
          }
        }

        const uploadedImageUrlsResults = await Promise.all(imageUploadPromises);
        // Filter out null values to create clean array for JSONB storage
        const imageUrls = uploadedImageUrlsResults.filter(url => url !== null);


        // 🔥 STEP 4: Update listing with uploaded URLs
        toast({
          title: "🔄 Finalizing Listing",
          description: "Linking your documents to the listing...",
        });

        const updatePayload = {
          // Use JSONB array format for images (matches database schema)
          image_urls: imageUrls,
          ...documentUploads,
        };

        const updateResponse = await fetch(`/api/listings/${listingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify(updatePayload),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update listing with documents');
        }

        const result = await updateResponse.json();
        console.log(`[CREATE-LISTING] Updated listing ${listingId} with ${imageUrls.length} images and ${Object.keys(documentUploads).filter(k => documentUploads[k]).length} documents`);

        setPreviewUrls([null, null, null, null, null]); // Clear previews
        clearSavedData();
        form.reset();

        // 🔥 Enhanced success message
        const uploadedDocsCount = Object.keys(documentUploads).filter(k => documentUploads[k]).length;
        const uploadedImagesCount = imageUrls.length;

        toast({
          title: "✅ Listing Created Successfully!",
          description: `Your listing has been created with ${uploadedDocsCount} documents and ${uploadedImagesCount} images. Documents are now visible to verified buyers.`,
          duration: 5000,
        });

        router.push('/seller-dashboard/listings?created=true');

      } catch (error) {
        const userMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        toast({ title: "❌ Error Creating Listing", description: userMessage, variant: "destructive" });
      }
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { saveNow(); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveNow]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-dark-blue font-heading">Create New Business Listing</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Save className="h-4 w-4" /><span>Form auto-saves as you type</span>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading">Section 1: Basic Information (Anonymous)</CardTitle><CardDescription>Provide the essential details for your listing. This information will be displayed anonymously initially.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="listingTitleAnonymous" render={({ field }) => (<FormItem><FormLabel>Listing Title (Anonymous)</FormLabel><FormControl><Input {...field} placeholder="e.g., Profitable E-commerce Store in Southeast Asia" disabled={isPending} /></FormControl><FormDescription>A catchy, anonymous title for your business.</FormDescription><FormMessage /></FormItem>)} />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="industry" render={({ field }) => (<FormItem><FormLabel>Industry</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={isPending}><FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl><SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="locationCountry" render={({ field }) => (<FormItem><FormLabel>Location (Country)</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={isPending}><FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl><SelectContent>{asianCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="locationCityRegionGeneral" render={({ field }) => (<FormItem><FormLabel>Location (General City/Region)</FormLabel><FormControl><Input {...field} placeholder="e.g., Metro Manila, Bangkok Area" disabled={isPending} /></FormControl><FormDescription>Keep this general for anonymity (e.g., "Nationwide" or a major metro area).</FormDescription><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading">Section 2: Business Profile &amp; Operations</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="anonymousBusinessDescription" render={({ field }) => (<FormItem><FormLabel>Business Description</FormLabel><FormControl><Textarea {...field} rows={6} placeholder="Describe your business, products/services, market position, and growth potential without revealing identifying details." disabled={isPending} /></FormControl><FormDescription>Max 2000 characters.</FormDescription><FormMessage /></FormItem>)} />
              <div className="space-y-2">
                <Label className="text-brand-dark-blue">Key Strengths (1-3 points)</Label><FormDescription>Highlight the main advantages of your business.</FormDescription>
                <FormField control={form.control} name="keyStrength1" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Strength 1 (e.g., Strong recurring revenue)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="keyStrength2" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Strength 2 (Optional)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="keyStrength3" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Strength 3 (Optional)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="businessModel" render={({ field }) => (<FormItem><FormLabel>Business Model</FormLabel><FormControl><Textarea {...field} value={field.value || ""} placeholder="e.g., SaaS, E-commerce (dropshipping/inventory), Service-based, Lead Generation, Content Site (Adsense/Affiliate), etc." disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="yearEstablished" render={({ field }) => (<FormItem><FormLabel>Year Business Established</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} placeholder="YYYY" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="registeredBusinessName" render={({ field }) => (<FormItem><FormLabel>Legal Registered Business Name</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="Your Company Pte Ltd" disabled={isPending} /></FormControl><FormDescription>This is for verification and won't be public initially.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="businessWebsiteUrl" render={({ field }) => (<FormItem><FormLabel>Primary Business Website</FormLabel><FormControl><Input type="url" {...field} value={field.value || ""} placeholder="https://yourbusiness.com" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="socialMediaLinks" render={({ field }) => (<FormItem><FormLabel>Key Social Media Profiles (one per line)</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="https://linkedin.com/company/yourbusiness\nhttps://facebook.com/yourbusiness" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="numberOfEmployees" render={({ field }) => (<FormItem><FormLabel>Number of Employees</FormLabel><Select onValueChange={field.onChange} value={field.value || undefined} disabled={isPending}><FormControl><SelectTrigger><SelectValue placeholder="Select number of employees" /></SelectTrigger></FormControl><SelectContent>{employeeCountRanges.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select><FormDescription>Full-time.</FormDescription><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" />Business Images</CardTitle><CardDescription>Upload up to 5 images for your listing (e.g., logo, storefront, product shots). Max 5MB each. JPG, PNG, WebP.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2, 3, 4].map(i => (
                <FormField
                  key={`imageFile${i + 1}`}
                  control={form.control}
                  name={`imageFile${i + 1}` as `imageFile1`}
                  render={({ field }) => ( // field will be handled by Input's onChange
                    <FormItem>
                      <FormLabel>Image {i + 1}</FormLabel>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => handleImageFileChange(i, e.target.files ? e.target.files[0] : null)}
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            disabled={isPending}
                            className="flex-grow"
                          />
                        </FormControl>
                        {previewUrls[i] && (
                          <div className="w-20 h-20 relative border rounded-md overflow-hidden flex-shrink-0">
                            <Image src={previewUrls[i]!} alt={`Preview ${i + 1}`} layout="fill" objectFit="cover" />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><NobridgeIcon icon="calculator" size="sm" />Financial Performance</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="annualRevenueRange" render={({ field }) => (<FormItem><FormLabel>Annual Revenue Range</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={isPending}><FormControl><SelectTrigger><SelectValue placeholder="Select revenue range" /></SelectTrigger></FormControl><SelectContent>{revenueRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="netProfitMarginRange" render={({ field }) => (<FormItem><FormLabel>Net Profit Margin Range (Optional)</FormLabel><Select onValueChange={field.onChange} value={field.value || ""} disabled={isPending}><FormControl><SelectTrigger><SelectValue placeholder="Select profit margin" /></SelectTrigger></FormControl><SelectContent>{profitMarginRanges.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="askingPrice" render={({ field }) => (<FormItem><FormLabel className="flex items-center"><NobridgeIcon icon="revenue" size="sm" className="mr-1 opacity-80" />Asking Price (USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="e.g., 750000" disabled={isPending} /></FormControl><FormDescription>Enter the specific asking price for your business.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="adjustedCashFlow" render={({ field }) => (<FormItem><FormLabel>Adjusted Cash Flow / SDE (TTM, USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="e.g., 220000" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ebitda" render={({ field }) => (<FormItem><FormLabel>EBITDA (TTM, USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="e.g., 250000" disabled={isPending} /></FormControl><FormDescription>Earnings Before Interest, Taxes, Depreciation, and Amortization</FormDescription><FormMessage /></FormItem>)} />
              <Separator />
              <h3 className="text-md font-medium text-muted-foreground font-heading">Specific Financials (For Verified View)</h3>
              <FormField control={form.control} name="specificAnnualRevenueLastYear" render={({ field }) => (<FormItem><FormLabel>Actual Annual Revenue (TTM, in USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="e.g., 750000" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="specificNetProfitLastYear" render={({ field }) => (<FormItem><FormLabel>Actual Net Profit (TTM, in USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} placeholder="e.g., 180000" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />

              {!isSellerVerified && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Get Verified for Enhanced Listing</p>
                      <p className="text-xs text-blue-600 mb-3">Verified sellers can provide specific financial figures and upload detailed documents, increasing buyer trust.</p>
                      <Button type="button" variant="outline" size="sm" asChild className="border-blue-500 text-blue-700 hover:bg-blue-100">
                        <Link href="/seller-dashboard/verification">
                          <ShieldCheck className="h-4 w-4 mr-2" /> Request Verification
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><NobridgeIcon icon="deal-structure" size="sm" />Deal &amp; Seller Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="dealStructureLookingFor" render={() => (<FormItem><FormLabel>Looking for (Deal Structure):</FormLabel><FormDescription>Select all that apply.</FormDescription><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">{dealStructures.map((item) => (<FormField key={item} control={form.control} name="dealStructureLookingFor" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter(v => v !== item))} disabled={isPending} /></FormControl><FormLabel className="font-normal">{item}</FormLabel></FormItem>)} />))}</div><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="reasonForSellingAnonymous" render={({ field }) => (<FormItem><FormLabel>Reason for Selling (Public Summary, Optional)</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="Briefly state your reason for selling (e.g., Retirement, Other ventures)." disabled={isPending} /></FormControl><FormDescription>Max 500 characters. This may be shown publicly.</FormDescription><FormMessage /></FormItem>)} />
              <Separator />
              <h3 className="text-md font-medium text-muted-foreground font-heading">Additional Seller Information (For Verified View)</h3>
              <FormField control={form.control} name="detailedReasonForSelling" render={({ field }) => (<FormItem><FormLabel>Detailed Reason for Selling</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="Provide more context for verified buyers." disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><NobridgeIcon icon="growth" size="sm" />Growth &amp; Future Potential</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-brand-dark-blue">Specific Growth Opportunities (1-3 points)</Label><FormDescription>List 1-3 specific, actionable growth opportunities.</FormDescription>
                <FormField control={form.control} name="growthOpportunity1" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Opportunity 1 (e.g., Expand to new markets - Region X)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="growthOpportunity2" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Opportunity 2 (Optional)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="growthOpportunity3" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ""} placeholder="Opportunity 3 (Optional)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><Building className="h-5 w-5" />Additional Business Details</CardTitle><CardDescription>Optional information to make your listing more comprehensive.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="technologyStack" render={({ field }) => (<FormItem><FormLabel>Technology Stack (for tech businesses)</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="e.g., React, Node.js, AWS, PostgreSQL, etc." disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="actualCompanyName" render={({ field }) => (<FormItem><FormLabel>Actual Company Name (if different from legal name)</FormLabel><FormControl><Input {...field} value={field.value || ""} placeholder="Brand name or trading name" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="fullBusinessAddress" render={({ field }) => (<FormItem><FormLabel>Full Business Address (for verification)</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={2} placeholder="Complete business address including postal code" disabled={isPending} /></FormControl><FormDescription>This will be kept confidential and used for verification purposes only.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="adjustedCashFlowExplanation" render={({ field }) => (<FormItem><FormLabel>Adjusted Cash Flow Explanation</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="Explain how you calculated the adjusted cash flow (add-backs, one-time expenses, etc.)" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="sellerRoleAndTimeCommitment" render={({ field }) => (<FormItem><FormLabel>Seller Role & Time Commitment</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="Describe your current role and time investment in the business" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="postSaleTransitionSupport" render={({ field }) => (<FormItem><FormLabel>Post-Sale Transition Support</FormLabel><FormControl><Textarea {...field} value={field.value || ""} rows={3} placeholder="What transition support are you willing to provide to the buyer?" disabled={isPending} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card className="shadow-md bg-brand-white">
            <CardHeader><CardTitle className="text-brand-dark-blue font-heading flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Supporting Documents & Information</CardTitle><CardDescription>All documents are optional but highly recommended for verified listings.{isSellerVerified ? " Upload documents to provide transparency." : " These fields are available to verified sellers."}</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              {isSellerVerified ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="financialDocuments" render={({ field }) => (<FormItem><FormLabel>Financial Documents (P&L, Balance Sheet)</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>PDF, XLSX, CSV. Max 5MB.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="keyMetricsReport" render={({ field }) => (<FormItem><FormLabel>Key Business Metrics Report</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>KPIs, analytics. PDF, XLSX, CSV.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="ownershipDocuments" render={({ field }) => (<FormItem><FormLabel>Ownership Documents</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>Company registration, shareholding certs.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="financialSnapshot" render={({ field }) => (<FormItem><FormLabel>Financial Snapshot</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>Recent financial summary.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="ownershipDetails" render={({ field }) => (<FormItem><FormLabel>Detailed Ownership Information</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>Ownership structure, stakeholders.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="locationRealEstateInfo" render={({ field }) => (<FormItem><FormLabel>Location & Real Estate Information</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>Lease agreements, property details.</FormDescription><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="webPresenceInfo" render={({ field }) => (<FormItem><FormLabel>Web Presence Information</FormLabel><FormControl><Input type="file" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} accept={ACCEPTED_DOCUMENT_TYPES.join(",")} disabled={isPending} /></FormControl><FormDescription>Website analytics, SEO reports.</FormDescription><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="secureDataRoomLink" render={({ field }) => (<FormItem><FormLabel>Secure Data Room Link (Optional)</FormLabel><FormControl><Input type="url" {...field} value={field.value || ""} placeholder="https://your-dataroom-provider.com/room/..." disabled={isPending} /></FormControl><FormDescription>Link to external secure data room containing additional documents.</FormDescription><FormMessage /></FormItem>)} />
                </>
              ) : (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-700">Document Uploads for Verified Sellers</p>
                      <p className="text-xs text-yellow-600 mb-3">Once your seller profile is verified, you can upload detailed financial statements, metrics reports, and ownership documents here to build buyer trust.</p>
                      <Button type="button" variant="outline" size="sm" asChild className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                        <Link href="/seller-dashboard/verification"><ShieldCheck className="h-4 w-4 mr-2" /> Check Verification Status</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => { if (confirm("Are you sure you want to clear all form data including saved draft?")) { form.reset(); clearSavedData(); toast({ title: "Form Cleared", description: "All form data has been cleared." }); setPreviewUrls([null, null, null, null, null]); } }} disabled={isPending}>
              <RotateCcw className="h-4 w-4 mr-2" />Clear Form & Draft
            </Button>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => { saveNow(); toast({ title: "Draft Saved", description: "Your form data has been saved as a draft." }); }} disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />Save Draft
              </Button>
              <Button type="submit" className="min-w-[150px] bg-brand-dark-blue text-brand-white hover:bg-brand-dark-blue/90" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isPending ? "Submitting..." : "Create Listing"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
