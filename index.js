const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
const {YANDEX_TOKEN} = require('./units/getIamToken')

require('dotenv').config();

const commands = [
    {
        command: "start",
        description: "Get chat ID"
    },
]

const bot = new TelegramBot(process.env.API_KEY_BOT, {

    polling: true

});

bot.setMyCommands(commands).then((result) => console.log(result));

// bot.on("polling_error", err => console.log(err.data.error.message));

// bot.on("typing", message => console.log(message));

bot.on('text', async msg => {
    try {

        if(msg.text === '/start') {

            console.log(msg.chat.id);
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
                        await bot.sendMessage(process.env.CHAT_MARVEY, response.data.translations[0].text, {
                            reply_to_message_id: msg?.reply_to_message?.message_id
                        })
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
                        await bot.sendMessage(process.env.CHAT_SASHA, response.data.translations[0].text, {
                            reply_to_message_id: msg?.reply_to_message?.message_id
                        })
                    })
                    .catch(async (error) => {
                        console.log(error)
                        await bot.sendMessage(process.env.CHAT_SASHA, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                        await bot.sendMessage(process.env.CHAT_MARVEY, `Sorry, my mistake: \n\n${error?.response?.body?.description ?? error?.response?.data?.message}`)
                    });
            }

            // await bot.sendMessage(msg.chat.id, `Chat ID: ${msg.chat.id}\n\n Message ID: ${msg.message_id} \n\n Reply ID: ${msg?.reply_to_message?.message_id}`)
        }
    }
    catch(error) {

        console.log(error);

    }
})