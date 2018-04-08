import axios from 'axios';
import log from 'winston';
import moment from 'moment';
import fs from 'fs';
import FormData from 'form-data';

const apiToken = '545252815:AAE3gGLVF2MLvKs_SAlrHO6dt0OxEdxopr0';
const apiUrl = `https://api.telegram.org/bot${apiToken}`;
const apiFunctions = {
    auth: `${apiUrl}/getMe`,
    updates: `${apiUrl}/getUpdates`,
    sendMessage: `${apiUrl}/sendMessage`,
    sendPhoto: `${apiUrl}/sendPhoto`,
}

const staticContentDir = './storage/static';
const defaultMessage = { text: 'Сегодня выходной, комплексных обедов нет.' };
const botCommands = {
    start: { text: fs.readFileSync(`${staticContentDir}/description.txt`, "UTF8") },
    help: { text: fs.readFileSync(`${staticContentDir}/helptext.txt`, "UTF8") },
    listlunch: [
            defaultMessage,
            {
                text: 'Понедельник', 
                list: [
                    { text: 'Black Sea', file: `${staticContentDir}/blacksea/Mon.png` },
                    { text: 'Лепим сами', file: `${staticContentDir}/lepimsami/Mon.png` },
                ]
            },
            {
                text: 'Вторник', 
                list: [
                    { text: 'Black Sea', file: `${staticContentDir}/blacksea/Tue.png` },
                    { text: 'Лепим сами', file: `${staticContentDir}/lepimsami/Tue.png` },
                ]
            },
            {
                text: 'Среда', 
                list: [
                    { text: 'Black Sea', file: `${staticContentDir}/blacksea/Wed.png` },
                    { text: 'Лепим сами', file: `${staticContentDir}/lepimsami/Wed.png` },
                ]
            },
            {
                text: 'Четверг', 
                list: [
                    { text: 'Black Sea', file: `${staticContentDir}/blacksea/Thu.png` },
                    { text: 'Лепим сами', file: `${staticContentDir}/lepimsami/Thu.png` },
                ]
            },
            {
                text: 'Пятница', 
                list: [
                    { text: 'Black Sea', file: `${staticContentDir}/blacksea/Fri.png` },
                    { text: 'Лепим сами', file: `${staticContentDir}/lepimsami/Fri.png` },
                ]
            },
            defaultMessage,
        ]
}

export default {
    /**
     * Auth query.
     */
    authBot() {
        return axios.get(apiFunctions.auth);
    },
    /**
     * Identifier of the first update to be returned. 
     * Must be greater by one than the highest among the identifiers
     * of previously received updates.
     * @param {integer} offset 
     */
    getUpdates(offset = 0) {
        let url = apiFunctions.updates;
        if (offset > 0) {
            url += `?offset=${offset}`;
        }
        return axios.get(url);
    },
    /**
     * Writes update items to history and returs max the update_id
     * @param {Update object} response 
     */
    handleUpdate(response) {
        let data = response.data;
        for (let updateItem of data.result) {
            log.info(updateItem);
            this._resolve(updateItem);
        }
        let maxUpdateId;
        if (data.result.length > 0) {
            maxUpdateId = Math.max.apply(null, data.result.map(it => it.update_id));
        } else {
            maxUpdateId = 0;
        }
        return maxUpdateId;
    },
    /**
     * Sends the message or message chain via message.list parameter.
     * Async method.
     * @param {*} message object 
     * @param {*} chatId target chat
     */
    async sendMessage({text, list = null}, chatId = null) {
        if (chatId == null) {
            log.error('chatId is null, message has no target.');
            return;
        }
        
        // send text
        await axios.post(apiFunctions.sendMessage, {text: text, chat_id: chatId});

        // and files if present
        if (list != null) {
            for (let message of list) {
                // 1. Send title. Start the chain and await for execution
                await axios.post(apiFunctions.sendMessage, {text: message.text, chat_id: chatId})
                    .then(() => {
                        // 2. Photo as multipart/form-data
                        let formData = new FormData();
                        formData.append('chat_id', chatId);
                        formData.append('photo', fs.createReadStream(message.file));
                        return axios.post(apiFunctions.sendPhoto, formData, {
                            headers: formData.getHeaders()
                        });
                    });
            }
        }
    },
    /**
     * internal method to reslove incomming update and pick the answer
     * @param {*} updateEntity response object from API
     */
    _resolve(updateEntity) {
        let commandName = updateEntity.message.text.substr(1);
        log.info(commandName);
        let resolved = botCommands[commandName];
        if (resolved === undefined) {
            return;
        }
        if (resolved instanceof Array) {
            let day = moment.unix(updateEntity.message.date).day();
            log.info('Day is ' + day);
            this.sendMessage(resolved[day], updateEntity.message.chat.id);
        } else {
            this.sendMessage(resolved, updateEntity.message.chat.id);
        }
    },
}