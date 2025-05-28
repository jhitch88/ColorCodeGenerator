const assert = require('assert');

// Test color generation functions
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

// Run tests
console.log('🧪 Running Color Generator Tests...');

// Test 1: Consistent color generation
const word1 = 'test';
const hash1a = hashString(word1);
const hash1b = hashString(word1);
assert.strictEqual(hash1a, hash1b, 'Hash should be consistent for same word');

const color1a = hashToColor(hash1a);
const color1b = hashToColor(hash1b);
assert.strictEqual(color1a, color1b, 'Color should be consistent for same word');

console.log('✅ Test 1 passed: Consistent color generation');

// Test 2: Different words produce different colors (most of the time)
const word2 = 'hello';
const color2 = hashToColor(hashString(word2));
assert.notStrictEqual(color1a, color2, 'Different words should usually produce different colors');

console.log('✅ Test 2 passed: Different words produce different colors');

// Test 3: Valid hex color format
const hexPattern = /^#[0-9a-f]{6}$/i;
assert.ok(hexPattern.test(color1a), 'Should produce valid hex color format');
assert.ok(hexPattern.test(color2), 'Should produce valid hex color format');

console.log('✅ Test 3 passed: Valid hex color format');

// Test 4: Color values within enhanced range
const rgb = {
    r: parseInt(color1a.substring(1, 3), 16),
    g: parseInt(color1a.substring(3, 5), 16),
    b: parseInt(color1a.substring(5, 7), 16)
};

assert.ok(rgb.r >= 30 && rgb.r <= 225, 'Red value should be in enhanced range');
assert.ok(rgb.g >= 30 && rgb.g <= 225, 'Green value should be in enhanced range');
assert.ok(rgb.b >= 30 && rgb.b <= 225, 'Blue value should be in enhanced range');

console.log('✅ Test 4 passed: Color values within enhanced range');

// Test 5: Test with various inputs
const testWords = ['Farcaster', 'hello', 'world', '123', 'special!@#', ''];
testWords.forEach(word => {
    const hash = hashString(word);
    const color = hashToColor(hash);
    assert.ok(hexPattern.test(color), `Should produce valid hex for "${word}"`);
});

console.log('✅ Test 5 passed: Various input types work correctly');

console.log('\n🎉 All tests passed! Color generator is working correctly.');
console.log('\nExample colors:');
testWords.forEach(word => {
    if (word !== '') {
        const color = hashToColor(hashString(word));
        console.log(`  "${word}" → ${color}`);
    }
});
