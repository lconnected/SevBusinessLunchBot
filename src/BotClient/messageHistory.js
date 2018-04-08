//unused
import fs from 'fs';

const messagesDir = './storage';
const messagesStorage = `${messagesDir}/messages.json`;

function readMessages() {
    if (fs.existsSync(messagesStorage)) {
        let messagesContent = fs.readFileSync(messagesStorage);
        if (messagesContent.length === 0) {
            return [];
        }
        let messagesList = JSON.parse(messagesContent);
        return messagesList;
    } else {
        console.warn(`File ${messagesStorage} not found then creating new one.`);
        if (!fs.existsSync(messagesDir)) {
            fs.mkdirSync(messagesDir);
        }
        fs.appendFileSync(messagesStorage, '', 'UTF8');
        console.log('storage file created');
        return [];
    }
}

export default {
    saveMessage(message) {
        if (message == undefined) {
            return;
        }
        let messages = readMessages();
        console.log('before ' + this.messageExists(message));
        messages.push(message);
        fs.writeFileSync(messagesStorage, JSON.stringify(messages), 'UTF8');
        console.log('after ' + this.messageExists(message));
    }, 
    getLastUpdateId() {
        let messages = readMessages();
        if (messages.length === 0) {
            return 0;
        }
        let intArray = messages.map(it => {
            return it.id;
        });
        return Math.max.apply(null, intArray);
    },
    messageExists(message, messagesList) {
        let messages = messagesList != undefined ? messagesList : readMessages();
        return messages.find(it => {
            return it.id === message.id;
        }) !== undefined;
    }
}