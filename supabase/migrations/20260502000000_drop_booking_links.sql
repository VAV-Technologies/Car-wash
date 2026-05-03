-- Drop the unique-token booking infrastructure. Shera is offline and a human
-- handler runs all outreach; one shared /book form replaces per-customer URLs.

alter table public.whatsapp_conversations drop column if exists booking_link_token;

drop table if exists public.booking_links cascade;
