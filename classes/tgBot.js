const TelegramBot = require('node-telegram-bot-api');
const pool = require('../database/db');
const { getTranslateMessageId } = require('../utils/getMessageId')
require('dotenv').config();

async function DbMessageSave (sasha_message_id, marvey_message_id) {
    await pool.query(`INSERT INTO public.translated_messages(sasha_message_id, marvey_message_id) VALUES (${sasha_message_id}, ${marvey_message_id});`, (err, res) => {
        if(err) {
            console.error('Error save message', err.stack);
        } else {
            console.log('Save message success');
        }
    })
}

class TgBot extends TelegramBot{
    async sendPgMessage(message, chatId, text, form = {}){
        const newMessage = await super.sendMessage(chatId, text, form)

        const messageIds = {
            sasha: null,
            marvey: null,
        }
        if(message.chat.id == process.env.CHAT_SASHA){
            messageIds.sasha = message.message_id
            messageIds.marvey = newMessage.message_id
        } else if (message.chat.id == process.env.CHAT_MARVEY) {
            messageIds.marvey = message.message_id
            messageIds.sasha = newMessage.message_id
        }

        await DbMessageSave(messageIds.sasha, messageIds.marvey)

        // console.log(getTranslateMessageId(message.chat.id, ))

        return newMessage
    }
}

module.exports = TgBot;