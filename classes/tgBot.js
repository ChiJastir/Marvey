const TelegramBot = require('node-telegram-bot-api');
const pool = require('../database/db');
require('dotenv').config();

function WhoIsWho(chatId, sendMessageId, newMessageId) {
    const messageIds = {
        sasha: null,
        marvey: null,
    }

    if(chatId == process.env.CHAT_SASHA){
        messageIds.sasha = sendMessageId
        messageIds.marvey = newMessageId
    } else if (chatId == process.env.CHAT_MARVEY) {
        messageIds.marvey = sendMessageId
        messageIds.sasha = newMessageId
    }

    return messageIds;
}

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

        const { sasha, marvey } = WhoIsWho(message.chat.id, message.message_id, newMessage.message_id);

        await DbMessageSave(sasha, marvey)

        return newMessage
    }

    async sendPgAnimation(sticker, chatId, stickerId, form = {}){
        const newMessage = await super.sendAnimation(chatId, stickerId, form)

        const { sasha, marvey } = WhoIsWho(sticker.chat.id, sticker.message_id, newMessage.message_id);

        await DbMessageSave(sasha, marvey)

        return newMessage
    }
}

module.exports = TgBot;