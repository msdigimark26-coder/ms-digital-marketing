-- Create ticket_replies table for conversation threads
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Users can view replies for their own tickets
CREATE POLICY "Users can view replies for their tickets"
ON public.ticket_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_replies.ticket_id
    AND (support_tickets.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Users can insert replies for their own tickets
CREATE POLICY "Users can insert replies for their tickets"
ON public.ticket_replies
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE support_tickets.id = ticket_replies.ticket_id
    AND (support_tickets.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Add description column to support_tickets if not exists
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable realtime for ticket_replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;