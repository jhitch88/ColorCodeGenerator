const express = require('express');
const Jimp = require('jimp');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.gemini_API;

// Helper function to get base URL
function getBaseUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}`;
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Color generation functions (same as client-side)
function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash);
}

function hashToColor(hash) {
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    
    const enhancedR = Math.max(30, Math.min(225, r));
    const enhancedG = Math.max(30, Math.min(225, g));
    const enhancedB = Math.max(30, Math.min(225, b));
    
    return `#${enhancedR.toString(16).padStart(2, '0')}${enhancedG.toString(16).padStart(2, '0')}${enhancedB.toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Generate frame image
async function generateFrameImage(word, hexColor, rgb, colorName = null) {
    const width = 1200;
    const height = 630;
    
    // Create a new image with Jimp
    const image = new Jimp(width, height, '#667eea');
    
    // Load font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const fontMedium = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    
    // Create gradient background
    for (let y = 0; y < height; y++) {
        const ratio = y / height;
        const r = Math.round(102 + (118 - 102) * ratio); // 667eea to 764ba2
        const g = Math.round(126 + (75 - 126) * ratio);
        const b = Math.round(234 + (162 - 234) * ratio);
        const color = Jimp.rgbaToInt(r, g, b, 255);
        
        for (let x = 0; x < width; x++) {
            image.setPixelColor(color, x, y);
        }
    }
    
    // Add semi-transparent white overlay for content area
    const overlay = new Jimp(1080, 510, 0xFFFFFFE6); // white with transparency
    image.composite(overlay, 60, 60);
    
    // Add title
    image.print(fontMedium, 0, 100, {
        text: '🎨 Word to Hex Generator',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
    }, width);
    
    // Add word
    image.print(fontMedium, 0, 160, {
        text: `"${word}"`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
    }, width);
    
    // Create color circle
    const colorRgb = hexToRgb(hexColor);
    const colorInt = Jimp.rgbaToInt(colorRgb.r, colorRgb.g, colorRgb.b, 255);
    const circleRadius = 60;
    const centerX = 350;
    const centerY = 350;
    
    // Draw color circle
    for (let y = centerY - circleRadius; y <= centerY + circleRadius; y++) {
        for (let x = centerX - circleRadius; x <= centerX + circleRadius; x++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= circleRadius) {
                image.setPixelColor(colorInt, x, y);
            }
        }
    }
    
    // Add hex code text
    image.print(fontMedium, 480, 300, hexColor.toUpperCase());
    
    // Add AI-generated color name if available
    if (colorName) {
        image.print(fontSmall, 480, 340, `"${colorName}"`);
    }
    
    // Add RGB text
    image.print(fontSmall, 480, 370, `RGB: ${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}`);
    
    // Add instructions
    image.print(fontSmall, 0, 480, {
        text: 'Enter a word below and click "Generate Color"',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
    }, width);
    
    return await image.getBufferAsync(Jimp.MIME_PNG);
}

// Gemini API function
async function callGeminiAPI(prompt) {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not found, using fallback color names');
        return null;
    }

    const modelId = "gemini-2.0-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;

    const requestData = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "text/plain",
            maxOutputTokens: 50,
            temperature: 0.9
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();

        if (responseData.candidates &&
            responseData.candidates[0] &&
            responseData.candidates[0].content &&
            responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts[0]) {
            return responseData.candidates[0].content.parts[0].text.trim();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
}

