const pool = require('../database/db');
require('dotenv').config();

async function getTranslateMessageId(chatId, messageId) {
    // return await pool.query(`SELECT * FROM translated_messages WHERE sasha_message_id=${messageId};`);
    // pool.query(`SELECT * FROM translated_messages WHERE sasha_message_id=${messageId};`, (err, res) => {
    //     if(err) {
    //         console.error('Error save message', err.stack);
    //     } else {
    //         console.log(res?.rows[0]?.marvey_message_id);
    //     }
    // })
    if (chatId == process.env.CHAT_SASHA) {
        const res = await pool.query(`SELECT * FROM translated_messages WHERE sasha_message_id=${messageId};`)
        return res.rows[0]?.marvey_message_id;
    } else if (chatId == process.env.CHAT_MARVEY) {
        const res = await pool.query(`SELECT * FROM translated_messages WHERE marvey_message_id=${messageId};`)
        return res.rows[0]?.sasha_message_id;
    }
    //         if(err) {
    //             console.error('Error save message', err.stack);
    //         } else {
    //             console.log(res);
    //         }
    //     })
    // }
}

module.exports.getTranslateMessageId = getTranslateMessageId