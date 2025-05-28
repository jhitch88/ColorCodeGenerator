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

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd ColorCodeGenerator
   npm install
   ```

2. **Set up environment variables** (optional for AI color names):
   ```bash
   cp .env.example .env
   # Edit .env file and add your Gemini API key
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   - Web interface: `http://localhost:3003/index.html`
   - Farcaster Frame: `http://localhost:3003`

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env` file as `GEMINI_API_KEY=your_api_key_here`

## 🚀 AWS Deployment Options

### Option 1: AWS App Runner (Recommended)

AWS App Runner is the easiest way to deploy this application with automatic scaling and HTTPS.

1. **Prepare your repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create App Runner Service**:
   - Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
   - Click "Create service"
   - Choose "Source code repository"
   - Connect your GitHub account and select your repository
   - Choose branch: `main`

3. **Configure Build Settings**:
   - Runtime: `Node.js 18`
   - Build command: `npm install`
   - Start command: `npm start`
   - Port: `3003`

4. **Environment Variables** (optional):
   - Add `GEMINI_API_KEY` for AI color names
   - Add `PORT=3003` if needed

5. **Deploy**: App Runner will build and deploy automatically

### Option 2: AWS Elastic Beanstalk

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize and Deploy**:
   ```bash
   eb init word-to-hex-generator --platform node.js --region us-east-1
   eb create word-to-hex-frame
   eb setenv GEMINI_API_KEY=your_api_key_here
   eb deploy
   ```

### Option 3: AWS Lambda + API Gateway

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   npm install serverless-http
   ```

2. **Create serverless.yml**:
   ```yaml
   service: word-to-hex-frame
   provider:
     name: aws
     runtime: nodejs18.x
     environment:
       GEMINI_API_KEY: ${env:GEMINI_API_KEY}
   functions:
     app:
       handler: lambda.handler
       events:
         - http: ANY /
         - http: 'ANY /{proxy+}'
   ```

3. **Create lambda.js wrapper**:
   ```javascript
   const serverless = require('serverless-http');
   const app = require('./server');
   module.exports.handler = serverless(app);
   ```

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

- [ ] Push code to GitHub repository
- [ ] Set up AWS account and credentials
- [ ] Choose deployment method
- [ ] Configure environment variables if needed
- [ ] Update frame URLs after deployment
- [ ] Test in Farcaster client (Warpcast)

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
2. Creating a cast in Warpcast with the URL
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
