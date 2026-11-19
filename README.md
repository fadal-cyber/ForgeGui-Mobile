# ForgeGui Online AI (Mobile)

## Features
- Claude AI generates Roblox Luau scripts.
- Online image AI generates Roblox-inspired 3D icons and thumbnails.
- Phone-friendly website with PNG download.
- No in-app credit counter.

## Phone-only setup
You can set this up from Android Chrome using a browser-based Node.js hosting service:
1. Create a Node.js project on your chosen host.
2. Upload the files in this ZIP.
3. Add `ANTHROPIC_API_KEY` as a private server secret for Claude.
4. Add `OPENAI_API_KEY` as a separate private server secret for image generation.
5. Optionally set `CLAUDE_MODEL` and `OPENAI_IMAGE_MODEL` to model IDs available to your accounts.
6. Run `npm install`, then `npm start`.
7. Open the hosted website on your phone.

## Costs and keys
There is no ForgeGui in-app credit system. Online Claude and image generation requests use the respective provider APIs and may be billed by those providers. No website can promise unlimited paid API generation for free. Keep both keys private on the server; never put them in browser code or Roblox scripts.

## Notes
The default image model is `gpt-image-2.5-flare`. Change it with the private `OPENAI_IMAGE_MODEL` environment variable if needed. Current official image API documentation: https://developers.openai.com/api/docs/guides/image-generation
