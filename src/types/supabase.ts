export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      account_cleanup_audit: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_cleanup_audit_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_cleanup_audit_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_cleanup_audit_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string
          target_type: string
          timestamp: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
          timestamp?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_impersonation_audit: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          target_user_id: string
          timestamp: string
          token_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_user_id: string
          timestamp?: string
          token_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_user_id?: string
          timestamp?: string
          token_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_impersonation_audit_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "admin_impersonation_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_impersonation_sessions: {
        Row: {
          admin_email: string
          admin_user_id: string
          correlation_id: string | null
          created_at: string
          expires_at: string
          id: string
          target_email: string
          target_user_id: string
          token: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          admin_email: string
          admin_user_id: string
          correlation_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          target_email: string
          target_user_id: string
          token: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          admin_email?: string
          admin_user_id?: string
          correlation_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          target_email?: string
          target_user_id?: string
          token?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: []
      }
      admin_impersonation_tokens: {
        Row: {
          admin_user_id: string
          created_at: string | null
          expires_at: string
          id: string
          metadata: Json | null
          target_user_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          metadata?: Json | null
          target_user_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          target_user_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      admin_listing_actions: {
        Row: {
          action_type: string
          admin_notes: string | null
          admin_user_id: string
          created_at: string | null
          id: string
          listing_id: string
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          action_type: string
          admin_notes?: string | null
          admin_user_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          action_type?: string
          admin_notes?: string | null
          admin_user_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_listing_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_listing_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_listing_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_listing_actions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_listing_actions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_listing_actions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_sync_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: number
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          buyer_unread_count: number | null
          created_at: string | null
          deleted_at: string | null
          id: string
          inquiry_id: string | null
          last_message_at: string | null
          last_message_snippet: string | null
          listing_id: string | null
          seller_id: string
          seller_unread_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_unread_count?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          inquiry_id?: string | null
          last_message_at?: string | null
          last_message_snippet?: string | null
          listing_id?: string | null
          seller_id: string
          seller_unread_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_unread_count?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          inquiry_id?: string | null
          last_message_at?: string | null
          last_message_snippet?: string | null
          listing_id?: string | null
          seller_id?: string
          seller_unread_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "active_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          buyer_id: string
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          engagement_timestamp: string | null
          id: string
          initial_message: string | null
          inquiry_timestamp: string | null
          listing_id: string
          message: string | null
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          buyer_id: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          engagement_timestamp?: string | null
          id?: string
          initial_message?: string | null
          inquiry_timestamp?: string | null
          listing_id: string
          message?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          buyer_id?: string
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          engagement_timestamp?: string | null
          id?: string
          initial_message?: string | null
          inquiry_timestamp?: string | null
          listing_id?: string
          message?: string | null
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "active_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          actual_company_name: string | null
          adjusted_cash_flow: number | null
          adjusted_cash_flow_explanation: string | null
          admin_action_at: string | null
          admin_action_by: string | null
          admin_notes: string | null
          annual_revenue_range: string | null
          anonymous_business_description: string
          asking_price: number | null
          business_model: string | null
          business_website_url: string | null
          created_at: string | null
          deal_structure_looking_for: Json | null
          deleted_at: string | null
          detailed_reason_for_selling: string | null
          ebitda: number | null
          financial_documents_url: string | null
          financial_snapshot_url: string | null
          full_business_address: string | null
          growth_opportunity_1: string | null
          growth_opportunity_2: string | null
          growth_opportunity_3: string | null
          id: string
          image_urls: Json | null
          industry: string
          inquiry_count: number | null
          is_seller_verified: boolean | null
          key_metrics_report_url: string | null
          key_strength_1: string | null
          key_strength_2: string | null
          key_strength_3: string | null
          key_strengths_anonymous: Json | null
          listing_title_anonymous: string
          listing_verification_at: string | null
          listing_verification_by: string | null
          listing_verification_notes: string | null
          listing_verification_status:
            | Database["public"]["Enums"]["listing_verification_status"]
            | null
          location_city_region_general: string | null
          location_country: string
          location_real_estate_info_url: string | null
          net_profit_margin_range: string | null
          number_of_employees: string | null
          ownership_details_url: string | null
          ownership_documents_url: string | null
          post_sale_transition_support: string | null
          reason_for_selling_anonymous: string | null
          registered_business_name: string | null
          rejection_category: string | null
          secure_data_room_link: string | null
          seller_id: string
          seller_role_and_time_commitment: string | null
          social_media_links: string | null
          specific_annual_revenue_last_year: number | null
          specific_growth_opportunities: string | null
          specific_net_profit_last_year: number | null
          status: string | null
          technology_stack: string | null
          updated_at: string | null
          web_presence_info_url: string | null
          year_established: number | null
        }
        Insert: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description: string
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          ebitda?: number | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          growth_opportunity_1?: string | null
          growth_opportunity_2?: string | null
          growth_opportunity_3?: string | null
          id?: string
          image_urls?: Json | null
          industry: string
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strength_1?: string | null
          key_strength_2?: string | null
          key_strength_3?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous: string
          listing_verification_at?: string | null
          listing_verification_by?: string | null
          listing_verification_notes?: string | null
          listing_verification_status?:
            | Database["public"]["Enums"]["listing_verification_status"]
            | null
          location_city_region_general?: string | null
          location_country: string
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          rejection_category?: string | null
          secure_data_room_link?: string | null
          seller_id: string
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Update: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          admin_action_at?: string | null
          admin_action_by?: string | null
          admin_notes?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description?: string
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          ebitda?: number | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          growth_opportunity_1?: string | null
          growth_opportunity_2?: string | null
          growth_opportunity_3?: string | null
          id?: string
          image_urls?: Json | null
          industry?: string
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strength_1?: string | null
          key_strength_2?: string | null
          key_strength_3?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous?: string
          listing_verification_at?: string | null
          listing_verification_by?: string | null
          listing_verification_notes?: string | null
          listing_verification_status?:
            | Database["public"]["Enums"]["listing_verification_status"]
            | null
          location_city_region_general?: string | null
          location_country?: string
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          rejection_category?: string | null
          secure_data_room_link?: string | null
          seller_id?: string
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_admin_action_by_fkey"
            columns: ["admin_action_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_admin_action_by_fkey"
            columns: ["admin_action_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_admin_action_by_fkey"
            columns: ["admin_action_by"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_listing_verification_by_fkey"
            columns: ["listing_verification_by"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_listing_verification_by_fkey"
            columns: ["listing_verification_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_listing_verification_by_fkey"
            columns: ["listing_verification_by"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content_text: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_read: boolean | null
          is_system_message: boolean | null
          message_status: string | null
          receiver_id: string
          sender_id: string
          timestamp: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content_text: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          message_status?: string | null
          receiver_id: string
          sender_id: string
          timestamp?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content_text?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          message_status?: string | null
          receiver_id?: string
          sender_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "active_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_documents: {
        Row: {
          deleted_at: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          metadata: Json | null
          mime_type: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          deleted_at?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string
          expires_at: string
          hashed_otp: string
          id: string
          otp_type: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email: string
          expires_at: string
          hashed_otp: string
          id?: string
          otp_type: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          expires_at?: string
          hashed_otp?: string
          id?: string
          otp_type?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otp_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otp_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          buyer_persona_other: string | null
          buyer_persona_type: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deletion_scheduled_at: string | null
          email: string
          email_notifications_general: boolean | null
          email_notifications_inquiries: boolean | null
          email_notifications_listing_updates: boolean | null
          email_notifications_system: boolean | null
          email_verified_at: string | null
          first_name: string | null
          full_name: string
          id: string
          initial_company_name: string | null
          inquiry_count: number | null
          investment_focus_description: string | null
          is_email_verified: boolean | null
          is_identity_verified: boolean | null
          is_onboarding_completed: boolean | null
          is_paid: boolean | null
          key_industries_of_interest: string | null
          last_login: string | null
          last_name: string | null
          listing_count: number | null
          onboarding_completed_at: string | null
          onboarding_step_completed: number | null
          phone_number: string | null
          preferred_investment_size: string | null
          role: string
          submitted_documents: Json | null
          updated_at: string | null
          verification_deadline: string | null
          verification_status: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          buyer_persona_other?: string | null
          buyer_persona_type?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email: string
          email_notifications_general?: boolean | null
          email_notifications_inquiries?: boolean | null
          email_notifications_listing_updates?: boolean | null
          email_notifications_system?: boolean | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name: string
          id?: string
          initial_company_name?: string | null
          inquiry_count?: number | null
          investment_focus_description?: string | null
          is_email_verified?: boolean | null
          is_identity_verified?: boolean | null
          is_onboarding_completed?: boolean | null
          is_paid?: boolean | null
          key_industries_of_interest?: string | null
          last_login?: string | null
          last_name?: string | null
          listing_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: number | null
          phone_number?: string | null
          preferred_investment_size?: string | null
          role: string
          submitted_documents?: Json | null
          updated_at?: string | null
          verification_deadline?: string | null
          verification_status?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          buyer_persona_other?: string | null
          buyer_persona_type?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string
          email_notifications_general?: boolean | null
          email_notifications_inquiries?: boolean | null
          email_notifications_listing_updates?: boolean | null
          email_notifications_system?: boolean | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string
          id?: string
          initial_company_name?: string | null
          inquiry_count?: number | null
          investment_focus_description?: string | null
          is_email_verified?: boolean | null
          is_identity_verified?: boolean | null
          is_onboarding_completed?: boolean | null
          is_paid?: boolean | null
          key_industries_of_interest?: string | null
          last_login?: string | null
          last_name?: string | null
          listing_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: number | null
          phone_number?: string | null
          preferred_investment_size?: string | null
          role?: string
          submitted_documents?: Json | null
          updated_at?: string | null
          verification_deadline?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      verification_request_activities: {
        Row: {
          activity_type: string
          admin_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          new_value: string | null
          notes: string | null
          old_value: string | null
          request_id: string
        }
        Insert: {
          activity_type: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          request_id: string
        }
        Update: {
          activity_type?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_request_activities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_request_activities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_request_activities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_request_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "admin_verification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_request_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["active_request_id"]
          },
          {
            foreignKeyName: "verification_request_activities_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          admin_lock_reason: string | null
          admin_locked_at: string | null
          admin_notes: Json | null
          best_time_to_call: string | null
          bump_count: number | null
          bump_disabled_reason: string | null
          bump_enabled: boolean | null
          created_at: string | null
          deleted_at: string | null
          documents_submitted: Json | null
          id: string
          is_duplicate_of: string | null
          last_activity_at: string | null
          last_bump_time: string | null
          last_request_time: string | null
          listing_id: string | null
          phone_number: string | null
          priority_level: string | null
          priority_score: number | null
          processing_admin_id: string | null
          reason: string | null
          request_type: string
          status: string | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          admin_lock_reason?: string | null
          admin_locked_at?: string | null
          admin_notes?: Json | null
          best_time_to_call?: string | null
          bump_count?: number | null
          bump_disabled_reason?: string | null
          bump_enabled?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          documents_submitted?: Json | null
          id?: string
          is_duplicate_of?: string | null
          last_activity_at?: string | null
          last_bump_time?: string | null
          last_request_time?: string | null
          listing_id?: string | null
          phone_number?: string | null
          priority_level?: string | null
          priority_score?: number | null
          processing_admin_id?: string | null
          reason?: string | null
          request_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          admin_lock_reason?: string | null
          admin_locked_at?: string | null
          admin_notes?: Json | null
          best_time_to_call?: string | null
          bump_count?: number | null
          bump_disabled_reason?: string | null
          bump_enabled?: boolean | null
          created_at?: string | null
          deleted_at?: string | null
          documents_submitted?: Json | null
          id?: string
          is_duplicate_of?: string | null
          last_activity_at?: string | null
          last_bump_time?: string | null
          last_request_time?: string | null
          listing_id?: string | null
          phone_number?: string | null
          priority_level?: string | null
          priority_score?: number | null
          processing_admin_id?: string | null
          reason?: string | null
          request_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_is_duplicate_of_fkey"
            columns: ["is_duplicate_of"]
            isOneToOne: false
            referencedRelation: "admin_verification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_is_duplicate_of_fkey"
            columns: ["is_duplicate_of"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["active_request_id"]
          },
          {
            foreignKeyName: "verification_requests_is_duplicate_of_fkey"
            columns: ["is_duplicate_of"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_processing_admin_id_fkey"
            columns: ["processing_admin_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_processing_admin_id_fkey"
            columns: ["processing_admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_processing_admin_id_fkey"
            columns: ["processing_admin_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_conversations: {
        Row: {
          buyer_id: string | null
          buyer_unread_count: number | null
          created_at: string | null
          deleted_at: string | null
          id: string | null
          inquiry_id: string | null
          last_message_snippet: string | null
          listing_id: string | null
          seller_id: string | null
          seller_unread_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          buyer_unread_count?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          inquiry_id?: string | null
          last_message_snippet?: string | null
          listing_id?: string | null
          seller_id?: string | null
          seller_unread_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          buyer_unread_count?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string | null
          inquiry_id?: string | null
          last_message_snippet?: string | null
          listing_id?: string | null
          seller_id?: string | null
          seller_unread_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "active_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      active_inquiries: {
        Row: {
          buyer_id: string | null
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          engagement_timestamp: string | null
          id: string | null
          inquiry_timestamp: string | null
          listing_id: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          engagement_timestamp?: string | null
          id?: string | null
          inquiry_timestamp?: string | null
          listing_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          engagement_timestamp?: string | null
          id?: string | null
          inquiry_timestamp?: string | null
          listing_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "active_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "active_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings_with_legacy_format"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      active_listings: {
        Row: {
          actual_company_name: string | null
          adjusted_cash_flow: number | null
          adjusted_cash_flow_explanation: string | null
          annual_revenue_range: string | null
          anonymous_business_description: string | null
          asking_price: number | null
          business_model: string | null
          business_website_url: string | null
          created_at: string | null
          deal_structure_looking_for: Json | null
          deleted_at: string | null
          detailed_reason_for_selling: string | null
          financial_documents_url: string | null
          financial_snapshot_url: string | null
          full_business_address: string | null
          id: string | null
          image_urls: Json | null
          industry: string | null
          inquiry_count: number | null
          is_seller_verified: boolean | null
          key_metrics_report_url: string | null
          key_strengths_anonymous: Json | null
          listing_title_anonymous: string | null
          location_city_region_general: string | null
          location_country: string | null
          location_real_estate_info_url: string | null
          net_profit_margin_range: string | null
          number_of_employees: string | null
          ownership_details_url: string | null
          ownership_documents_url: string | null
          post_sale_transition_support: string | null
          reason_for_selling_anonymous: string | null
          registered_business_name: string | null
          secure_data_room_link: string | null
          seller_id: string | null
          seller_role_and_time_commitment: string | null
          social_media_links: string | null
          specific_annual_revenue_last_year: number | null
          specific_growth_opportunities: string | null
          specific_net_profit_last_year: number | null
          status: string | null
          technology_stack: string | null
          updated_at: string | null
          web_presence_info_url: string | null
          year_established: number | null
        }
        Insert: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description?: string | null
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          id?: string | null
          image_urls?: Json | null
          industry?: string | null
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous?: string | null
          location_city_region_general?: string | null
          location_country?: string | null
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          secure_data_room_link?: string | null
          seller_id?: string | null
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Update: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description?: string | null
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          id?: string | null
          image_urls?: Json | null
          industry?: string | null
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous?: string | null
          location_city_region_general?: string | null
          location_country?: string | null
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          secure_data_room_link?: string | null
          seller_id?: string | null
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      active_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content_text: string | null
          conversation_id: string | null
          deleted_at: string | null
          id: string | null
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
          timestamp: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content_text?: string | null
          conversation_id?: string | null
          deleted_at?: string | null
          id?: string | null
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          timestamp?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content_text?: string | null
          conversation_id?: string | null
          deleted_at?: string | null
          id?: string | null
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "active_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      active_user_profiles: {
        Row: {
          account_status: string | null
          buyer_persona_other: string | null
          buyer_persona_type: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deletion_scheduled_at: string | null
          email: string | null
          email_notifications_general: boolean | null
          email_notifications_inquiries: boolean | null
          email_notifications_listing_updates: boolean | null
          email_notifications_system: boolean | null
          email_verified_at: string | null
          full_name: string | null
          id: string | null
          initial_company_name: string | null
          inquiry_count: number | null
          investment_focus_description: string | null
          is_email_verified: boolean | null
          is_onboarding_completed: boolean | null
          is_paid: boolean | null
          key_industries_of_interest: string | null
          last_login: string | null
          listing_count: number | null
          onboarding_completed_at: string | null
          onboarding_step_completed: number | null
          phone_number: string | null
          preferred_investment_size: string | null
          role: string | null
          submitted_documents: Json | null
          updated_at: string | null
          verification_deadline: string | null
          verification_status: string | null
        }
        Insert: {
          account_status?: string | null
          buyer_persona_other?: string | null
          buyer_persona_type?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string | null
          email_notifications_general?: boolean | null
          email_notifications_inquiries?: boolean | null
          email_notifications_listing_updates?: boolean | null
          email_notifications_system?: boolean | null
          email_verified_at?: string | null
          full_name?: string | null
          id?: string | null
          initial_company_name?: string | null
          inquiry_count?: number | null
          investment_focus_description?: string | null
          is_email_verified?: boolean | null
          is_onboarding_completed?: boolean | null
          is_paid?: boolean | null
          key_industries_of_interest?: string | null
          last_login?: string | null
          listing_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: number | null
          phone_number?: string | null
          preferred_investment_size?: string | null
          role?: string | null
          submitted_documents?: Json | null
          updated_at?: string | null
          verification_deadline?: string | null
          verification_status?: string | null
        }
        Update: {
          account_status?: string | null
          buyer_persona_other?: string | null
          buyer_persona_type?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deletion_scheduled_at?: string | null
          email?: string | null
          email_notifications_general?: boolean | null
          email_notifications_inquiries?: boolean | null
          email_notifications_listing_updates?: boolean | null
          email_notifications_system?: boolean | null
          email_verified_at?: string | null
          full_name?: string | null
          id?: string | null
          initial_company_name?: string | null
          inquiry_count?: number | null
          investment_focus_description?: string | null
          is_email_verified?: boolean | null
          is_onboarding_completed?: boolean | null
          is_paid?: boolean | null
          key_industries_of_interest?: string | null
          last_login?: string | null
          listing_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_step_completed?: number | null
          phone_number?: string | null
          preferred_investment_size?: string | null
          role?: string | null
          submitted_documents?: Json | null
          updated_at?: string | null
          verification_deadline?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      admin_verification_queue: {
        Row: {
          admin_notes: Json | null
          best_time_to_call: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          listing_count: number | null
          phone_number: string | null
          reason: string | null
          request_type: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_created_at: string | null
          user_id: string | null
          user_notes: string | null
          verification_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      listings_with_legacy_format: {
        Row: {
          actual_company_name: string | null
          adjusted_cash_flow: number | null
          adjusted_cash_flow_explanation: string | null
          annual_revenue_range: string | null
          anonymous_business_description: string | null
          asking_price: number | null
          business_model: string | null
          business_website_url: string | null
          computed_key_strengths_anonymous: Json | null
          computed_specific_growth_opportunities: string | null
          created_at: string | null
          deal_structure_looking_for: Json | null
          deleted_at: string | null
          detailed_reason_for_selling: string | null
          financial_documents_url: string | null
          financial_snapshot_url: string | null
          full_business_address: string | null
          growth_opportunity_1: string | null
          growth_opportunity_2: string | null
          growth_opportunity_3: string | null
          id: string | null
          image_urls: Json | null
          industry: string | null
          inquiry_count: number | null
          is_seller_verified: boolean | null
          key_metrics_report_url: string | null
          key_strength_1: string | null
          key_strength_2: string | null
          key_strength_3: string | null
          key_strengths_anonymous: Json | null
          listing_title_anonymous: string | null
          location_city_region_general: string | null
          location_country: string | null
          location_real_estate_info_url: string | null
          net_profit_margin_range: string | null
          number_of_employees: string | null
          ownership_details_url: string | null
          ownership_documents_url: string | null
          post_sale_transition_support: string | null
          reason_for_selling_anonymous: string | null
          registered_business_name: string | null
          secure_data_room_link: string | null
          seller_id: string | null
          seller_role_and_time_commitment: string | null
          social_media_links: string | null
          specific_annual_revenue_last_year: number | null
          specific_growth_opportunities: string | null
          specific_net_profit_last_year: number | null
          status: string | null
          technology_stack: string | null
          updated_at: string | null
          web_presence_info_url: string | null
          year_established: number | null
        }
        Insert: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description?: string | null
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          computed_key_strengths_anonymous?: never
          computed_specific_growth_opportunities?: never
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          growth_opportunity_1?: string | null
          growth_opportunity_2?: string | null
          growth_opportunity_3?: string | null
          id?: string | null
          image_urls?: Json | null
          industry?: string | null
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strength_1?: string | null
          key_strength_2?: string | null
          key_strength_3?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous?: string | null
          location_city_region_general?: string | null
          location_country?: string | null
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          secure_data_room_link?: string | null
          seller_id?: string | null
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Update: {
          actual_company_name?: string | null
          adjusted_cash_flow?: number | null
          adjusted_cash_flow_explanation?: string | null
          annual_revenue_range?: string | null
          anonymous_business_description?: string | null
          asking_price?: number | null
          business_model?: string | null
          business_website_url?: string | null
          computed_key_strengths_anonymous?: never
          computed_specific_growth_opportunities?: never
          created_at?: string | null
          deal_structure_looking_for?: Json | null
          deleted_at?: string | null
          detailed_reason_for_selling?: string | null
          financial_documents_url?: string | null
          financial_snapshot_url?: string | null
          full_business_address?: string | null
          growth_opportunity_1?: string | null
          growth_opportunity_2?: string | null
          growth_opportunity_3?: string | null
          id?: string | null
          image_urls?: Json | null
          industry?: string | null
          inquiry_count?: number | null
          is_seller_verified?: boolean | null
          key_metrics_report_url?: string | null
          key_strength_1?: string | null
          key_strength_2?: string | null
          key_strength_3?: string | null
          key_strengths_anonymous?: Json | null
          listing_title_anonymous?: string | null
          location_city_region_general?: string | null
          location_country?: string | null
          location_real_estate_info_url?: string | null
          net_profit_margin_range?: string | null
          number_of_employees?: string | null
          ownership_details_url?: string | null
          ownership_documents_url?: string | null
          post_sale_transition_support?: string | null
          reason_for_selling_anonymous?: string | null
          registered_business_name?: string | null
          secure_data_room_link?: string | null
          seller_id?: string | null
          seller_role_and_time_commitment?: string | null
          social_media_links?: string | null
          specific_annual_revenue_last_year?: number | null
          specific_growth_opportunities?: string | null
          specific_net_profit_last_year?: number | null
          status?: string | null
          technology_stack?: string | null
          updated_at?: string | null
          web_presence_info_url?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "active_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_verification_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verification_status: {
        Row: {
          active_request_id: string | null
          email: string | null
          email_verified_at: string | null
          id: string | null
          is_email_verified: boolean | null
          is_identity_verified: boolean | null
          request_created_at: string | null
          request_status: string | null
          role: string | null
          verification_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_accounts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_admin_impersonation_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_impersonation_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_zombie_account: {
        Args: { account_id: string }
        Returns: undefined
      }
      create_verification_request: {
        Args:
          | {
              p_user_id: string
              p_listing_id?: string
              p_request_type?: string
              p_reason?: string
              p_phone_number?: string
              p_best_time_to_call?: string
              p_user_notes?: string
            }
          | {
              p_user_id: string
              p_request_type: string
              p_reason: string
              p_phone_number?: string
              p_best_time_to_call?: string
              p_user_notes?: string
            }
        Returns: {
          success: boolean
          request_id: string
          message: string
        }[]
      }
      execute_bump_request: {
        Args: { request_id: string; user_id: string; bump_reason?: string }
        Returns: {
          success: boolean
          message: string
          new_bump_count: number
          new_priority_score: number
        }[]
      }
      facilitate_chat_connection: {
        Args: {
          p_inquiry_id: string
          p_admin_id: string
          p_admin_note?: string
        }
        Returns: {
          conversation_id: string
          success: boolean
          message: string
        }[]
      }
      get_listing_verification_history: {
        Args: { listing_uuid: string }
        Returns: {
          verification_status: Database["public"]["Enums"]["listing_verification_status"]
          verified_by_name: string
          verified_at: string
          verification_notes: string
        }[]
      }
      get_monthly_user_growth: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          sellers: number
          buyers: number
          total: number
        }[]
      }
      is_admin_user: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      mark_expired_accounts_for_deletion: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_messages_as_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      recalculate_all_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          entity_type: string
          records_updated: number
        }[]
      }
      review_pending_deletions: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          account_status: string
          deletion_scheduled_at: string
          days_until_deletion: unknown
          has_activity: boolean
          safety_notes: string
        }[]
      }
      soft_delete_listing: {
        Args: { listing_id: string; deleter_id: string }
        Returns: boolean
      }
      soft_delete_user_account: {
        Args: { user_id: string; deleter_id: string }
        Returns: boolean
      }
      update_listing_inquiry_count: {
        Args: { listing_id: string }
        Returns: undefined
      }
      update_listing_verification_status: {
        Args: {
          listing_uuid: string
          new_verification_status: Database["public"]["Enums"]["listing_verification_status"]
          admin_user_id: string
          admin_notes?: string
        }
        Returns: Json
      }
      update_user_inquiry_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      update_user_listing_count: {
        Args: { user_id: string }
        Returns: undefined
      }
      update_verification_status: {
        Args: {
          p_request_id: string
          p_new_operational_status?: string
          p_new_profile_status?: string
          p_admin_note?: string
          p_admin_name?: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      validate_admin_listing_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_listings: number
          active_listings: number
          inactive_listings: number
          admin_can_see_inactive: boolean
        }[]
      }
      validate_bump_request: {
        Args: { request_id: string; user_id: string }
        Returns: {
          can_bump: boolean
          reason: string
          hours_until_eligible: number
        }[]
      }
      validate_listing_verification_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_listings: number
          verified_listings: number
          unverified_listings: number
          deactivated_listings: number
          migration_complete: boolean
        }[]
      }
      validate_listing_verification_sync: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_name: string
          user_verification_status: string
          listing_count: number
          mismatched_listings: number
          sync_status: string
        }[]
      }
    }
    Enums: {
      listing_verification_status: "unverified" | "verified" | "deactivated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      listing_verification_status: ["unverified", "verified", "deactivated"],
    },
  },
} as const

