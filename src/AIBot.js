import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contextFilePath = path.join(__dirname, './context/ChikaChino.txt');
const context = fs.readFileSync(contextFilePath, 'utf-8');

const groq = new Groq({
  apiKey: process.env.GROQ_ACCESS_TOKEN,
});

const getAnswerFromGroq = async (question) => {
  try {
    const params = {
      messages: [
        { role: 'system', content: `You are a helpful assistant. Here is the restaurant's details: ${context}, if you dont find the answer in the provided context, please provide the phone number from the context file to call or message directly` },
        { role: 'user', content: question },
      ],
      model: 'llama3-8b-8192',
    };

    const chatCompletion = await groq.chat.completions.create(params);
    const answer = chatCompletion.choices[0].message.content;

    return answer;
  } catch (error) {
    console.error('Error getting answer from Groq:', error);
    return 'Sorry, I could not process your request at the moment.';
  }
}

export default getAnswerFromGroq;