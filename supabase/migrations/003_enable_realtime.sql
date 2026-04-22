-- Enable Realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE khatmah_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE khatmahs;
ALTER PUBLICATION supabase_realtime ADD TABLE khatmah_participants;
