-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image VARCHAR(500),
  author VARCHAR(255) DEFAULT 'Pictura Team',
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Insert the pi-1.5-turbo announcement post
INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, author, published, featured, tags, read_time)
VALUES (
  'pi-1-5-turbo',
  'Introducing pi-1.5-turbo: 2x Faster, Higher Quality',
  'We''re excited to announce pi-1.5-turbo, our latest image generation model with 2x faster inference and significantly improved output quality.',
  E'# Introducing pi-1.5-turbo

We''re thrilled to announce the release of **pi-1.5-turbo**, our most advanced image generation model yet. This release represents a major leap forward in both speed and quality.

## What''s New

### 2x Faster Generation
pi-1.5-turbo generates images in just 5 seconds on average, compared to 10 seconds with pi-1.0. This means you can iterate faster and bring your creative visions to life in half the time.

### Higher Resolution Output
We''ve increased the maximum output resolution to 2048x2048 pixels, giving you more detail and flexibility for your projects.

### Improved Quality
Our new model produces images with:
- Better prompt adherence
- More realistic textures and lighting
- Improved face and hand generation
- Enhanced detail in complex scenes

### Same Free Tier
Best of all, pi-1.5-turbo is available on the same free tier - 5 generations per day, no credit card required.

## Technical Improvements

Under the hood, pi-1.5-turbo uses a refined diffusion architecture with:
- Optimized attention mechanisms
- Better noise scheduling
- Enhanced CLIP text encoding

## Try It Now

pi-1.5-turbo is available now in Pictura Studio. Simply select it from the model dropdown and start creating!',
  '/images/turbo-showcase-1.jpg',
  'Pictura Team',
  true,
  true,
  ARRAY['announcement', 'model', 'update'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = EXCLUDED.cover_image,
  updated_at = NOW();

-- Insert additional blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, author, published, featured, tags, read_time)
VALUES (
  'getting-started-with-pictura',
  'Getting Started with Pictura AI',
  'Learn how to create stunning AI-generated images with Pictura. From your first prompt to advanced techniques.',
  E'# Getting Started with Pictura AI

Welcome to Pictura! This guide will help you create your first AI-generated image and teach you some tips for getting the best results.

## Your First Image

1. Go to the Studio
2. Type a description of what you want to create
3. Click Generate
4. Wait a few seconds for your image

## Writing Better Prompts

The key to great AI images is writing good prompts. Here are some tips:

### Be Specific
Instead of "a dog", try "a golden retriever puppy playing in autumn leaves, warm sunlight, shallow depth of field"

### Mention Style
Add artistic styles like "oil painting", "digital art", "photograph", "anime style", "watercolor"

### Include Lighting
Describe the lighting: "golden hour", "dramatic shadows", "soft diffused light", "neon lights"

### Add Mood
Set the atmosphere: "peaceful", "mysterious", "vibrant", "melancholic"

## Examples

Here are some prompt examples to inspire you:

- "A cozy coffee shop interior on a rainy day, warm lighting, steam rising from cups, watercolor illustration style"
- "Futuristic city skyline at sunset, flying cars, neon signs, cyberpunk aesthetic, highly detailed"
- "Portrait of an astronaut in a field of flowers, helmet reflecting the sky, photorealistic"

Happy creating!',
  '/images/showcase-1.jpg',
  'Pictura Team',
  true,
  false,
  ARRAY['tutorial', 'guide', 'tips'],
  6
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, author, published, featured, tags, read_time)
VALUES (
  'prompt-engineering-tips',
  '10 Prompt Engineering Tips for Better AI Images',
  'Master the art of prompt engineering with these 10 essential tips that will dramatically improve your AI-generated images.',
  E'# 10 Prompt Engineering Tips for Better AI Images

Creating stunning AI images is part art, part science. Here are 10 tips to level up your prompt game.

## 1. Start with the Subject
Always lead with what you want to see: "A majestic lion", "A futuristic cityscape", "A portrait of a warrior"

## 2. Add Descriptive Adjectives
Layer in details: "A majestic golden lion with a flowing mane"

## 3. Specify the Setting
Context matters: "in a misty savanna at dawn"

## 4. Define the Art Style
Be explicit: "digital art", "oil painting", "photograph", "3D render", "anime illustration"

## 5. Describe Lighting
Lighting transforms everything: "dramatic rim lighting", "soft morning light", "neon glow"

## 6. Include Camera Details
For photorealistic images: "85mm lens", "shallow depth of field", "wide angle shot"

## 7. Reference Artists (Carefully)
"In the style of Studio Ghibli", "reminiscent of Art Nouveau"

## 8. Specify Quality
Add quality boosters: "highly detailed", "8K", "professional photography"

## 9. Use Negative Concepts
Mention what to avoid: "no blur", "no text", "no watermarks"

## 10. Iterate and Refine
Your first prompt is rarely your best. Keep refining!

Remember: practice makes perfect. The more you experiment, the better you''ll understand how to communicate with AI models.',
  '/images/showcase-3.jpg',
  'Pictura Team',
  true,
  false,
  ARRAY['tutorial', 'prompts', 'tips'],
  8
) ON CONFLICT (slug) DO NOTHING;
