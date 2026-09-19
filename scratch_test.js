const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envPath = path.join(__dirname, '.env');
const envText = fs.readFileSync(envPath, 'utf8');

let key = '';
let modelName = 'gemini-1.5-flash';

envText.split('\n').forEach(line => {
  if (line.startsWith('GEMINI_API_KEY=')) {
    key = line.split('=')[1].replace(/["']/g, '').trim();
  }
  if (line.startsWith('GEMINI_MODEL=')) {
    modelName = line.split('=')[1].replace(/["']/g, '').trim();
  }
});

console.log('Testing with Key:', key ? key.slice(0, 10) + '...' : 'EMPTY');
console.log('Testing with Model:', modelName);

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello in 5 words.');
    console.log('GEMINI RESPONSE:', result.response.text());
  } catch (err) {
    console.error('GEMINI ERROR FULL:', err);
  }
}

test();
