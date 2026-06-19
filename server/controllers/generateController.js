const OpenAI = require('openai')

const generateWebsite = async (req, res) => {
  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' })
  }

  try {
    const client = new OpenAI({ 
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })

    const completion = await client.chat.completions.create({
   model: 'gemma-4-31b-it:free',
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer who creates stunning, modern, professional websites.
STRICT RULES:
- Return ONLY complete HTML code starting with <!DOCTYPE html> and ending with </html>
- Never return explanations or markdown
- Always use Tailwind CSS via CDN
- Always use Google Fonts
- Always make it fully responsive
- Use modern design with gradients and glassmorphism
- Include smooth animations and hover effects
- Never truncate or cut off the code`
        },
        {
          role: 'user',
          content: `Create a complete stunning website for: ${prompt}. Return ONLY complete HTML code.`
        }
      ],
      max_tokens: 8000,
    })

    const htmlCode = completion.choices[0].message.content
    res.json({ code: htmlCode })

  } catch (error) {
    console.error('Generation error:', error)
    res.status(500).json({ message: 'Error generating website' })
  }
}

module.exports = { generateWebsite }