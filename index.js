const TgBot = require('./classes/tgBot')
const axios = require("axios");
const {YANDEX_TOKEN} = require('./utils/getIamToken')
const { getTranslateMessageId } = require('./utils/getMessageId')
const pool = require('./database/db');

require('dotenv').config();

const commands = [
    {
        command: "start",
        description: "Get chat ID"
    },
]

const bot = new TgBot(process.env.API_KEY_BOT, {

    polling: true

});

bot.setMyCommands(commands).then((result) => console.log(result));

pool.query('SELECT NOW()', (err, res) => {
    if(err) {
        console.error('Error connecting to the database', err.stack);
    } else {
        console.log('Connected to the database:');
    }
});

// bot.on("polling_error", err => console.log(err.data.error.message));

bot.on('text', async msg => {
    try {

        if(msg.text === '/start') {

            console.log(msg.chat.id);
            // pool.query(`INSERT INTO public.translated_messages(sasha_message_id, marvey_message_id) VALUES (4, 2);`, (err, res) => {
            //     if(err) {
            //         console.error('Error connecting to the database', err.stack);
            //     } else {
            //         // console.log('Connected to the database:', res);
            //     }
            // })
            await bot.sendMessage(msg.chat.id, `ID of chat: ${msg.chat.id}`);

        }
        else {

            if (msg.chat.id == process.env.CHAT_SASHA) {
                console.log('Sasha wrote')
                await bot.sendChatAction(process.env.CHAT_MARVEY, 'typing')
                axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', {
                    "folderId": process.env.YANDEX_CATALOG,
                    "texts": [msg.text],
                    "targetLanguageCode": "en"
                }, {
                    headers: {
                        ContentType: `application/json`,
                        Authorization: `Bearer ${await YANDEX_TOKEN}`
                    }
                })
                    .then(async (response) => {
                        await bot.sendPgMessage(msg, process.env.CHAT_MARVEY, response.data.translations[0].text, {
                            reply_to_message_id: msg?.reply_to_message?.message_id ? await getTranslateMessageId(msg.chat.id, msg?.reply_to_message?.message_id) : null
                        })
                        // await bot.sendMessage(process.env.CHAT_MARVEY, msg.message_id + ' ' + await getTranslateMessageId(msg.chat.id, msg.message_id))
                        // console.log(await getTranslateMessageId(process.env.CHAT_SASHA, msg?.reply_to_message?.message_id))
                        // if (msg?.reply_to_message?.message_id)
                        //     console.log(await getTranslateMessageId(process.env.CHAT_SASHA, msg?.reply_to_message?.message_id))
                    })
                    .catch(async (error) => {
                        console.log(error)
                        await bot.sendMessage(process.env.CHAT_SASHA, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                        await bot.sendMessage(process.env.CHAT_MARVEY, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                    });
            }
            else if(msg.chat.id == process.env.CHAT_MARVEY) {
                console.log('Marvey wrote')
                await bot.sendChatAction(process.env.CHAT_SASHA, 'typing')
                axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', {
                    "folderId": process.env.YANDEX_CATALOG,
                    "texts": [msg.text],
                    "targetLanguageCode": "ru"
                }, {
                    headers: {
                        ContentType: `application/json`,
                        Authorization: `Bearer ${await YANDEX_TOKEN}`
                    }
                })
                    .then(async (response) => {
                        await bot.sendPgMessage(msg, process.env.CHAT_SASHA, response.data.translations[0].text, {
                            reply_to_message_id: msg?.reply_to_message?.message_id ? await getTranslateMessageId(msg.chat.id, msg?.reply_to_message?.message_id) : null
                        })
                    })
                    .catch(async (error) => {
                        console.log(error)
                        await bot.sendMessage(process.env.CHAT_SASHA, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                        await bot.sendMessage(process.env.CHAT_MARVEY, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                    });
            }
            else {
                bot.sendMessage(msg.chat.id, `How did you get here? You don't belong here.`)
            }

            // await bot.sendMessage(msg.chat.id, `Chat ID: ${msg.chat.id}\n\n Message ID: ${msg.message_id} \n\n Reply ID: ${msg?.reply_to_message?.message_id}`)
        }
    }
    catch(error) {

        console.log(error);

    }
})

bot.on('sticker', async sticker => {
    if (sticker.chat.id == process.env.CHAT_SASHA) {
        await bot.sendPgAnimation(sticker, process.env.CHAT_MARVEY, sticker.sticker.file_id, {
            reply_to_message_id: sticker?.reply_to_message?.message_id ? await getTranslateMessageId(sticker.chat.id, sticker?.reply_to_message?.message_id) : null
        })
    }
    else if (sticker.chat.id == process.env.CHAT_MARVEY) {
        await bot.sendPgAnimation(sticker, process.env.CHAT_SASHA, sticker.sticker.file_id, {
            reply_to_message_id: sticker?.reply_to_message?.message_id ? await getTranslateMessageId(sticker.chat.id, sticker?.reply_to_message?.message_id) : null
        })
    }
})