import express from 'express';
import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Telegram Bot
const botToken = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (botToken) {
  bot = new Telegraf(botToken);

  // Bot commands
  bot.start((ctx) => {
    ctx.reply('👋 Bonjour ! Je suis le bot de GEII-OS.\n\nJe suis là pour t\'aider dans ton quotidien étudiant. Tape /help pour voir ce que je peux faire !');
  });

  bot.help((ctx) => {
    ctx.reply(
      '📚 *Commandes disponibles* :\n\n' +
      '/crous - Obtenir le menu du CROUS du jour\n' +
      '/qcm - Voir tes QCM en attente\n' +
      '/status - Vérifier que l\'OS GEII fonctionne',
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('status', (ctx) => {
    ctx.reply('✅ Le serveur GEII-OS est en ligne et opérationnel !');
  });

  bot.command('crous', (ctx) => {
    // TODO: Fetch real CROUS menu data here via an API or scraping
    ctx.reply('🍽️ *Menu du CROUS du jour* :\n\n- Entrée : Salade de tomates\n- Plat : Poulet Rôti & Frites\n- Dessert : Yaourt nature', { parse_mode: 'Markdown' });
  });

  bot.command('qcm', (ctx) => {
    // TODO: Fetch actual QCM data from your Supabase backend here
    ctx.reply('📝 *Vos QCM en attente* :\n\n1. Mathématiques : Les intégrales (Échéance: Ce soir 23h59)\n2. Informatique : Les pointeurs en C (Échéance: Demain 18h)', { parse_mode: 'Markdown' });
  });

  // Launch bot
  bot.launch().then(() => {
    console.log('🤖 Telegram bot is running.');
  }).catch((err) => {
    console.error('❌ Failed to start Telegram bot:', err.message);
  });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // --- CRON JOBS ---
  // Format: second minute hour day-of-month month day-of-week
  
  // 1. CROUS Menu Reminder (Every weekday at 11:00 AM)
  cron.schedule('0 11 * * 1-5', async () => {
    console.log('🕒 Running CROUS Menu Broadcast');
    // TODO: Get a list of student Chat IDs who subscribed from your database
    const chatIdsToNotify = []; // e.g., [123456789, 987654321]
    
    for (const chatId of chatIdsToNotify) {
      try {
        await bot.telegram.sendMessage(chatId, '🔔 *Rappel Menu CROUS* (11h00) :\n\n- Entrée : Salade de tomates\n- Plat : Poulet Rôti & Frites\n- Dessert : Yaourt nature', { parse_mode: 'Markdown' });
      } catch (err) {
        console.error(`Failed to send CROUS menu to ${chatId}:`, err);
      }
    }
  });

  // 2. QCM Reminder (Every day at 18:00)
  cron.schedule('0 18 * * *', async () => {
    console.log('🕒 Running QCM Reminder Broadcast');
    // TODO: Get list of students and their pending QCMs from DB
    const chatIdsToNotify = []; 
    
    for (const chatId of chatIdsToNotify) {
        try {
          await bot.telegram.sendMessage(chatId, '🔔 *Rappel QCM* (18h00) :\nN\'oublie pas tes QCM en attente ! Tape /qcm pour voir la liste.', { parse_mode: 'Markdown' });
        } catch (err) {
          console.error(`Failed to send QCM reminder to ${chatId}:`, err);
        }
    }
  });

} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set in environment variables. Bot will not start.');
}

// Serve React static files (Frontend)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Handle client-side routing, return all requests to React app
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ The 'dist' directory was not found. Have you run 'npm run build'? App is answering with a placeholder.`);
  app.get(/(.*)/, (req, res) => {
    res.send('<h2>GEII-OS Server is running, but React frontend is not built.</h2><p>Run <code>npm run build</code> locally, or wait for the Railway build to finish.</p>');
  });
}

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server (GEII-OS) is running on port ${PORT}`);
});