// Generate a creative color name using Gemini AI
async function generateColorName(hexColor, inputWord, rgb) {
    const prompt = `Given this hex color ${hexColor} (RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}) that was generated from the word "${inputWord}", create a single creative and poetic color name (1-2 words max). The name should capture the essence of both the color and the original word. Examples: "Midnight Ocean", "Coral Whisper", "Forest Echo". Only return the color name, nothing else.`;
    
    const aiColorName = await callGeminiAPI(prompt);
    
    if (aiColorName) {
        // Clean up the response (remove quotes, extra whitespace, etc.)
        return aiColorName.replace(/['"]/g, '').trim();
    }
    
    // Fallback color names if AI fails
    const fallbackNames = [
        "Mystic Shade", "Cosmic Hue", "Dream Tint", "Stellar Glow", 
        "Nebula Touch", "Prism Echo", "Velvet Tone", "Aurora Whisper",
        "Crystal Gleam", "Twilight Mist", "Ocean Deep", "Forest Dawn"
    ];
    
    const hash = parseInt(hexColor.substring(1), 16);
    return fallbackNames[hash % fallbackNames.length];
}

// Routes
app.get('/', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const defaultWord = 'Farcaster';
    
    const frameHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Word to Hex Color Generator - Farcaster Frame</title>
    
    <!-- Farcaster Frame Meta Tags -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${baseUrl}/api/frame-image/${defaultWord}" />
    <meta property="fc:frame:button:1" content="🎨 Generate Color" />
    <meta property="fc:frame:button:2" content="🎲 Random" />
    <meta property="fc:frame:button:3" content="📋 Copy Hex" />
    <meta property="fc:frame:button:4" content="🔄 New Word" />
    <meta property="fc:frame:input:text" content="Enter a word or name..." />
    <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Word to Hex Color Generator" />
    <meta property="og:description" content="Transform any word into a unique hex color!" />
    <meta property="og:image" content="${baseUrl}/api/frame-image/${defaultWord}" />
    
    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Word to Hex Color Generator" />
    <meta name="twitter:description" content="Transform any word into a unique hex color!" />
    <meta property="twitter:image" content="${baseUrl}/api/frame-image/${defaultWord}" />
    
    <link rel="stylesheet" href="frame-style.css">
</head>
<body>
    <!-- This is the fallback view for when the frame is viewed in a browser -->
    <div class="frame-container">
        <h1>🎨 Word to Hex Generator</h1>
        <p>This is a Farcaster Frame! View it in a Farcaster client to interact with it.</p>
        
        <div class="preview-section">
            <h2>How it works in Farcaster:</h2>
            <ol>
                <li>Type a word or name in the input field</li>
                <li>Click "Generate Color" to see your unique hex color</li>
                <li>Use "Random" for surprise colors</li>
                <li>Copy the hex code to use in your projects</li>
            </ol>
        </div>
        
        <div class="demo-section">
            <h3>Try the web version:</h3>
            <a href="index.html" class="demo-link">Open Full App</a>
        </div>
        
        <div class="farcaster-info">
            <h3>About Farcaster Frames</h3>
            <p>Farcaster Frames are interactive mini-apps that work directly in Farcaster clients like Warpcast. Share this URL in a Farcaster cast to let others interact with the color generator!</p>
        </div>
    </div>
</body>
</html>`;
    
    res.send(frameHtml);
});

app.get('/api/frame-image/:word?', async (req, res) => {
    try {
        const word = req.params.word || 'Farcaster';
        const hash = hashString(word);
        const hexColor = hashToColor(hash);
        const rgb = hexToRgb(hexColor);
        
        // Generate AI color name
        const colorName = await generateColorName(hexColor, word, rgb);
        
        const imageBuffer = await generateFrameImage(word, hexColor, rgb, colorName);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).send('Error generating image');
    }
});

// API endpoint for color name generation
app.post('/api/color-name', async (req, res) => {
    try {
        const { word } = req.body;
        
        if (!word) {
            return res.status(400).json({ error: 'Word is required' });
        }
        
        const hash = hashString(word);
        const hexColor = hashToColor(hash);
        const rgb = hexToRgb(hexColor);
        
        // Generate AI color name
        const colorName = await generateColorName(hexColor, word, rgb);
        
        res.json({ 
            success: true, 
            colorName: colorName,
            word: word,
            hexColor: hexColor,
            rgb: rgb
        });
        
    } catch (error) {
        console.error('Error generating color name:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate color name' 
        });
    }
});

app.post('/api/frame', async (req, res) => {
    try {
        const { untrustedData } = req.body;
        const buttonIndex = untrustedData?.buttonIndex;
        const inputText = untrustedData?.inputText || '';
        const castId = untrustedData?.castId;
        
        let word = inputText.trim() || 'Farcaster';
        let action = 'generate';
        
        // Handle button clicks
        switch (buttonIndex) {
            case 1: // Generate Color
                action = 'generate';
                break;
            case 2: // Random
                const randomWords = [
                    'Cosmic', 'Nebula', 'Aurora', 'Phoenix', 'Mystic', 'Prism', 'Eclipse', 'Stellar',
                    'Velvet', 'Crystal', 'Thunder', 'Whisper', 'Ember', 'Frost', 'Sapphire', 'Crimson',
                    'Lavender', 'Midnight', 'Golden', 'Silver', 'Copper', 'Jade', 'Ivory', 'Onyx'
                ];
                word = randomWords[Math.floor(Math.random() * randomWords.length)];
                action = 'random';
                break;
            case 3: // Copy Hex (show hex code prominently)
                action = 'copy';
                break;
            case 4: // New Word
                action = 'new';
                break;
        }
          const hash = hashString(word);
        const hexColor = hashToColor(hash);
        const rgb = hexToRgb(hexColor);
        
        // Generate the frame image URL
        const baseUrl = getBaseUrl(req);
        const imageUrl = `${baseUrl}/api/frame-image/${encodeURIComponent(word)}`;
        
        // Return the frame response
        const frameHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="fc:frame:button:1" content="🎨 Generate" />
            <meta property="fc:frame:button:2" content="🎲 Random" />
            <meta property="fc:frame:button:3" content="📋 ${hexColor}" />
            <meta property="fc:frame:button:4" content="🔄 New Word" />
            <meta property="fc:frame:input:text" content="Enter a word or name..." />
            <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
            
            <meta property="og:title" content="Word to Hex: ${word} = ${hexColor}" />
            <meta property="og:description" content="RGB: ${rgb.r}, ${rgb.g}, ${rgb.b} | Transform any word into a unique hex color!" />
            <meta property="og:image" content="${imageUrl}" />
        </head>
        <body>
            <p>Word: ${word}</p>
            <p>Hex: ${hexColor}</p>
            <p>RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}</p>
        </body>
        </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.send(frameHtml);
        
    } catch (error) {
        console.error('Frame error:', error);
        res.status(500).send('Error processing frame');
    }
});

app.listen(PORT, () => {
    console.log(`🎨 Word to Hex Farcaster Frame running on port ${PORT}`);
    console.log(`📱 Frame URL: http://localhost:${PORT}`);
    console.log(`🖼️  Test image: http://localhost:${PORT}/api/frame-image/test`);
});
