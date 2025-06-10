-- Create sharing table for public access to charts and diagrams
CREATE TABLE IF NOT EXISTS shared_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL, -- 'chart' or 'diagram'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  allow_embed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_resources_token ON shared_resources(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_resources_resource ON shared_resources(resource_id, resource_type);

-- Create RLS policies
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own shared resources
CREATE POLICY "Users can view own shared resources" ON shared_resources
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own shared resources
CREATE POLICY "Users can insert own shared resources" ON shared_resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own shared resources
CREATE POLICY "Users can update own shared resources" ON shared_resources
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own shared resources
CREATE POLICY "Users can delete own shared resources" ON shared_resources
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Anyone can view public shared resources
CREATE POLICY "Anyone can view public shared resources" ON shared_resources
  FOR SELECT USING (is_public = true);
