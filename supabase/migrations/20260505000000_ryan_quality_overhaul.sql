-- Ryan (Email Reply Agent) quality overhaul.
-- 1. agent_settings.config: separate per-agent config JSON from the prompt
--    override field. Plusvibe was storing { workspace_id, plusvibe_api_key }
--    inside system_prompt, which collided with using system_prompt as a real
--    prompt override.
-- 2. email_leads.last_outbound_html: surface Ryan's outbound reply text in
--    the admin UI so the team can see what he actually said.

alter table public.agent_settings
  add column if not exists config jsonb;

-- One-time backfill for existing plusvibe rows. The admin UI was writing
-- { workspace_id, plusvibe_api_key } as JSON into system_prompt. Move it
-- into config and clear system_prompt. Wrapped in DO block so a non-JSON
-- value in system_prompt doesn't kill the migration.
do $$
declare
  r record;
  parsed jsonb;
begin
  for r in
    select agent_name, system_prompt
    from public.agent_settings
    where agent_name = 'plusvibe'
      and system_prompt is not null
      and system_prompt like '{%'
  loop
    begin
      parsed := r.system_prompt::jsonb;
      if parsed ? 'workspace_id' then
        update public.agent_settings
        set config = parsed, system_prompt = null
        where agent_name = r.agent_name;
      end if;
    exception when others then
      raise notice 'skipping non-JSON system_prompt for agent %', r.agent_name;
    end;
  end loop;
end $$;

alter table public.email_leads
  add column if not exists last_outbound_html text;

alter table public.email_leads
  add column if not exists last_outbound_at timestamptz;
