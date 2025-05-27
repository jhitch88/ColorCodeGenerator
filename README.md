# Word to Hex Color Generator - Farcaster Frame

Transform any word into a unique hex color! This project includes both a web interface and a Farcaster Frame for social media integration.

## 🎨 Features

- **Word-to-Color Generation**: Consistent color mapping using hash functions
- **Multiple Color Formats**: Hex, RGB, and HSL display
- **Color History**: Remember last 12 generated colors
- **Farcaster Frame**: Interactive mini-app for social media
- **Dynamic Image Generation**: Server-side frame images using Jimp

## 🚀 AWS Deployment Options

### Option 1: AWS App Runner (Recommended)

1. **Push to GitHub**: Create a GitHub repository and push your code
2. **Create App Runner Service**:
   - Go to AWS App Runner console
   - Click "Create service"
   - Choose "Source code repository"
   - Connect your GitHub repo
   - Select your repository and branch
3. **Configure Build**:
   - Runtime: Node.js 18
   - Build command: `npm install`
   - Start command: `npm start`
   - Port: `3003` (or use environment variable)
4. **Deploy**: App Runner will automatically build and deploy

### Option 2: AWS Elastic Beanstalk

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize and Deploy**:
   ```bash
   eb init
   eb create word-to-hex-frame
   eb deploy
   ```

### Option 3: AWS Lambda + API Gateway (Serverless)

1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

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
