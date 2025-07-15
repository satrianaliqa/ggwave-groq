import Groq from 'groq-sdk'
import { NextResponse }s from 'next/server'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    const completion = await groq.chat.completions.create({
      // Model super cepat sesuai request lo!
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
    })

    console.log('Groq response:', completion.choices[0].message);

    return NextResponse.json(completion.choices[0].message)
  } catch (error) {
    console.error('Groq API Error:', error)
    return NextResponse.json(
      { error: 'Groq AI Service Unavailable' },
      { status: 503 }
    )
  }
}