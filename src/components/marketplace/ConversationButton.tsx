"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ConversationButtonProps {
  listingId: string;
  // sellerId: string; // Removed - will be looked up server-side from listing
  buyerId?: string;
  sellerName: string;
  listingTitle: string;
  isAuthenticated: boolean;
  userRole?: 'buyer' | 'seller' | 'admin';
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

interface ConversationStatus {
  exists: boolean;
  conversationId?: string;
  status?: 'pending_approval' | 'approved' | 'rejected';
  facilitated?: boolean;
  canSendMessages?: boolean;
}

export function ConversationButton({
  listingId,
  // sellerId, // Removed
  buyerId,
  sellerName,
  listingTitle,
  isAuthenticated,
  userRole,
  className,
  variant = 'default',
  size = 'default'
}: ConversationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [pendingDetails, setPendingDetails] = useState<{
    status: string;
    estimatedWait?: string;
    requestId?: string;
  } | null>(null);

  const router = useRouter();

  const handleConversationClick = async () => {
    // Authentication check
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a conversation with the seller.",
        variant: "destructive",
      });
      return;
    }

    // Role validation
    if (userRole !== 'buyer') {
      toast({
        title: "Access Restricted",
        description: "Only buyers can initiate conversations with sellers.",
        variant: "destructive",
      });
      return;
    }

    if (!buyerId) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your buyer profile to start conversations.",
        variant: "destructive",
      });
      return;
    }

    // Self-conversation check is now handled server-side after seller_id lookup

    setIsLoading(true);

    try {
      // Step 1: Check if conversation already exists
      console.log('[CONVERSATION-BUTTON] Sending conversation check request with data:', {
        listing_id: listingId,
        buyer_id: buyerId,
      });

      const conversationResponse = await fetch(`/api/conversations/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          buyer_id: buyerId,
        }),
      });

      console.log('[CONVERSATION-BUTTON] Conversation check response status:', conversationResponse.status);

      if (!conversationResponse.ok) {
        // Try to get the error details from the response
        const errorData = await conversationResponse.json().catch(() => null);
        console.log('[CONVERSATION-BUTTON] Error response data:', errorData);
        throw new Error(`Failed to check conversation status: ${conversationResponse.status}`);
      }

      const conversationData: ConversationStatus = await conversationResponse.json();

      // Step 2: Handle existing conversation
      if (conversationData.exists && conversationData.conversationId) {
        if (conversationData.status === 'approved' && conversationData.facilitated) {
          // Conversation is facilitated and approved - redirect to chat
          router.push(`/dashboard/messages/${conversationData.conversationId}`);
          return;
        } else if (conversationData.status === 'rejected') {
          // Conversation was rejected
          toast({
            title: "Conversation Rejected",
            description: "Your previous conversation request was rejected by admin. Please contact support if you believe this was an error.",
            variant: "destructive",
          });
          return;
        } else {
          // Conversation exists but pending approval
          setPendingDetails({
            status: 'pending_admin_approval',
            estimatedWait: '24-48 hours',
            requestId: conversationData.conversationId,
          });
          setShowPendingDialog(true);
          return;
        }
      }

      // Step 3: Create new conversation request
      const createResponse = await fetch(`/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          subject: `Interest in: ${listingTitle}`,
          message: `Hi ${sellerName}, I'm interested in your listing "${listingTitle}". Could we discuss the details?`,
          inquiry_type: 'general',
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create conversation request: ${createResponse.status}`);
      }

      const createData = await createResponse.json();

      // Step 4: Show success feedback
      toast({
        title: "Conversation Request Submitted",
        description: "Your conversation request has been submitted for admin approval. You'll be notified once it's ready.",
      });

      setPendingDetails({
        status: 'request_submitted',
        estimatedWait: '24-48 hours',
        requestId: createData.inquiry_id || createData.id,
      });
      setShowPendingDialog(true);

    } catch (error) {
      console.error('[CONVERSATION-BUTTON] Error:', error);

      let errorMessage = "Failed to start conversation. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('unauthorized')) {
          errorMessage = "Session expired. Please sign in again.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleConversationClick}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={cn("rounded-md", className)}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            Open Conversation
          </>
        )}
      </Button>

      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingDetails?.status === 'pending_admin_approval' ? (
                <>
                  <Clock className="h-5 w-5 text-orange-500" />
                  Pending Admin Approval
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  Request Submitted
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {pendingDetails?.status === 'pending_admin_approval' ? (
              <>
                <p>
                  Your conversation request with <strong>{sellerName}</strong> is currently
                  pending admin approval for quality and safety purposes.
                </p>
                <p>
                  <strong>Estimated approval time:</strong> {pendingDetails.estimatedWait}
                </p>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email notification once your conversation is approved
                  and ready to use.
                </p>
              </>
            ) : (
              <>
                <p>
                  Your conversation request has been successfully submitted and is now
                  in the admin review queue.
                </p>
                <p>
                  <strong>Next steps:</strong>
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Admin will review your request within {pendingDetails?.estimatedWait}</li>
                  <li>You'll receive an email when approved</li>
                  <li>The conversation will appear in your Messages dashboard</li>
                </ul>
              </>
            )}

            {pendingDetails?.requestId && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                Reference ID: {pendingDetails.requestId}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
