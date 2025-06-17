const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { default: OpenAI } = require('openai');
const puppeteer = require('puppeteer');




const openai = new OpenAI({
    apiKey: "AIzaSyD97at1oG7ZGvrK-k8Vt1ylQVh20ZZ78DY",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const prevMsg = []
let isBotActive = false;



const SYSTEM_PROMPT = `
  you are texting behalf of amit u have to be very dry replying with replies like "hi" "helo" "wyd" "nvm" nd use own little dry words also dont chat a lot be quite okay and there will be a array of previous messages saperated by commas read the old convos for the context 
  and remember copy users tone if the user is angry be angry and break character if the user is loving still be rude ok strictly

  prev convo: ${prevMsg}
`




const sendAi = async (query) => {
    console.log("sending msg to ai...")
    const response = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            {
                role: "system", content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: query
            }
        ]
    });
    const rawRes = response.choices[0].message.content
    const msgq = `bot: ${rawRes}`;
    prevMsg.push(msgq)
    return rawRes;

}



const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome-stable',
  },
  authStrategy: new LocalAuth()
});

// Show QR in terminal
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan the QR code above');
});

// Bot ready

const ALLOWED_NUMBER = "919706859438@c.us";


client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
});

// Handle incoming messages
client.on('message', async message => {

    if (message.from.endsWith('@g.us')) return;

    if (message.body === '!amit098') {
        isBotActive = true;
        message.reply('🤖 Bot is now *ON* and will respond to messages.');
        return;
    }

    if (message.body === '!stopbot') {
        isBotActive = false;
        message.reply('🛑 Bot is now *OFF* and will not respond.');
        return;
    }

    if (message.body === '!status') {
        message.reply(`🔌 Bot is currently: *${isBotActive ? 'ON' : 'OFF'}*`);
        return;
    }

    if (!isBotActive) return;






    if (message.body) {
        const msgq = `user: ${message.body}`
        prevMsg.push(msgq);

        const botReply = await sendAi(message.body);
        const reply = `${botReply}(_this is an ai generated response_)
        `
        message.reply(botReply);
    }

});

// Start the bot
client.initialize();
