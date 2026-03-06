import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pngPath = join(__dirname, '..', 'public', 'icon.png')

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
  <defs>
    <linearGradient id="wrenchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <path fill="url(#wrenchGradient)" d="M58.5 14.5c-1.5-1.5-4-1.5-5.5 0L42.5 25l-3.5-3.5 10.5-10.5c1.5-1.5 1.5-4 0-5.5-3-3-7.5-4.5-12-3.5-4.5 1-8 4-9.5 8.5-1.5 4.5-0.5 9 2 12.5L6.5 46.5c-3 3-3 8 0 11s8 3 11 0l20-23.5c3.5 2.5 8 3.5 12.5 2 4.5-1.5 7.5-5 8.5-9.5 1-4.5-0.5-9-3.5-12zM13 52c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z"/>
  <path fill="#fff" opacity="0.3" d="M13 52c-1.5 1.5-4 1.5-5.5 0s-1.5-4 0-5.5 4-1.5 5.5 0 1.5 4 0 5.5z"/>
</svg>`

async function convertSvgToPng() {
  try {
    await sharp(Buffer.from(svgContent))
      .resize(256, 256)
      .png()
      .toFile(pngPath)
    console.log('PNG icon created successfully:', pngPath)
  } catch (error) {
    console.error('Error creating PNG:', error)
  }
}

convertSvgToPng()
