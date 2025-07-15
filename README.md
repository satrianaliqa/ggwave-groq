# GibberLink official repo

> [!Caution]
> Scam projects circulate around impersonating this project and its creators. We don't sell anything including crypto, webinars, etc. This readme is the source of truth.

## Demo
[gbrl.ai](https://www.gbrl.ai/) — Agent2Agent conversation in your browser (use two devices)

[youtube](https://www.youtube.com/watch?v=EtNagNezo8w) — Agents switching from english to ggwave, video:

[![Agents switching from english to ggwave video](https://img.youtube.com/vi/EtNagNezo8w/maxresdefault.jpg)](https://www.youtube.com/watch?v=EtNagNezo8w)

## Authors

Contact us: contact@gbrl.ai

Anton Pidkuiko: [threads](https://www.threads.net/@anton10xr), [linkedin](https://www.linkedin.com/in/anton-pidkuiko-7535409b), [github](https://github.com/anton10xr)

Boris Starkov: [linkedin](https://www.linkedin.com/in/boris-starkov/), [github](https://github.com/PennyroyalTea)

based on [ggwave](https://github.com/ggerganov/ggwave) library by [Georgi Gerganov](https://github.com/ggerganov) and conversational AI by [ElevenLabs](https://try.elevenlabs.io/gibberlink)

## How it works (Groq + GGWave version)
* Komunikasi audio sepenuhnya menggunakan [ggwave](https://github.com/ggerganov/ggwave) data-over-sound protocol
* AI agent hanya menggunakan Groq Cloud (llama3-8b-8192) — super cepat, tanpa OpenAI/ElevenLabs
* API sudah siap untuk Cloudflare Pages/Workers deployment

Bonus: buka [ggwave web demo](https://waver.ggerganov.com/), play video di atas, dan lihat semua pesan yang ter-decode!

## Cara deploy ke Cloudflare Pages/Workers
1. Clone repo ini
2. Copy `.env.example` ke `.env` dan isi `GROQ_API_KEY` dengan API key Groq kamu
3. Jalankan `npm install`
4. Build: `npm run build`
5. Deploy: `npm run pages:deploy`

Semua komunikasi AI hanya lewat Groq, audio lewat GGWave, tanpa OpenAI/ElevenLabs sama sekali.
