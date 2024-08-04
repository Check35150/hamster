const config = { auto_playground_games: true };
const authorization = "d28721be-fd2d-4b45-869e-9f253b554e5";
const logElement = document.getElementById('log');
let receiveKeysToday = 0;
const maxKeys = 2;
const collectedKeys = [];

function log(message) {
    logElement.innerHTML += `<p>${message}</p>`;
    logElement.scrollTop = logElement.scrollHeight;
}

async function httpRequest(url, headers, method, payload = null) {
    try {
        const options = {
            method: method,
            headers: headers,
            body: payload ? JSON.stringify(payload) : null
        };
        const response = await fetch(url, options);
        if (!response.ok) {
            log(`Ждем ключ`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        log(`HTTP request failed: ${error}`);
        return null;
    }
}

async function startPlaygroundGame() {
    const promo = "43e35910-c168-4634-ad4f-52fd764a843f";
    log(` Запускаем Bike Ride 3D in Hamster `);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const promoCode = await getPlayGroundBikeRideKey(promo);
    if (promoCode) {
        log(`Получен ключ: ${promoCode}`);
        return promoCode;
    }
    return null;
}

async function getPlayGroundBikeRideKey(promoID) {
    const appToken = "d28721be-fd2d-4b45-869e-9f253b554e50";
    const clientId = `${Date.now()}-${Array(19).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`;

    log(`Получаем ключ...`);
    const url = "https://api.gamepromo.io/promo/login-client";

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Host": "api.gamepromo.io",
        "Origin": "",
        "Referer": "",
    };

    const payload = {
        "appToken": appToken,
        "clientId": clientId,
        "clientOrigin": "deviceid"
    };

    let response = await httpRequest(url, headers, "POST", payload);
    if (!response || !response.clientToken) {
        log(`Не смогли получить ключ`);
        return null;
    }

    const clientToken = response.clientToken;
    const registerEventUrl = "https://api.gamepromo.io/promo/register-event";
    const createCodeUrl = "https://api.gamepromo.io/promo/create-code";

    while (true) {
        const eventID = uuid.v4();
        const registerEventPayload = {
            "promoId": promoID,
            "eventId": eventID,
            "eventOrigin": "undefined"
        };

        response = await httpRequest(registerEventUrl, { ...headers, "Authorization": `Bearer ${clientToken}` }, "POST", registerEventPayload);
        if (response && response.hasCode) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const createCodePayload = { "promoId": promoID };
    response = await httpRequest(createCodeUrl, { ...headers, "Authorization": `Bearer ${clientToken}` }, "POST", createCodePayload);
    if (!response || !response.promoCode) {
        log(`Не смогли получить ключ`);
        return null;
    }

    const promoCode = response.promoCode;
    return promoCode;
}

(async function main() {
    while (receiveKeysToday < maxKeys) {
        log(`Запускаем сбор ключей серый: `);
        const promoCode = await startPlaygroundGame();
        if (promoCode) {
            //log(` Полученный promoCode: ${promoCode}`);
            receiveKeysToday += 1;
            collectedKeys.push(promoCode);
        } else {
            log(`Не удалось получить promoCode`);
            break;
        }
    }
    log(`Сбор ключей завершен. Всего собрано ключей: ${receiveKeysToday}`);
})();
