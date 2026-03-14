
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, AlertCircle, Users, Shield, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: 'buyer' | 'seller' | 'admin';
  verification_status: string;
}

interface Message {
  id: string;
  conversation_id: string;
  conversationId?: string;
  sender_id: string;
  senderId?: string;
  receiver_id: string;
  receiverId?: string;
  content: string;
  contentText?: string;
  content_text?: string;
  created_at: string;
  timestamp?: string;
  is_read: boolean;
  is_system_message?: boolean;
  isSystemMessage?: boolean;
  sender?: User;
  senderProfile?: {
    full_name: string;
    avatar_url?: string;
  };
  isOwnMessage?: boolean;
}

interface Conversation {
  id: string;
  inquiry_id: string;
  inquiryId?: string;
  buyer_id: string;
  buyerId?: string;
  seller_id: string;
  sellerId?: string;
  status: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    listing_title_anonymous: string;
    asking_price: number;
    industry: string;
  };
  buyer_profile?: User;
  seller_profile?: User;
  buyer?: User;
  seller?: User;
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUser: User;
  onBack?: () => void;
}

export default function ChatInterface({ conversationId, currentUser, onBack }: ChatInterfaceProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineParticipants, setOnlineParticipants] = useState<Record<string, boolean>>({});

  const supabase = createClientComponentClient();
  const isAdminUser = currentUser.role === 'admin';

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Conversation not found');
          }
          throw new Error('Failed to load conversation');
        }

        const data = await response.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);

      } catch (err) {
        console.error('Error fetching conversation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

    // 🚀 Real-time subscription for new messages with robust cleanup
  useEffect(() => {
    if (!conversationId || !conversation) {
      return;
    }

    let isMounted = true;
    let channel: any = null;

    const setupRealtimeSubscription = async () => {
      try {
        // Create specific channel for this conversation
        const channelName = `messages_${conversationId}`;
        console.log(`🔌 Setting up real-time channel: ${channelName}`);

        channel = supabase
          .channel(channelName, {
            config: {
              presence: {
                key: currentUser.id,
              },
            },
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversationId}`,
            },
            async (payload) => {
              // Check if component is still mounted before processing
              if (!isMounted) {
                console.log('⚠️ Component unmounted, skipping message processing');
                return;
              }

              console.log('✅ Real-time message received');

              // Skip if this message was sent by current user (avoid seeing own message twice)
              if (payload.new.sender_id === currentUser.id) {
                return;
              }

              // 🔧 Enhanced: Verify this user should see this message (RLS-like check)
              const buyerId = conversation.buyer_id || conversation.buyerId;
              const sellerId = conversation.seller_id || conversation.sellerId;

              // Allow participants and admins to see messages in real-time
              const canViewMessage =
                currentUser.id === buyerId ||
                currentUser.id === sellerId ||
                currentUser.role === 'admin';

              if (!canViewMessage) {
                console.log('⚠️ User not authorized to view this message in real-time');
                return;
              }

              // 🔧 Enhanced: Fetch sender profile for better display with error handling
              let senderProfile = null;
              try {
                if (isMounted) {
                  const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('full_name, avatar_url, role')
                    .eq('id', payload.new.sender_id)
                    .single();
                  senderProfile = profile;
                }
              } catch (err) {
                console.warn('Could not fetch sender profile:', err);
              }

              // Double-check if component is still mounted after async operation
              if (!isMounted) {
                console.log('⚠️ Component unmounted during profile fetch, aborting');
                return;
              }

              // Format the new message to match our interface
              const newMessage = {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                sender_id: payload.new.sender_id,
                receiver_id: payload.new.receiver_id,
                content_text: payload.new.content_text,
                contentText: payload.new.content_text,
                content: payload.new.content_text,
                timestamp: payload.new.timestamp,
                created_at: payload.new.created_at,
                is_system_message: payload.new.is_system_message,
                isSystemMessage: payload.new.is_system_message,
                is_read: payload.new.is_read || false,
                message_status: payload.new.message_status || 'delivered',
                senderProfile,
                sender: senderProfile ? {
                  id: payload.new.sender_id,
                  full_name: senderProfile.full_name,
                  avatar_url: senderProfile.avatar_url,
                  role: senderProfile.role as 'buyer' | 'seller' | 'admin',
                  verification_status: 'unknown'
                } : undefined,
              } as Message;

              // Only add if it's not already in the messages array and component is still mounted
              if (isMounted) {
                setMessages(prev => {
                  const exists = prev.some(msg => msg.id === newMessage.id);
                  if (exists) {
                    return prev;
                  }
                  return [...prev, newMessage];
                });

                // 🔧 Show notification for new message
                if (!isAdminUser) {
                  toast({
                    title: 'New message',
                    description: `${senderProfile?.full_name || 'User'} sent a message`,
                  });
                }
              }
            }
          )
          .on('presence', { event: 'sync' }, () => {
            if (isMounted && channel) {
              const state = channel.presenceState();
              updateOnlineStatus(state);
            }
          })
          .subscribe((status) => {
            if (!isMounted) {
              return;
            }

            setIsConnected(status === 'SUBSCRIBED');

            if (status === 'SUBSCRIBED') {
              console.log('🎉 Real-time chat is now active!');
              // Track presence when successfully connected
              if (channel) {
                channel.track({
                  user_id: currentUser.id,
                  online_at: new Date().toISOString(),
                });
              }
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Real-time subscription error');
              if (isMounted) {
                toast({
                  title: 'Connection issue',
                  description: 'Real-time updates may be delayed',
                  variant: 'destructive',
                });
              }
            } else if (status === 'TIMED_OUT') {
              console.error('⏰ Real-time subscription timed out');
            } else if (status === 'CLOSED') {
              console.log('🔌 Real-time connection closed gracefully');
            }
          });

      } catch (error) {
        console.error('❌ Error setting up real-time subscription:', error);
        if (isMounted) {
          toast({
            title: 'Connection failed',
            description: 'Could not establish real-time connection',
            variant: 'destructive',
          });
        }
      }
    };

    // Setup the subscription
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time subscription');
      isMounted = false;

      if (channel) {
        try {
          // Untrack presence before unsubscribing
          channel.untrack();
          // Remove the channel gracefully
          supabase.removeChannel(channel);
          console.log('✅ Real-time channel cleaned up successfully');
        } catch (error) {
          console.warn('⚠️ Error during channel cleanup:', error);
        }
      }
    };
  }, [conversationId, conversation, currentUser.id, supabase, toast, isAdminUser]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !conversation) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          contentText: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');

      toast({
        title: 'Message sent',
        description: 'Your message has been delivered.',
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Send failed',
        description: err instanceof Error ? err.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getOtherUser = () => {
    if (!conversation) return null;
    if (isAdminUser) return null;

    const buyer = conversation.buyer_profile || conversation.buyer;
    const seller = conversation.seller_profile || conversation.seller;

    const conversationBuyerId = conversation.buyerId || conversation.buyer_id;

    if (currentUser.id === conversationBuyerId) {
      return seller;
    } else {
      return buyer;
    }
  };

  const getVerificationBadge = (user: User) => {
    if (user.verification_status === 'verified') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const isOwnMessage = (message: Message) => {
    if (isAdminUser) return false;
    const messageSenderId = message.senderId || message.sender_id;
    return messageSenderId === currentUser.id;
  };

  const getMessageContent = (message: Message) => {
    const rawContent = message.contentText || message.content_text || message.content || '';

    // 🎯 Fix system message content based on current user
    if (isSystemMessage(message) && rawContent.includes('is interested in your listing')) {
      if (!conversation) return rawContent;

      const buyerId = conversation.buyer_id || conversation.buyerId;
      const sellerId = conversation.seller_id || conversation.sellerId;
      const buyerName = conversation.buyer_profile?.full_name || conversation.buyer?.full_name;
      const sellerName = conversation.seller_profile?.full_name || conversation.seller?.full_name;

      // If current user is buyer, show seller's name
      if (currentUser.id === buyerId) {
        return `Chat connection facilitated by admin. You can now chat with ${sellerName} about this listing.`;
      }
      // If current user is seller, show buyer's name (original message)
      else if (currentUser.id === sellerId) {
        return rawContent; // Keep original: "Ben Tennyson is interested in your listing"
      }
      // Admin or unknown user - show generic message
      else {
        return `Chat connection facilitated by admin. ${buyerName} and ${sellerName} can now communicate.`;
      }
    }

    return rawContent;
  };

  const isSystemMessage = (message: Message) => {
    return message.is_system_message || message.isSystemMessage || false;
  };

  const getMessageTimestamp = (message: Message) => {
    return message.timestamp || message.created_at || '';
  };

  const getSenderName = (message: Message) => {
    if (!conversation) return 'Unknown';

    const senderProfile = message.senderProfile || message.sender;
    if (senderProfile?.full_name) {
      return senderProfile.full_name;
    }

    const messageSenderId = message.senderId || message.sender_id;
    const conversationBuyerId = conversation.buyerId || conversation.buyer_id;
    const conversationSellerId = conversation.sellerId || conversation.seller_id;

    const buyer = conversation.buyer_profile || conversation.buyer;
    const seller = conversation.seller_profile || conversation.seller;

    if (messageSenderId === conversationBuyerId) {
      return buyer?.full_name || 'Buyer';
    } else if (messageSenderId === conversationSellerId) {
      return seller?.full_name || 'Seller';
    }

    return 'Unknown';
  };

  const otherUser = getOtherUser();

  const updateOnlineStatus = (state: Record<string, unknown>) => {
    try {
      if (!state || typeof state !== 'object') {
        console.warn('⚠️ Invalid presence state received:', state);
        return;
      }

      /**
       * Supabase presenceState() returns
       * {
       *   "<userId>": [ { ...meta } ]
       * }
       * We consider a user online if they appear as a key.
       */
      const newStatus: Record<string, boolean> = {};
      Object.keys(state).forEach((userId) => {
        if (typeof userId === 'string' && userId.trim()) {
          newStatus[userId] = true;
        }
      });

      setOnlineParticipants(newStatus);
      console.log(`👥 Updated online status:`, newStatus);
    } catch (error) {
      console.warn('⚠️ Error updating online status:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading conversation...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conversation</h3>
            <p className="text-muted-foreground">Unable to load conversation details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg bg-card w-full"> {/* Removed margins that were causing overflow */}
      <CardHeader className="flex-row items-center space-y-0 pb-3 border-b flex-shrink-0"> {/* Made header flex-shrink-0 */}
        <div className="flex-1">
          {isAdminUser ? (
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin View: Buyer ↔ Seller
                <span className={cn("inline-flex h-2 w-2 rounded-full", isConnected ? "bg-green-400" : "bg-gray-400")} />
              </CardTitle>
              <CardDescription>
                Buyer: {conversation.buyer_profile?.full_name || conversation.buyer?.full_name} •
                Seller: {conversation.seller_profile?.full_name || conversation.seller?.full_name}
                {isConnected && <span className="text-green-600 ml-2">• Live</span>}
              </CardDescription>
            </div>
          ) : otherUser ? (
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback>{otherUser.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {otherUser.full_name}
                <span className={cn("inline-flex h-2 w-2 rounded-full", isConnected ? "bg-green-400" : "bg-gray-400")} />
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                {otherUser && getVerificationBadge(otherUser)}
                <span className="capitalize">{otherUser.role}</span>
                {isConnected && <span className="text-green-600">• Live</span>}
              </CardDescription>
            </div>
          ) : (
            <CardTitle className="text-lg flex items-center gap-2">
              Conversation
              <span className={cn("inline-flex h-2 w-2 rounded-full", isConnected ? "bg-green-400" : "bg-gray-400")} />
            </CardTitle>
          )}
        </div>
        {conversation.listing && (
          <div className="text-right">
            <div className="text-sm font-medium">
              {conversation.listing.listing_title_anonymous}
            </div>
            <div className="text-xs text-muted-foreground">
              ${conversation.listing.asking_price?.toLocaleString()} • {conversation.listing.industry}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages area with fixed height and internal scrolling */}
      <div className="flex-1 overflow-hidden"> {/* This takes up remaining space */}
        <ScrollArea className="h-full px-6" ref={scrollAreaRef}> {/* Full height with internal scroll */}
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = isOwnMessage(message);
                const senderName = getSenderName(message);
                const isSystemMsg = isSystemMessage(message);

                let isBuyerMessage = false;
                let isAdminMessage = false;
                if (conversation) {
                  const conversationBuyerId = conversation.buyerId || conversation.buyer_id;
                  const conversationSellerId = conversation.sellerId || conversation.seller_id;
                  const messageSenderId = message.senderId || message.sender_id;
                  isBuyerMessage = messageSenderId === conversationBuyerId;

                  // Enhanced admin message detection
                  // Check multiple sources to determine if this is an admin message
                  isAdminMessage = (
                    // Direct role check from sender profile
                    message.sender?.role === 'admin' ||
                    // Check if sender is neither buyer nor seller (likely admin)
                    (messageSenderId !== conversationBuyerId && messageSenderId !== conversationSellerId) ||
                    // Additional check for admin users when we're viewing as admin
                    (currentUser.role === 'admin' && messageSenderId === currentUser.id)
                  );
                }

                if (isSystemMsg || isAdminMessage) {
                  return (
                    <div key={message.id} className="w-full flex justify-center my-4">
                      <div className={cn(
                        "border rounded-lg px-4 py-3 max-w-md mx-auto",
                        isSystemMsg
                          ? "bg-amber-50 border-amber-200"
                          : "bg-purple-50 border-purple-200"
                      )}>
                        <div className={cn(
                          "flex items-center gap-2",
                          isSystemMsg ? "text-amber-800" : "text-purple-800"
                        )}>
                          {isSystemMsg ? (
                            <Settings className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <Shield className="h-4 w-4 flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium text-center">
                            {isSystemMsg ? getMessageContent(message) : `Admin: ${getMessageContent(message)}`}
                          </p>
                        </div>
                        <p className={cn(
                          "text-xs text-center mt-1",
                          isSystemMsg ? "text-amber-600" : "text-purple-600"
                        )}>
                          {formatTimestamp(getMessageTimestamp(message))}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full max-w-[75%] flex-col gap-1", /* Reduced from 85% to 75% for better readability */
                      isAdminUser
                        ? isBuyerMessage ? "mr-auto items-start" : "ml-auto items-end"
                        : isOwn ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="text-xs text-muted-foreground px-1 mb-0.5 font-medium">
                      {isAdminUser ? (
                        <span>
                          {senderName} ({isBuyerMessage ? 'Buyer' : 'Seller'})
                        </span>
                      ) : (
                        senderName
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-xl px-3 py-2 shadow-sm text-sm max-w-full",
                        isAdminUser
                          ? (isBuyerMessage
                            ? "bg-blue-900 text-white rounded-bl-none"
                            : "bg-white text-brand-dark-blue border border-gray-200 rounded-br-none"
                            )
                          : (isOwn
                            ? "bg-white text-brand-dark-blue border border-gray-200 rounded-br-none"
                            : "bg-blue-900 text-white rounded-bl-none"
                            )
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {getMessageContent(message)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground/80 px-1">
                      {formatTimestamp(getMessageTimestamp(message))}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t bg-card flex-shrink-0"> {/* Made this flex-shrink-0 so it doesn't compress */}
        <CardContent className="pt-0"> {/* Keep the padding but remove the border-t since we moved it to parent */}
        <div className="flex gap-2 py-4"> {/* Added py-4 for padding around input */}
          <Input
            placeholder={
              isAdminUser
                ? "Type your message as admin..."
                : `Type your message...`
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isAdminUser && (
          <p className="text-xs text-muted-foreground text-center pb-2">
            <Shield className="h-3 w-3 inline mr-1" />
            Admin participating in conversation - Your messages will be marked as admin
          </p>
        )}
        </CardContent>
      </div>
    </Card>
  );
}

