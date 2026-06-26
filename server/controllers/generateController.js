const OpenAI = require('openai')

const generateWebsite = async (req, res) => {
  const { prompt, existingCode, images } = req.body

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' })
  }

  try {
    const client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    let systemPrompt = `You are an expert web developer who creates stunning, modern, professional websites.
STRICT RULES:
- Return ONLY complete HTML code starting with <!DOCTYPE html> and ending with </html>
- Never return explanations or markdown
- Always use Tailwind CSS via CDN
- Always use Google Fonts
- Use modern design with gradients and glassmorphism
- Include smooth animations and hover effects
- Never truncate or cut off the code
- For ALL images, ONLY use https://images.unsplash.com URLs with proper query parameters like ?q=80&w=1000&auto=format&fit=crop, OR use https://picsum.photos/WIDTH/HEIGHT for generic placeholders
- Never invent or guess image URLs that may not exist
- CRITICAL RESPONSIVE RULE: For ALL large headings, ALWAYS use responsive Tailwind text size classes that scale down on smaller screens. Example: instead of "text-8xl" alone, use "text-3xl sm:text-5xl md:text-7xl lg:text-8xl". Never use a single large fixed text size without smaller breakpoint variants.
- Apply the same responsive scaling pattern to padding, margins, and grid columns (e.g. "grid-cols-1 md:grid-cols-3" not just "grid-cols-3")`

    let userPrompt

    if (existingCode) {
      systemPrompt += `
- You will be given EXISTING website code and a CHANGE REQUEST
- Apply ONLY the requested change to the existing code
- Keep everything else in the website exactly the same
- Return the FULL updated HTML code, not just the changed part`

      userPrompt = `Here is the existing website code:

${existingCode}

Now apply this change: ${prompt}

Return the complete updated HTML code with this change applied.`
    } else {
      userPrompt = `Create a complete stunning website for: ${prompt}. Return ONLY complete HTML code.`
    }

    if (images && images.length > 0) {
      userPrompt += `

The user has uploaded these images, use them as actual <img> src values in the website where appropriate:
${images.map((img, i) => `Image ${i + 1} (${img.name}): ${img.url}`).join('\n')}`
    }

    const completion = await client.chat.completions.create({
      model: 'google/gemma-4-31b-it:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 8000,
    })

    const htmlCode = completion.choices[0].message.content

    let title = 'My Website'
    let description = 'A custom website'

    if (!existingCode) {
      try {
        const metaCompletion = await client.chat.completions.create({
          model: 'google/gemma-4-31b-it:free',
          messages: [
            {
              role: 'system',
              content: `Return ONLY valid JSON in this exact format with no markdown, no explanation: {"title": "...", "description": "..."}
- title: 2-4 words, Title Case (capitalize each major word), no punctuation. Example: "Restaurant Website", "FlowSync Landing Page"
- description: one short sentence, 8-12 words, proper sentence case (capital first letter), describing what the website is for. Example: "A modern landing page for a restaurant booking service."`
            },
            {
              role: 'user',
              content: `Generate a title and description for a website about: ${prompt}`
            }
          ],
          max_tokens: 60,
        })

        const metaText = metaCompletion.choices[0].message.content.trim()
        const cleanedText = metaText.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleanedText)

        title = parsed.title || title
        description = parsed.description || description

        title = title.replace(/\w\S*/g, (word) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )

        description = description.charAt(0).toUpperCase() + description.slice(1)

      } catch (err) {
        console.log('Title/description generation failed, using default:', err.message)
      }
    }

    res.json({ code: htmlCode, title, description })

  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ message: 'Error generating website' })
  }
}

module.exports = { generateWebsite }