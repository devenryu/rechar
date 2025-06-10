-- Create diagrams table
CREATE TABLE IF NOT EXISTS diagrams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  diagram_type TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  diagram_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own diagrams
CREATE POLICY "Users can view own diagrams" ON diagrams
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own diagrams
CREATE POLICY "Users can insert own diagrams" ON diagrams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own diagrams
CREATE POLICY "Users can update own diagrams" ON diagrams
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own diagrams
CREATE POLICY "Users can delete own diagrams" ON diagrams
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for diagrams
CREATE TRIGGER update_diagrams_updated_at
  BEFORE UPDATE ON diagrams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
