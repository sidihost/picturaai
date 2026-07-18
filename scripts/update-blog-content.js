import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function updateBlogContent() {
  console.log('Updating blog post content...')

  // Update mastering-ai-prompts post with better formatting
  const promptGuideContent = `Welcome to the art of prompt engineering. This guide will help you unlock the full potential of AI image generation.

The key to creating stunning AI images lies in how you communicate your vision. A well-crafted prompt acts as a blueprint that guides the AI to produce exactly what you imagine.

**What Makes a Great Prompt?**

Every effective prompt contains five essential elements that work together to create stunning results:

**1. Subject** - This is the main focus of your image. Be specific about what you want to see. Instead of "a person", try "a young woman with curly red hair" or "an elderly fisherman with weathered hands".

**2. Style** - Define the artistic direction. Options include photorealistic, oil painting, watercolor, anime, concept art, minimalist, surrealist, and many more.

**3. Composition** - Describe how elements should be arranged. Use terms like "close-up portrait", "wide establishing shot", "centered composition", or "rule of thirds".

**4. Lighting** - This sets the mood. Consider golden hour, dramatic shadows, soft diffused light, neon glow, or studio lighting.

**5. Details** - Add specific elements that make your image unique. Colors, textures, background elements, and atmospheric effects all contribute.

**Example Transformation**

Here's how to transform a basic idea into a compelling prompt:

Basic: "A cat"

Enhanced: "A majestic Maine Coon cat with striking amber eyes, sitting regally on an antique velvet armchair, soft window light creating a warm glow, portrait photography style with shallow depth of field, rich burgundy and gold color palette"

**Photography Style Keywords**

When you want photorealistic results, try these style modifiers: Portrait photography, Macro photography, Street photography, Product photography, Fashion editorial, Documentary style, Cinematic still, or Fine art photography.

**Artistic Style Keywords**

For more creative interpretations: Oil painting, Watercolor illustration, Digital concept art, Anime or manga style, Art nouveau, Impressionist, Minimalist design, or Surrealist artwork.

**Lighting Terminology**

Lighting dramatically affects mood: Golden hour creates warmth, Blue hour adds mystery, Dramatic side lighting emphasizes texture, Soft diffused light flatters subjects, Rim lighting creates separation, and Studio lighting offers control.

**Pro Tips for Better Results**

Start simple and iterate. Begin with core elements and add detail gradually based on results. If something isn't working, adjust one element at a time.

Use reference styles wisely. Phrases like "in the style of studio photography" or "reminiscent of impressionist paintings" help guide the aesthetic.

Balance specificity with flexibility. Too vague gives unpredictable results. Too specific might conflict. Find the sweet spot.

Describe what you want, not what you don't want. Positive descriptions work better than negative ones.

**Practice Prompts to Try**

Start with these examples and modify them to explore different variations:

"A cozy coffee shop interior at dawn, warm light streaming through foggy windows, steam rising from ceramic cups, hygge atmosphere, soft focus photography"

"Futuristic Tokyo street at night, neon reflections on wet pavement, cyberpunk aesthetic, cinematic wide shot, vibrant pink and blue color scheme"

"Macro photograph of morning dew on a spider web, rainbow light refraction, crystal clear detail, nature photography, soft green bokeh background"

Now it's your turn. Head to the Studio and start experimenting with these techniques to create your own stunning AI-generated images.`

  await sql`
    UPDATE blog_posts 
    SET content = ${promptGuideContent}
    WHERE slug = 'mastering-ai-prompts'
  `
  console.log('Updated mastering-ai-prompts post')

  // Update getting-started post
  const gettingStartedContent = `Welcome to Pictura! This guide will help you create your first AI-generated image in just a few minutes.

**Step 1: Access the Studio**

Navigate to the Studio to begin your creative journey. No account is required during our beta period, so you can start generating images immediately with your free daily credits.

**Step 2: Write Your First Prompt**

The prompt is your creative instruction to the AI. Here are some tips for writing effective prompts:

Be descriptive and specific. Instead of "a dog", try "a golden retriever puppy playing in a pile of autumn leaves, warm afternoon sunlight, joyful expression".

Include artistic direction. Add style cues like "oil painting style", "cinematic photography", or "anime illustration" to guide the aesthetic.

Set the mood with lighting. Mention lighting conditions such as "golden hour", "soft studio lighting", or "dramatic shadows" to enhance atmosphere.

Add composition details. Describe the framing you want: "close-up portrait", "wide landscape shot", or "bird's eye view".

**Step 3: Choose Your Model**

Pictura offers multiple AI models, each with different strengths:

**pi-1.0** is our foundation model, great for general-purpose image generation with reliable, consistent results across a wide range of styles and subjects.

**pi-1.5-turbo** is our latest model, offering 2x faster generation with enhanced detail, better prompt understanding, and support for higher resolution output up to 2048x2048 pixels. This is our recommended choice for most users.

**Step 4: Generate Your Image**

Click the Generate button and watch as your vision comes to life. Generation typically takes 8-15 seconds depending on the model selected.

**Step 5: Review and Iterate**

Your generated image will appear in the main view. If it's not quite right, refine your prompt and try again. AI image generation often requires iteration to achieve the perfect result.

**Managing Your Creations**

All your generated images appear in your gallery below the main workspace. From there you can:

- Download images to your device in full resolution
- Rate images to help improve our models
- View the prompt used to create each image
- Delete images you no longer need

**Daily Credits**

During our beta period, every user receives 5 free image generations per day. Your credits reset at midnight UTC. This allows you to experiment and create without any cost.

**Quick Tips for Success**

Start with prompt suggestions. Click any of the sample prompts below the input field for inspiration and to see what works well.

Experiment with different styles. Try the same subject with different artistic directions to discover new possibilities.

Use Image to Image mode. Upload an existing photo and describe how you'd like to transform it for creative variations.

Save your favorites. Download images you love since gallery history may be cleared periodically during beta.

Ready to create? Head to the Studio and bring your imagination to life with Pictura AI.`

  await sql`
    UPDATE blog_posts 
    SET content = ${gettingStartedContent}
    WHERE slug = 'getting-started-with-pictura'
  `
  console.log('Updated getting-started-with-pictura post')

  console.log('Blog content update complete!')
}

updateBlogContent().catch(console.error)
