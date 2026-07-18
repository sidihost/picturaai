-- Add image history table for storing generated images
CREATE TABLE IF NOT EXISTS image_history (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  full_prompt TEXT,
  model VARCHAR(50) NOT NULL,
  style_preset VARCHAR(50),
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1024,
  image_url TEXT NOT NULL,
  generation_time_ms INTEGER,
  provider VARCHAR(50),
  credits_used DECIMAL(10,4) DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by developer
CREATE INDEX IF NOT EXISTS idx_image_history_developer ON image_history(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_history_favorites ON image_history(developer_id, is_favorite) WHERE is_favorite = TRUE;

-- Add credit alert settings table
CREATE TABLE IF NOT EXISTS credit_alerts (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  threshold_amount DECIMAL(10,2) NOT NULL,
  alert_type VARCHAR(20) NOT NULL DEFAULT 'email',
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(developer_id, threshold_amount)
);

-- Add webhook logs for tracking
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add usage analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS usage_analytics (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  api_key_id INTEGER REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(100) NOT NULL,
  model VARCHAR(50),
  prompt_length INTEGER,
  generation_time_ms INTEGER,
  credits_used DECIMAL(10,4),
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_usage_analytics_developer ON usage_analytics(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_endpoint ON usage_analytics(endpoint, created_at DESC);

-- Add batch jobs table
CREATE TABLE IF NOT EXISTS batch_jobs (
  id SERIAL PRIMARY KEY,
  developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_images INTEGER NOT NULL,
  completed_images INTEGER DEFAULT 0,
  failed_images INTEGER DEFAULT 0,
  prompts JSONB NOT NULL,
  results JSONB DEFAULT '[]',
  model VARCHAR(50) NOT NULL,
  style_preset VARCHAR(50),
  width INTEGER DEFAULT 1024,
  height INTEGER DEFAULT 1024,
  credits_used DECIMAL(10,4) DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_developer ON batch_jobs(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status) WHERE status IN ('pending', 'processing');

-- Add style presets table
CREATE TABLE IF NOT EXISTS style_presets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  prompt_prefix TEXT,
  prompt_suffix TEXT,
  negative_prompt TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default style presets
INSERT INTO style_presets (name, display_name, description, prompt_prefix, prompt_suffix, negative_prompt) VALUES
('photorealistic', 'Photorealistic', 'Ultra-realistic photographs', 'A highly detailed, photorealistic image of', ', shot on Canon EOS R5, 8k resolution, sharp focus, professional photography', 'cartoon, anime, illustration, painting, drawing, blur'),
('anime', 'Anime', 'Japanese anime style artwork', 'An anime-style illustration of', ', vibrant colors, anime art style, detailed anime artwork', 'realistic, photograph, 3d render'),
('oil-painting', 'Oil Painting', 'Classical oil painting style', 'An oil painting masterpiece depicting', ', classical art style, rich textures, museum quality, fine art', 'digital art, photograph, modern'),
('3d-render', '3D Render', 'Modern 3D rendered graphics', 'A high-quality 3D render of', ', octane render, ray tracing, volumetric lighting, 8k', 'flat, 2d, painting, photograph'),
('watercolor', 'Watercolor', 'Soft watercolor painting style', 'A beautiful watercolor painting of', ', soft colors, flowing brushstrokes, artistic watercolor technique', 'digital, photograph, sharp edges'),
('cyberpunk', 'Cyberpunk', 'Futuristic cyberpunk aesthetic', 'A cyberpunk scene featuring', ', neon lights, futuristic city, dystopian atmosphere, blade runner style', 'nature, medieval, historical'),
('fantasy', 'Fantasy', 'Epic fantasy artwork', 'An epic fantasy illustration of', ', magical atmosphere, detailed fantasy art, mythical, legendary', 'modern, realistic, urban'),
('minimalist', 'Minimalist', 'Clean minimalist design', 'A minimalist representation of', ', clean lines, simple shapes, negative space, modern design', 'cluttered, detailed, busy, ornate'),
('vintage', 'Vintage', 'Retro vintage aesthetic', 'A vintage-style image of', ', retro aesthetic, nostalgic feel, aged texture, classic look', 'modern, futuristic, digital'),
('sketch', 'Sketch', 'Hand-drawn pencil sketch', 'A detailed pencil sketch of', ', graphite drawing, artistic sketch, hand-drawn illustration', 'color, photograph, digital')
ON CONFLICT (name) DO NOTHING;
