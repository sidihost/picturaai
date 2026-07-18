import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  console.log('Creating blog_posts table...');
  
  // Create blog_posts table
  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      cover_image VARCHAR(500),
      author_name VARCHAR(255) DEFAULT 'Pictura Team',
      author_avatar VARCHAR(500),
      category VARCHAR(100),
      tags TEXT[],
      published BOOLEAN DEFAULT false,
      featured BOOLEAN DEFAULT false,
      read_time INTEGER DEFAULT 5,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  
  console.log('Blog posts table created!');
  
  // Check if pi-1.5-turbo post already exists
  const existing = await sql`SELECT id FROM blog_posts WHERE slug = 'pi-1-5-turbo'`;
  
  if (existing.length === 0) {
    console.log('Inserting pi-1.5-turbo blog post...');
    
    await sql`
      INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, category, tags, published, featured, read_time)
      VALUES (
        'pi-1-5-turbo',
        'Introducing pi-1.5-turbo: 2x Faster, Higher Quality',
        'Our most powerful model yet. Experience lightning-fast generation with unprecedented image quality and detail.',
        ${`# Introducing pi-1.5-turbo

We're excited to announce **pi-1.5-turbo**, our most advanced image generation model yet. This release represents a major leap forward in both speed and quality.

## What's New

### 2x Faster Generation
Pi-1.5-turbo generates images in approximately 5 seconds - twice as fast as our previous model. This means more time creating and less time waiting.

### Higher Resolution Output
We've increased the maximum resolution to 2048x2048 pixels, giving you more detail and flexibility for your creative projects.

### Enhanced Detail & Realism
Our new model produces sharper details, more accurate colors, and better understands complex prompts with multiple subjects.

### Improved Prompt Understanding
Pi-1.5-turbo better interprets artistic styles, lighting conditions, and compositional instructions, resulting in images that more closely match your vision.

## Technical Improvements

- **New Architecture**: Built on state-of-the-art diffusion technology
- **Better Training Data**: Curated dataset for improved quality and diversity
- **Optimized Inference**: Streamlined pipeline for faster generation
- **Enhanced Safety**: Improved content filtering and safety measures

## Same Free Tier

The best part? Pi-1.5-turbo is available on the same free tier - 5 generations per day at no cost.

## Try It Now

Head to the [Studio](/studio) and select pi-1.5-turbo from the model dropdown to experience the future of AI image generation.`},
        '/images/turbo-showcase-1.jpg',
        'Product Updates',
        ARRAY['announcement', 'model', 'ai', 'update'],
        true,
        true,
        4
      )
    `;
    
    console.log('Pi-1.5-turbo post inserted!');
  } else {
    console.log('Pi-1.5-turbo post already exists, skipping...');
  }
  
  // Insert additional blog posts
  const gettingStarted = await sql`SELECT id FROM blog_posts WHERE slug = 'getting-started-with-pictura'`;
  
  if (gettingStarted.length === 0) {
    console.log('Inserting getting started post...');
    
    await sql`
      INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, category, tags, published, featured, read_time)
      VALUES (
        'getting-started-with-pictura',
        'Getting Started with Pictura AI',
        'Learn how to create stunning AI-generated images with our comprehensive beginner guide.',
        ${`# Getting Started with Pictura AI

Welcome to Pictura! This guide will help you create your first AI-generated image in minutes.

## Step 1: Access the Studio

Navigate to the [Studio](/studio) to begin. No account required - you can start generating immediately.

## Step 2: Write Your Prompt

The key to great AI images is a good prompt. Here are some tips:

- **Be specific**: Instead of "a dog", try "a golden retriever puppy playing in autumn leaves"
- **Include style**: Add artistic direction like "oil painting style" or "cinematic photography"
- **Describe lighting**: Mention "golden hour", "dramatic shadows", or "soft diffused light"
- **Set the mood**: Words like "peaceful", "mysterious", or "energetic" help guide the output

## Step 3: Choose Your Model

- **pi-1.0**: Great for general purpose generation
- **pi-1.5-turbo**: Faster and higher quality (recommended)

## Step 4: Generate!

Click the generate button and watch your image come to life in seconds.

## Pro Tips

1. **Iterate**: Don't expect perfection on the first try. Refine your prompt based on results.
2. **Use suggestions**: Click on prompt suggestions for inspiration.
3. **Save favorites**: Download images you love to your device.

Happy creating!`},
        '/images/showcase-2.jpg',
        'Tutorials',
        ARRAY['tutorial', 'beginner', 'guide'],
        true,
        false,
        3
      )
    `;
    
    console.log('Getting started post inserted!');
  }
  
  const promptGuide = await sql`SELECT id FROM blog_posts WHERE slug = 'mastering-ai-prompts'`;
  
  if (promptGuide.length === 0) {
    console.log('Inserting prompt guide post...');
    
    await sql`
      INSERT INTO blog_posts (slug, title, excerpt, content, cover_image, category, tags, published, featured, read_time)
      VALUES (
        'mastering-ai-prompts',
        'Mastering AI Image Prompts: A Complete Guide',
        'Unlock the full potential of AI image generation with advanced prompting techniques.',
        ${`# Mastering AI Image Prompts

Learn the art of prompt engineering to create exactly what you envision.

## The Anatomy of a Great Prompt

A well-structured prompt typically includes:

1. **Subject**: What is the main focus?
2. **Style**: What artistic style should it have?
3. **Composition**: How should elements be arranged?
4. **Lighting**: What mood does the lighting create?
5. **Details**: What specific elements should be included?

## Example Breakdown

**Basic prompt**: "A cat"

**Enhanced prompt**: "A majestic Maine Coon cat with emerald green eyes, sitting on a velvet cushion, portrait photography, soft window light, shallow depth of field, warm color tones"

## Style Keywords That Work

### Photography Styles
- Portrait photography
- Macro photography  
- Street photography
- Product photography
- Cinematic still

### Art Styles
- Oil painting
- Watercolor
- Digital art
- Anime/manga
- Concept art
- Minimalist

### Lighting Terms
- Golden hour
- Blue hour
- Dramatic lighting
- Soft diffused light
- Rim lighting
- Chiaroscuro

## Common Mistakes to Avoid

1. **Too vague**: Give specific details
2. **Contradictory instructions**: Keep it coherent
3. **Too many subjects**: Focus on one main element
4. **Ignoring composition**: Describe arrangement

Master these techniques and watch your generations improve dramatically!`},
        '/images/showcase-3.jpg',
        'Tutorials',
        ARRAY['tutorial', 'prompts', 'advanced', 'guide'],
        true,
        false,
        6
      )
    `;
    
    console.log('Prompt guide post inserted!');
  }
  
  console.log('Migration complete!');
}

createTables().catch(console.error);
