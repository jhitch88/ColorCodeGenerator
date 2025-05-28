class ColorGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.colorHistory = this.loadHistory();
        this.updateHistoryDisplay();
    }    initializeElements() {
        this.wordInput = document.getElementById('word-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.resultSection = document.getElementById('result-section');
        this.colorPreview = document.getElementById('color-preview');
        this.wordDisplay = document.getElementById('word-display');
        this.colorName = document.getElementById('color-name');
        this.hexCode = document.getElementById('hex-code');
        this.rgbValues = document.getElementById('rgb-values');
        this.hslValues = document.getElementById('hsl-values');
        this.copyHexBtn = document.getElementById('copy-hex-btn');
        this.copyRgbBtn = document.getElementById('copy-rgb-btn');
        this.randomizeBtn = document.getElementById('randomize-btn');
        this.recentColors = document.getElementById('recent-colors');
        this.colorHistoryElement = document.getElementById('color-history');
        this.exampleWords = document.querySelectorAll('.example-word');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.handleGenerate());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleGenerate();
        });
        this.wordInput.addEventListener('input', () => this.handleInputChange());
        
        this.copyHexBtn.addEventListener('click', () => this.copyToClipboard('hex'));
        this.copyRgbBtn.addEventListener('click', () => this.copyToClipboard('rgb'));
        this.randomizeBtn.addEventListener('click', () => this.generateRandom());
        
        this.exampleWords.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const word = e.target.dataset.word;
                this.wordInput.value = word;
                this.handleGenerate();
            });
        });
    }

    handleInputChange() {
        const hasInput = this.wordInput.value.trim().length > 0;
        this.generateBtn.style.opacity = hasInput ? '1' : '0.7';
    }

    handleGenerate() {
        const word = this.wordInput.value.trim();
        if (!word) {
            this.shakeInput();
            return;
        }
        
        this.generateColor(word);
    }

    shakeInput() {
        this.wordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.wordInput.style.animation = '';
        }, 500);
    }    async generateColor(word) {
        const hash = this.hashString(word);
        const color = this.hashToColor(hash);
        const rgb = this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // Show loading state for color name
        this.colorName.textContent = '✨ Generating creative name...';
        this.colorName.className = 'color-name loading';
        
        this.displayColor(word, color, rgb, hsl);
        this.addToHistory(word, color);
        this.showResult();
        
        // Fetch AI-generated color name
        this.fetchColorName(word, color, rgb);
    }

    async fetchColorName(word, hexColor, rgb) {
        try {
            const response = await fetch(`/api/color-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word,
                    hexColor,
                    rgb
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.colorName.textContent = `"${data.colorName}"`;
                this.colorName.className = 'color-name loaded';
            } else {
                // Fallback to local generation
                this.generateFallbackColorName(word, hexColor);
            }
        } catch (error) {
            console.log('AI color name generation failed, using fallback');
            this.generateFallbackColorName(word, hexColor);
        }
    }

    generateFallbackColorName(word, hexColor) {
        const fallbackNames = [
            "Mystic Shade", "Cosmic Hue", "Dream Tint", "Stellar Glow", 
            "Nebula Touch", "Prism Echo", "Velvet Tone", "Aurora Whisper",
            "Crystal Gleam", "Twilight Mist", "Ocean Deep", "Forest Dawn"
        ];
        
        const hash = parseInt(hexColor.substring(1), 16);
        const fallbackName = fallbackNames[hash % fallbackNames.length];
        
        this.colorName.textContent = `"${fallbackName}"`;
        this.colorName.className = 'color-name loaded';
    }

    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash);
    }    hashToColor(hash) {
        const r = (hash & 0xFF0000) >> 16;
        const g = (hash & 0x00FF00) >> 8;
        const b = hash & 0x0000FF;
        
        // Check if this is a muddy brown/dark color that needs enhancement
        const avgRgb = (r + g + b) / 3;
        const isBrownish = (
            (Math.abs(r - g) < 50 && Math.abs(g - b) < 50 && r >= g && g >= b && avgRgb < 100) ||  // Broader brown detection
            (r > g && g > b && Math.abs(r - g) < 40 && Math.abs(g - b) < 30 && avgRgb < 120)     // Classic brown pattern
        );
        
        let finalR = r;
        let finalG = g;
        let finalB = b;
        
        if (isBrownish) {
            // Transform brownish colors to more vibrant alternatives
            if (r >= g && g >= b) {
                // Transform to a blue-purple scheme to avoid brown entirely
                finalR = (b + 100) % 256;
                finalG = (r + 80) % 256;
                finalB = (g + 180) % 256;
            }
        }
        
        // Ensure at least one channel is vibrant
        const maxChannel = Math.max(finalR, finalG, finalB);
        if (maxChannel < 120) {
            if (finalR === maxChannel) finalR = Math.min(255, finalR + 80);
            else if (finalG === maxChannel) finalG = Math.min(255, finalG + 80);
            else finalB = Math.min(255, finalB + 80);
        }
        
        const enhancedR = Math.max(30, Math.min(225, finalR));
        const enhancedG = Math.max(30, Math.min(225, finalG));
        const enhancedB = Math.max(30, Math.min(225, finalB));
        
        return `#${enhancedR.toString(16).padStart(2, '0')}${enhancedG.toString(16).padStart(2, '0')}${enhancedB.toString(16).padStart(2, '0')}`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    displayColor(word, hexColor, rgb, hsl) {
        this.colorPreview.style.backgroundColor = hexColor;
        this.wordDisplay.textContent = word;
        this.hexCode.textContent = hexColor.toUpperCase();
        this.hexCode.style.color = hexColor;
        this.rgbValues.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
        this.hslValues.textContent = `HSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
        
        // Add a subtle pulse animation
        this.colorPreview.style.animation = 'none';
        setTimeout(() => {
            this.colorPreview.style.animation = 'pulse 1s ease-in-out';
        }, 10);
    }

    showResult() {
        this.resultSection.classList.add('show');
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async copyToClipboard(type) {
        let textToCopy;
        let button;
        
        if (type === 'hex') {
            textToCopy = this.hexCode.textContent;
            button = this.copyHexBtn;
        } else if (type === 'rgb') {
            textToCopy = this.rgbValues.textContent;
            button = this.copyRgbBtn;
        }
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.showCopyFeedback(button);
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(textToCopy);
            this.showCopyFeedback(button);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        
        document.body.removeChild(textArea);
    }

    showCopyFeedback(button) {
        button.classList.add('copied');
        setTimeout(() => {
            button.classList.remove('copied');
        }, 1500);
    }    generateRandom() {
        const randomWords = [
            'Cosmic', 'Nebula', 'Aurora', 'Phoenix', 'Mystic', 'Prism', 'Eclipse', 'Stellar',
            'Velvet', 'Crystal', 'Thunder', 'Whisper', 'Ember', 'Frost', 'Sapphire', 'Crimson',
            'Lavender', 'Midnight', 'Golden', 'Silver', 'Copper', 'Jade', 'Ivory', 'Onyx',
            'Azure', 'Coral', 'Indigo', 'Turquoise', 'Magenta', 'Violet', 'Lime', 'Teal',
            'Ruby', 'Emerald', 'Amber', 'Pearl', 'Opal', 'Quartz', 'Neon', 'Electric',
            'Vibrant', 'Radiant', 'Luminous', 'Brilliant', 'Dazzling', 'Gleaming'
        ];
        
        const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
        this.wordInput.value = randomWord;
        this.generateColor(randomWord);
    }

    addToHistory(word, color) {
        // Avoid duplicates
        this.colorHistory = this.colorHistory.filter(item => item.word !== word);
        
        // Add to beginning
        this.colorHistory.unshift({ word, color, timestamp: Date.now() });
        
        // Keep only last 12 items
        if (this.colorHistory.length > 12) {
            this.colorHistory = this.colorHistory.slice(0, 12);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }    updateHistoryDisplay() {
        if (this.colorHistory.length === 0) {
            this.recentColors.classList.remove('show');
            return;
        }
        
        this.recentColors.classList.add('show');
        this.colorHistoryElement.innerHTML = '';
        
        this.colorHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-color" style="background-color: ${item.color}"></div>
                <div class="history-word">${item.word}</div>
                <div class="history-hex">${item.color}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.wordInput.value = item.word;
                this.generateColor(item.word);
            });
            
            this.colorHistoryElement.appendChild(historyItem);
        });
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('colorGeneratorHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (err) {
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('colorGeneratorHistory', JSON.stringify(this.colorHistory));
        } catch (err) {
            console.error('Failed to save history:', err);
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorGenerator();
});
