const axios = require("axios");
require('dotenv').config();

async function getIamToken() {
    return await axios.post('https://iam.api.cloud.yandex.net/iam/v1/tokens', {
        yandexPassportOauthToken: process.env.YANDEX_OAUTH,
    }).then((response) => {
        const token = response.data.iamToken;
        console.log(token);
        return token;
    }).catch((error) => {
        console.error(error);
        return error.response.data.message;
    })
}

async function getReactiveToken() {
    let token = await getIamToken()
    setInterval(() => {token = getIamToken()}, 3600000)

    return await token
}

module.exports.YANDEX_TOKEN = getReactiveToken();