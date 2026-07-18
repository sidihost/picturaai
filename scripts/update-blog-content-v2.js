import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function updateBlogContent() {
  console.log('Updating blog posts with rich HTML content...')

  const promptGuide = `<div class="article-body">
<p class="text-base text-muted-foreground leading-7 mb-6">Welcome to the art of prompt engineering. This guide will help you unlock the full potential of Pictura's AI image generation, turning simple ideas into breathtaking visuals.</p>

<p class="text-base text-muted-foreground leading-7 mb-8">The key to creating stunning AI images lies in how you communicate your vision. A well-crafted prompt acts as a blueprint that guides the AI to produce exactly what you imagine. Let's break down the essential building blocks.</p>

<div class="border-l-2 border-primary/40 pl-5 my-8">
<p class="text-sm text-foreground italic leading-relaxed">"Think of your prompt as a conversation with the AI. The more clearly you describe your vision, the better it can bring it to life."</p>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">The Five Elements of a Great Prompt</h2>

<p class="text-base text-muted-foreground leading-7 mb-6">Every effective prompt contains five essential elements that work together to create stunning results.</p>

<div class="grid gap-4 my-6">
<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-center gap-3 mb-2">
<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">1</span>
<span class="text-sm font-semibold text-foreground">Subject</span>
</div>
<p class="text-sm text-muted-foreground leading-relaxed">The main focus of your image. Be specific about what you want to see. Instead of "a person", try "a young woman with curly red hair" or "an elderly fisherman with weathered hands".</p>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-center gap-3 mb-2">
<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">2</span>
<span class="text-sm font-semibold text-foreground">Style</span>
</div>
<p class="text-sm text-muted-foreground leading-relaxed">Define the artistic direction. Options include photorealistic, oil painting, watercolor, anime, concept art, minimalist, surrealist, and many more.</p>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-center gap-3 mb-2">
<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">3</span>
<span class="text-sm font-semibold text-foreground">Composition</span>
</div>
<p class="text-sm text-muted-foreground leading-relaxed">Describe how elements should be arranged. Use terms like "close-up portrait", "wide establishing shot", "centered composition", or "rule of thirds".</p>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-center gap-3 mb-2">
<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">4</span>
<span class="text-sm font-semibold text-foreground">Lighting</span>
</div>
<p class="text-sm text-muted-foreground leading-relaxed">This sets the mood. Consider golden hour, dramatic shadows, soft diffused light, neon glow, or studio lighting to enhance your scene.</p>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-center gap-3 mb-2">
<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">5</span>
<span class="text-sm font-semibold text-foreground">Details</span>
</div>
<p class="text-sm text-muted-foreground leading-relaxed">Add specific elements that make your image unique. Colors, textures, background elements, and atmospheric effects all contribute to the final result.</p>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Example: From Basic to Brilliant</h2>

<p class="text-base text-muted-foreground leading-7 mb-4">See how a simple idea transforms into a compelling prompt:</p>

<div class="grid sm:grid-cols-2 gap-4 my-6">
<div class="rounded-xl bg-secondary/40 p-5">
<span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Before</span>
<p class="text-sm text-foreground mt-2 font-mono">"A cat"</p>
</div>
<div class="rounded-xl bg-primary/5 border border-primary/20 p-5">
<span class="text-[10px] font-semibold text-primary uppercase tracking-wider">After</span>
<p class="text-sm text-foreground mt-2 font-mono">"A majestic Maine Coon cat with striking amber eyes, sitting regally on an antique velvet armchair, soft window light creating a warm glow, portrait photography, shallow depth of field, rich burgundy and gold color palette"</p>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Style Keywords Reference</h2>

<p class="text-base text-muted-foreground leading-7 mb-6">Use these keywords to steer the visual direction of your generations.</p>

<div class="grid sm:grid-cols-2 gap-4 my-6">
<div class="rounded-xl border border-border/50 bg-card p-5">
<h3 class="text-sm font-semibold text-foreground mb-3">Photography Styles</h3>
<div class="flex flex-wrap gap-2">
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Portrait</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Macro</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Street</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Product</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Fashion Editorial</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Cinematic Still</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Documentary</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Fine Art</span>
</div>
</div>
<div class="rounded-xl border border-border/50 bg-card p-5">
<h3 class="text-sm font-semibold text-foreground mb-3">Artistic Styles</h3>
<div class="flex flex-wrap gap-2">
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Oil Painting</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Watercolor</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Concept Art</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Anime</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Art Nouveau</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Impressionist</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Minimalist</span>
<span class="px-2.5 py-1 rounded-md bg-secondary/60 text-xs text-foreground">Surrealist</span>
</div>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Lighting Cheat Sheet</h2>

<div class="rounded-xl border border-border/50 bg-card overflow-hidden my-6">
<table class="w-full text-sm">
<thead class="bg-secondary/30">
<tr><th class="text-left text-xs font-semibold text-foreground px-4 py-3">Lighting Type</th><th class="text-left text-xs font-semibold text-foreground px-4 py-3">Effect</th></tr>
</thead>
<tbody class="divide-y divide-border/30">
<tr><td class="px-4 py-3 text-foreground">Golden Hour</td><td class="px-4 py-3 text-muted-foreground">Warm, romantic, soft shadows</td></tr>
<tr><td class="px-4 py-3 text-foreground">Blue Hour</td><td class="px-4 py-3 text-muted-foreground">Cool, mysterious, atmospheric</td></tr>
<tr><td class="px-4 py-3 text-foreground">Dramatic Side Lighting</td><td class="px-4 py-3 text-muted-foreground">Strong contrast, texture emphasis</td></tr>
<tr><td class="px-4 py-3 text-foreground">Soft Diffused</td><td class="px-4 py-3 text-muted-foreground">Flattering, even, gentle</td></tr>
<tr><td class="px-4 py-3 text-foreground">Rim/Back Lighting</td><td class="px-4 py-3 text-muted-foreground">Silhouettes, separation, glow</td></tr>
<tr><td class="px-4 py-3 text-foreground">Studio Lighting</td><td class="px-4 py-3 text-muted-foreground">Clean, controlled, professional</td></tr>
</tbody>
</table>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Pro Tips</h2>

<div class="grid gap-3 my-6">
<div class="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Start simple, then iterate.</span> Begin with core elements and add detail gradually based on results.</p>
</div>
<div class="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Use reference styles wisely.</span> Phrases like "in the style of studio photography" help guide the aesthetic.</p>
</div>
<div class="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Balance specificity with flexibility.</span> Too vague gives unpredictable results. Too specific might conflict. Find the sweet spot.</p>
</div>
<div class="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Describe what you want, not what you don't.</span> Positive descriptions consistently produce better results than negative ones.</p>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Practice Prompts</h2>

<p class="text-base text-muted-foreground leading-7 mb-4">Try these prompts in the Studio and modify them to explore different variations:</p>

<div class="grid gap-3 my-6">
<div class="rounded-xl bg-secondary/30 p-4">
<p class="text-sm text-foreground font-mono leading-relaxed">"A cozy coffee shop interior at dawn, warm light streaming through foggy windows, steam rising from ceramic cups, hygge atmosphere, soft focus photography"</p>
</div>
<div class="rounded-xl bg-secondary/30 p-4">
<p class="text-sm text-foreground font-mono leading-relaxed">"Futuristic Tokyo street at night, neon reflections on wet pavement, cyberpunk aesthetic, cinematic wide shot, vibrant pink and blue color scheme"</p>
</div>
<div class="rounded-xl bg-secondary/30 p-4">
<p class="text-sm text-foreground font-mono leading-relaxed">"Macro photograph of morning dew on a spider web, rainbow light refraction, crystal clear detail, nature photography, soft green bokeh background"</p>
</div>
</div>

<p class="text-base text-muted-foreground leading-7 mt-8">Now it's your turn. Head to the Studio and start experimenting with these techniques to create your own stunning AI-generated images.</p>
</div>`

  const gettingStarted = `<div class="article-body">
<p class="text-base text-muted-foreground leading-7 mb-6">Welcome to Pictura! This guide walks you through creating your first AI-generated image in just a few minutes. No account required during our beta.</p>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Getting Started in 5 Steps</h2>

<div class="grid gap-4 my-6">
<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-start gap-4">
<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">1</span>
<div>
<h3 class="text-sm font-semibold text-foreground mb-1.5">Access the Studio</h3>
<p class="text-sm text-muted-foreground leading-relaxed">Navigate to the Studio from the homepage. No account is required during our beta period, so you can start generating images immediately with your free daily credits.</p>
</div>
</div>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-start gap-4">
<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">2</span>
<div>
<h3 class="text-sm font-semibold text-foreground mb-1.5">Write Your Prompt</h3>
<p class="text-sm text-muted-foreground leading-relaxed mb-3">The prompt is your creative instruction to the AI. Here are some tips for writing effective prompts:</p>
<ul class="space-y-1.5">
<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-primary mt-1.5 block h-1 w-1 rounded-full bg-primary shrink-0"></span><span><span class="font-medium text-foreground">Be descriptive.</span> Instead of "a dog", try "a golden retriever puppy playing in autumn leaves, warm afternoon sunlight"</span></li>
<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-primary mt-1.5 block h-1 w-1 rounded-full bg-primary shrink-0"></span><span><span class="font-medium text-foreground">Include artistic direction.</span> Add cues like "oil painting style", "cinematic photography", or "anime illustration"</span></li>
<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-primary mt-1.5 block h-1 w-1 rounded-full bg-primary shrink-0"></span><span><span class="font-medium text-foreground">Set the mood.</span> Mention lighting like "golden hour", "soft studio lighting", or "dramatic shadows"</span></li>
<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-primary mt-1.5 block h-1 w-1 rounded-full bg-primary shrink-0"></span><span><span class="font-medium text-foreground">Add composition.</span> Describe the framing: "close-up portrait", "wide landscape shot", or "bird's eye view"</span></li>
</ul>
</div>
</div>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-start gap-4">
<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">3</span>
<div>
<h3 class="text-sm font-semibold text-foreground mb-1.5">Choose Your Model</h3>
<p class="text-sm text-muted-foreground leading-relaxed mb-3">Pictura offers multiple AI models, each with different strengths:</p>
<div class="grid gap-2">
<div class="rounded-lg bg-secondary/40 p-3">
<p class="text-xs font-semibold text-foreground">pi-1.0</p>
<p class="text-xs text-muted-foreground mt-0.5">Our foundation model. Great for general-purpose generation with reliable, consistent results.</p>
</div>
<div class="rounded-lg bg-primary/5 border border-primary/15 p-3">
<div class="flex items-center gap-2">
<p class="text-xs font-semibold text-foreground">pi-1.5-turbo</p>
<span class="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">RECOMMENDED</span>
</div>
<p class="text-xs text-muted-foreground mt-0.5">2x faster, enhanced detail, better prompt understanding, up to 2048x2048px output.</p>
</div>
</div>
</div>
</div>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-start gap-4">
<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">4</span>
<div>
<h3 class="text-sm font-semibold text-foreground mb-1.5">Generate Your Image</h3>
<p class="text-sm text-muted-foreground leading-relaxed">Click the Generate button and watch as your vision comes to life. Generation typically takes 8-15 seconds depending on the model selected.</p>
</div>
</div>
</div>

<div class="rounded-xl border border-border/50 bg-card p-5">
<div class="flex items-start gap-4">
<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">5</span>
<div>
<h3 class="text-sm font-semibold text-foreground mb-1.5">Review and Iterate</h3>
<p class="text-sm text-muted-foreground leading-relaxed">Your generated image appears in the main view. If it's not quite right, refine your prompt and try again. AI image generation often requires iteration to achieve the perfect result.</p>
</div>
</div>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Managing Your Creations</h2>

<p class="text-base text-muted-foreground leading-7 mb-4">All generated images appear in your gallery below the main workspace. Here's what you can do:</p>

<div class="grid sm:grid-cols-2 gap-3 my-6">
<div class="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] text-primary">DL</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Download</span> images to your device in full resolution</p>
</div>
<div class="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] text-primary">RT</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Rate</span> images to help improve our AI models</p>
</div>
<div class="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] text-primary">PR</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">View prompts</span> used to create each image</p>
</div>
<div class="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4">
<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] text-primary">RM</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Delete</span> images you no longer need</p>
</div>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Daily Credits</h2>

<div class="rounded-xl bg-primary/5 border border-primary/15 p-5 my-6">
<p class="text-sm text-muted-foreground leading-relaxed">During beta, every user receives <span class="font-semibold text-foreground">5 free generations per day</span>. Credits reset at midnight UTC. This allows you to experiment and create without any cost.</p>
</div>

<h2 class="text-xl font-semibold text-foreground mt-10 mb-5">Quick Tips for Success</h2>

<div class="grid gap-3 my-6">
<div class="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Use prompt suggestions.</span> Click any sample prompt below the input field for instant inspiration.</p>
</div>
<div class="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Experiment with styles.</span> Try the same subject with different artistic directions to discover new possibilities.</p>
</div>
<div class="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Try Image to Image.</span> Upload an existing photo and describe how you'd like to transform it for creative variations.</p>
</div>
<div class="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
<span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
<p class="text-sm text-muted-foreground leading-relaxed"><span class="font-medium text-foreground">Save your favorites.</span> Download images you love since gallery history may be cleared periodically during beta.</p>
</div>
</div>

<p class="text-base text-muted-foreground leading-7 mt-8">Ready to create? Head to the Studio and bring your imagination to life with Pictura AI.</p>
</div>`

  await sql`UPDATE blog_posts SET content = ${promptGuide} WHERE slug = 'mastering-ai-prompts'`
  console.log('Updated mastering-ai-prompts')

  await sql`UPDATE blog_posts SET content = ${gettingStarted} WHERE slug = 'getting-started-with-pictura'`
  console.log('Updated getting-started-with-pictura')

  console.log('Done!')
}

updateBlogContent().catch(console.error)
