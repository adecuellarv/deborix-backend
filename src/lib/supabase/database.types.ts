export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          project_type: string;
          estimated_budget: string;
          contact_name: string;
          email: string;
          phone: string | null;
          message: string | null;
          idempotency_key: string;
          notification_status: "pending" | "sent" | "failed";
          notification_error: string | null;
          notification_attempts: number;
          notified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_type: string;
          estimated_budget: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          idempotency_key: string;
          notification_status?: "pending" | "sent" | "failed";
          notification_error?: string | null;
          notification_attempts?: number;
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_type?: string;
          estimated_budget?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          message?: string | null;
          idempotency_key?: string;
          notification_status?: "pending" | "sent" | "failed";
          notification_error?: string | null;
          notification_attempts?: number;
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
