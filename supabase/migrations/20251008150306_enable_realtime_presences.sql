-- Enable realtime for presences table
ALTER TABLE public.presences REPLICA IDENTITY FULL;

-- Add the presences table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.presences;