import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('Starting migration...');
  
  try {
    // Add image history table
    await sql`
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
      )
    `;
    console.log('Created image_history table');

    // Add credit alerts table
    await sql`
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
      )
    `;
    console.log('Created credit_alerts table');

    // Add webhook logs table
    await sql`
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
      )
    `;
    console.log('Created webhook_logs table');

    // Add usage analytics table
    await sql`
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
      )
    `;
    console.log('Created usage_analytics table');

    // Add batch jobs table
    await sql`
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
      )
    `;
    console.log('Created batch_jobs table');

    // Add style presets table
    await sql`
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
      )
    `;
    console.log('Created style_presets table');

    // Insert default style presets
    const presets = [
      { name: 'photorealistic', display: 'Photorealistic', desc: 'Ultra-realistic photographs', prefix: 'A highly detailed, photorealistic image of', suffix: ', shot on Canon EOS R5, 8k resolution, sharp focus, professional photography', negative: 'cartoon, anime, illustration, painting, drawing, blur' },
      { name: 'anime', display: 'Anime', desc: 'Japanese anime style artwork', prefix: 'An anime-style illustration of', suffix: ', vibrant colors, anime art style, detailed anime artwork', negative: 'realistic, photograph, 3d render' },
      { name: 'oil-painting', display: 'Oil Painting', desc: 'Classical oil painting style', prefix: 'An oil painting masterpiece depicting', suffix: ', classical art style, rich textures, museum quality, fine art', negative: 'digital art, photograph, modern' },
      { name: '3d-render', display: '3D Render', desc: 'Modern 3D rendered graphics', prefix: 'A high-quality 3D render of', suffix: ', octane render, ray tracing, volumetric lighting, 8k', negative: 'flat, 2d, painting, photograph' },
      { name: 'watercolor', display: 'Watercolor', desc: 'Soft watercolor painting style', prefix: 'A beautiful watercolor painting of', suffix: ', soft colors, flowing brushstrokes, artistic watercolor technique', negative: 'digital, photograph, sharp edges' },
      { name: 'cyberpunk', display: 'Cyberpunk', desc: 'Futuristic cyberpunk aesthetic', prefix: 'A cyberpunk scene featuring', suffix: ', neon lights, futuristic city, dystopian atmosphere, blade runner style', negative: 'nature, medieval, historical' },
      { name: 'fantasy', display: 'Fantasy', desc: 'Epic fantasy artwork', prefix: 'An epic fantasy illustration of', suffix: ', magical atmosphere, detailed fantasy art, mythical, legendary', negative: 'modern, realistic, urban' },
      { name: 'minimalist', display: 'Minimalist', desc: 'Clean minimalist design', prefix: 'A minimalist representation of', suffix: ', clean lines, simple shapes, negative space, modern design', negative: 'cluttered, detailed, busy, ornate' },
      { name: 'vintage', display: 'Vintage', desc: 'Retro vintage aesthetic', prefix: 'A vintage-style image of', suffix: ', retro aesthetic, nostalgic feel, aged texture, classic look', negative: 'modern, futuristic, digital' },
      { name: 'sketch', display: 'Sketch', desc: 'Hand-drawn pencil sketch', prefix: 'A detailed pencil sketch of', suffix: ', graphite drawing, artistic sketch, hand-drawn illustration', negative: 'color, photograph, digital' },
    ];

    for (const preset of presets) {
      await sql`
        INSERT INTO style_presets (name, display_name, description, prompt_prefix, prompt_suffix, negative_prompt)
        VALUES (${preset.name}, ${preset.display}, ${preset.desc}, ${preset.prefix}, ${preset.suffix}, ${preset.negative})
        ON CONFLICT (name) DO NOTHING
      `;
    }
    console.log('Inserted style presets');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_image_history_developer ON image_history(developer_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_analytics_developer ON usage_analytics(developer_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_batch_jobs_developer ON batch_jobs(developer_id, created_at DESC)`;
    console.log('Created indexes');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
