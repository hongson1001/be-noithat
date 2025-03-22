import * as dotenv from 'dotenv';

import axios from 'axios';

dotenv.config();

const apiBotUrl =
  process.env.LOGS_API_ADDRESS +
  '/' +
  process.env.LOGS_API_BOT +
  '/sendMessage';
const chatId = '-' + process.env.LOGS_API_CHAT_ID;

export const sendLogsTelegram = async (message: string): Promise<void> => {
  try {
    await axios.post(apiBotUrl, {
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error('Không thử gửi log: ', error);
  }
};
