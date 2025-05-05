import dotenv from 'dotenv';
dotenv.config();

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import sharp from 'sharp';
import { GoogleGenerativeAI } from '@google/generative-ai';

const responses = JSON.parse(fs.readFileSync('./respond.json', 'utf-8'));
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const folders = ['./usrdata', './history', './instructions'];
folders.forEach(f => !fs.existsSync(f) && fs.mkdirSync(f));

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, printQRInTerminal: false, logger: pino({ level: 'silent' }) });

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (code !== DisconnectReason.loggedOut) startBot();
    }
    if (connection === 'open') console.log('✅ Connected');
  });

  sock.ev.on('creds.update', saveCreds);

  const loadUserData = (jid) => {
    const file = `./usrdata/${jid}.json`;
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
    const init = { totalResponses: 0, firstInteraction: new Date().toISOString(), dailyStats: {}, customInstruction: 'Default', name: '.', muted: false };
    fs.writeFileSync(file, JSON.stringify(init, null, 2));
    return init;
  };

  const saveUserData = (jid, data) => fs.writeFileSync(`./usrdata/${jid}.json`, JSON.stringify(data, null, 2));

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      const jid = m.key.remoteJid;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || '';
      const msgBody = text.trim();
      const userData = loadUserData(jid);
      const today = new Date().toISOString().split('T')[0];
      userData.dailyStats[today] = userData.dailyStats[today] || 0;

      const commandHandled = async () => {
        switch (true) {
          case msgBody === '/menu':
            return sock.sendMessage(jid, { text: responses.menu });
          case ['/command', '/cmd'].includes(msgBody):
            return sock.sendMessage(jid, { text: responses.command });
          case msgBody === '/reset':
            fs.rmSync(`./history/${jid}.json`, { force: true });
            fs.rmSync(`./instructions/${jid}.txt`, { force: true });
            userData.dailyStats = {}; userData.customInstruction = 'Default'; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: responses.reset_success });
          case msgBody.startsWith('/set_instruction') || msgBody.startsWith('/seti'):
            const inst = msgBody.replace(/\/set_instruction|\/seti/, '').trim();
            if (!inst) return sock.sendMessage(jid, { text: '⚠️ Masukkan instruksi.' });
            fs.writeFileSync(`./instructions/${jid}.txt`, inst);
            userData.customInstruction = inst; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: responses.instruction_set_success });
          case msgBody === '/info':
            const cust = fs.existsSync(`./instructions/${jid}.txt`) ? fs.readFileSync(`./instructions/${jid}.txt`, 'utf-8') : 'Default';
            const stats = Object.entries(userData.dailyStats).map(([d, c]) => `- ${d}: ${c} pesan`).join('\n') || 'Tidak ada';
            const info = responses.info_template
              .replace('{custom_instruction}', cust)
              .replace('{active_since}', sock.user?.name || '')
              .replace('{total_responses}', userData.totalResponses)
              .replace('{first_interaction}', userData.firstInteraction)
              .replace('{daily_stats}', stats);
            return sock.sendMessage(jid, { text: info });
          case msgBody.startsWith('/reg '):
            const name = msgBody.replace('/reg ', '').trim();
            userData.name = name || userData.name; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: `Nama terdaftar: ${name}` });
          case msgBody === '/unreg':
            userData.name = 'Tidak Dikenal'; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: 'Nama dihapus.' });
          case msgBody === '/mute':
            userData.muted = true; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: 'AI dimute.' });
          case msgBody === '/unmute':
            userData.muted = false; saveUserData(jid, userData);
            return sock.sendMessage(jid, { text: 'AI diunmute.' });
          default:
            return false;
        }
      };

      if (await commandHandled() || msgBody.startsWith('/') || userData.muted) continue;

      const media = m.message.imageMessage || m.message.videoMessage || m.message.audioMessage || m.message.stickerMessage || null;
      let mediaType = null;
      let mediaBuffer = null;
      let mimeType = 'application/octet-stream';

      if (media) {
        if (m.message.stickerMessage) {
          mediaType = 'image';
          mimeType = 'image/webp';
        } else {
          mediaType = m.message.imageMessage ? 'image' : m.message.videoMessage ? 'video' : m.message.audioMessage ? 'audio' : null;
          mimeType = m.message[`${mediaType}Message`]?.mimetype || mimeType;
        }
        mediaBuffer = await downloadMediaMessage(m, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
      }

      const histFile = `./history/${jid}.json`;
      let history = fs.existsSync(histFile) ? JSON.parse(fs.readFileSync(histFile)) : [];
      const uname = userData.name === 'Tidak Dikenal' ? jid : userData.name;
      history.push({ role: 'user', text: `${uname}: ${msgBody || '[media]'}` });
      if (history.length > 20) history = history.slice(-20);
      fs.writeFileSync(histFile, JSON.stringify(history, null, 2));

      const userInstruction = fs.existsSync(`./instructions/${jid}.txt`) ? fs.readFileSync(`./instructions/${jid}.txt`, 'utf-8') : 'Kamu adalah AI WhatsApp bernama Shikara.';
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: userInstruction });

      const prompt = history.map(e => `${e.role === 'user' ? 'User' : 'Assistant'}: ${e.text}`).join('\n') + '\nUser: ' + (msgBody || '[media]') + '\nAssistant:';

      try {
        const input = mediaBuffer
          ? [prompt, { inlineData: { data: mediaBuffer.toString('base64'), mimeType } }]
          : [prompt];

        const res = await model.generateContent(input);
        const output = res.response.text().trim();
        history.push({ role: 'model', text: output });
        fs.writeFileSync(histFile, JSON.stringify(history, null, 2));
        userData.totalResponses++; userData.dailyStats[today]++;
        saveUserData(jid, userData);
        await sock.sendMessage(jid, { text: output });
      } catch (e) {
        console.error(e);
        await sock.sendMessage(jid, { text: responses.error_handling_message });
      }
    }
  });
};

startBot().catch(console.error);