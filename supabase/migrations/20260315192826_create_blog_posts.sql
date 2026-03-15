-- Create blog_posts table for the resources/blog section

-- Create category enum
CREATE TYPE blog_category AS ENUM ('news', 'insights', 'guides', 'company');

-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content
  cover_image_url TEXT,
  category blog_category NOT NULL DEFAULT 'insights',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT NOT NULL,
  author_role TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5
);

-- Indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_blog_posts_category ON blog_posts (category);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN (tags);
CREATE INDEX idx_blog_posts_published ON blog_posts (is_published, published_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (is_published = true);

-- Service role has full access (for API key-based writes)
-- No restrictive policy needed since service role bypasses RLS
