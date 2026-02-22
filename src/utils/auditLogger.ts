import { reelsSupabase, isReelsSupabaseConfigured } from "@/integrations/supabase/reels-client";
import { supabase } from "@/integrations/supabase/client";

export type ActionType = 'create' | 'update' | 'delete' | 'authorized' | 'failed' | 'export';

export interface AuditLogParams {
    adminName: string;
    adminEmail: string;
    actionType: ActionType;
    targetType: string;
    targetId?: string;
    targetData?: any;
    description: string;
}

/**
 * Central utility to log administrative activities.
 * Directs logs to the Reels Supabase account by default if configured.
 */
export const logActivity = async (params: AuditLogParams) => {
    try {
        const client = isReelsSupabaseConfigured ? reelsSupabase : supabase;

        const entry = {
            admin_name: params.adminName,
            admin_email: params.adminEmail,
            action_type: params.actionType,
            target_type: params.targetType,
            target_id: params.targetId || null,
            target_data: params.targetData || null,
            description: params.description,
            ip_address: null, // Hard to get reliably client-side without an external service
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
        };

        const { error } = await client
            .from("admin_activity_logs")
            .insert([entry]);

        if (error) {
            console.error("Audit Logging Error:", error);
        }
    } catch (err) {
        console.error("Critical Audit Logging Failure:", err);
    }
};
