# Word to Hex Color Generator - Farcaster Frame

Transform any word into a unique hex color! This project includes both a web interface and a Farcaster Frame for social media integration.

## 🎨 Features

- **Word-to-Color Generation**: Consistent color mapping using hash functions
- **AI-Generated Color Names**: Creative color names powered by Gemini AI
- **Multiple Color Formats**: Hex, RGB, and HSL display
- **Color History**: Remember last 12 generated colors
- **Farcaster Frame**: Interactive mini-app for social media
- **Dynamic Image Generation**: Server-side frame images using Jimp
- **Copy to Clipboard**: Easy color code copying
- **Responsive Design**: Works on desktop and mobile

### Post-Deployment Steps

1. **Update Frame URLs**: Replace `localhost:3003` with your deployed URL in any hardcoded references
2. **Test Frame**: Share your deployment URL in a Farcaster client like Warpcast
3. **Monitor**: Check AWS CloudWatch logs for any issues

## 📱 Using the Farcaster Frame

1. **Share the URL**: Post your deployed frame URL in a Farcaster cast
2. **Interact**: Users can:
   - Type words in the input field
   - Click "Generate Color" to see the hex color
   - Use "Random" for surprise colors
   - Copy hex codes with "Copy Hex" button
   - Generate new words with "New Word"

2. **Create serverless.yml** (requires code restructuring)

## 📋 Deployment Checklist

- [X] Push code to GitHub repository
- [X] Set up AWS account and credentials
- [X] Choose deployment method
- [X] Configure environment variables if needed
- [X] Update frame URLs after deployment
- [ ] Test in Farcaster client

## 📱 Farcaster Frame Testing URL

**Frame URL for Farcaster**: `https://jnwh37f4xf.us-east-2.awsapprunner.com/`

**Frame Preview URL (for testing in browser)**: `https://jnwh37f4xf.us-east-2.awsapprunner.com/frame.html`

To test your Frame:
1. **For Farcaster clients**: Copy the main URL and paste it in a Warpcast cast
2. **For browser preview**: Use the `/frame.html` URL to see the fallback view
3. Create a new cast in Warpcast or your preferred Farcaster client
4. Paste the main URL in your cast
5. Publish the cast and interact with the Frame buttons

## 🔧 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open `http://localhost:3003` in your browser

## 📱 Farcaster Frame Testing

After deployment, test your frame by:
1. Copying your deployed URL
2. Creating a cast in Farcaster with the URL
3. Interacting with the frame buttons

## 🌐 Environment Variables

- `PORT`: Server port (default: 3003)
- `NODE_ENV`: Environment (development/production)

## 📦 Dependencies

- **express**: Web server framework
- **jimp**: Image processing for frame generation
- **sharp**: High-performance image processing (optional)

## 🎯 Frame Features

- **Generate Color**: Create color from input word
- **Random**: Generate random color combinations
- **Copy Hex**: Display hex code prominently
- **New Word**: Reset for new input

## 🔗 Project Structure

```
ColorCodeGenerator/
├── server.js          # Main server file
├── index.html         # Web app interface
├── frame.html         # Static frame fallback
├── style.css          # Web app styles
├── frame-style.css    # Frame styles
├── script.js          # Client-side logic
├── package.json       # Dependencies
└── apprunner.yaml     # AWS App Runner config
```
