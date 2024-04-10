import dotenv from 'dotenv';

dotenv.config();

const botUserID = process.env.BOT_USERID;
if (botUserID === undefined) {
  throw new Error('The BOT_USERID environment variable is required.');
}

export default { botUserID };
