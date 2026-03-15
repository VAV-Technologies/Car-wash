-- Create blog-images storage bucket (public read, API key write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access (anyone can view blog images)
CREATE POLICY "Public can view blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Service role handles writes (via API key auth in the upload route)
-- No INSERT/UPDATE/DELETE policies needed since service role bypasses RLS
