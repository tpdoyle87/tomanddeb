const sharp = require('sharp');
const fs = require('fs');

async function testWebPConversion() {
  try {
    // Create a test image
    console.log('Creating test JPEG image...');
    const testImage = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
    .jpeg({ quality: 90 })
    .toBuffer();
    
    fs.writeFileSync('/tmp/test-original.jpg', testImage);
    console.log('✓ Created original JPEG: /tmp/test-original.jpg');
    console.log('  Size:', testImage.length, 'bytes');
    
    // Convert to WebP
    console.log('\nConverting to WebP...');
    const webpImage = await sharp(testImage)
      .webp({ quality: 85 })
      .toBuffer();
    
    fs.writeFileSync('/tmp/test-converted.webp', webpImage);
    console.log('✓ Created WebP version: /tmp/test-converted.webp');
    console.log('  Size:', webpImage.length, 'bytes');
    
    const reduction = Math.round((1 - webpImage.length / testImage.length) * 100);
    console.log('  Size reduction:', reduction + '%');
    
    console.log('\n✅ WebP conversion test successful!');
    console.log('This confirms Sharp is working properly for WebP conversion.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWebPConversion();
