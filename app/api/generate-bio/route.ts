import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Extracting the twitter handle from the request body
    const { twitter } = await req.json();

    // AI-generated bio templates in English
    const bios = [
      `Exploring Neura Network and AI enthusiast. The future is decentralized! 🚀`,
      `Bringing @${twitter} to Web3. Creating intelligent connections. 🧠`,
      `Tech lover and Neura fan. Minting my SoulCard now! 💎`,
      `Merging Artificial Intelligence with Blockchain security on Neura. 🌐`,
      `Digital identity verified. Proud member of the Neura ecosystem. ✨`,
      `The intersection of AI and Web3 starts here. Check my @${twitter} SoulCard! 🤖`,
      `Building a smarter decentralized world on Neura Network. ⚡`
    ];
    
    // Selects a random bio from the list above
    const randomBio = bios[Math.floor(Math.random() * bios.length)];

    // Simulate a small delay to mimic AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ bio: randomBio });

  } catch (error) {
    // Error handling in English
    return NextResponse.json(
      { error: "Failed to generate AI bio. Please try again." }, 
      { status: 500 }
    );
  }
}