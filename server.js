import express from 'express';
import { Telegraf } from 'telegraf';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase Client for the server
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('⚠️ Supabase credentials not found in env. DB features will not work.');
}

// Initialize Telegram Bot
const botToken = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

const getCrousMenu = async (crousCode) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`https://api.croustillant.menu/v1/restaurants/${crousCode}/menu/${today}`);
    const data = await res.json();
    if (!data.success || !data.data) {
      return "Aucun menu disponible pour aujourd'hui.";
    }
    const repas = data.data.repas.find(r => r.nom === 'Déjeuner') || data.data.repas[0];
    if (!repas) return "Menu non disponible.";
    
    let menuText = `🍽️ *Menu - ${data.data.nom}*\n\n`;
    repas.plats.forEach(cat => {
      menuText += `*${cat.nom}*\n`;
      cat.liste.forEach(plat => {
        menuText += `- ${plat.nom}\n`;
      });
      menuText += '\n';
    });
    return menuText;
  } catch (err) {
    console.error("Crous fetch error:", err);
    return "Erreur lors de la récupération du menu.";
  }
};

if (botToken) {
  bot = new Telegraf(botToken);

  bot.start((ctx) => {
    ctx.reply('👋 Bonjour ! Je suis l\'assistant de GEII-OS.\n\nAssocie ton compte Telegram en envoyant ton email étudiant.\n\nTape /help pour voir ce que je peux faire !');
  });

  bot.help((ctx) => {
    ctx.reply(
      '📚 *Commandes disponibles* :\n\n' +
      '/crous - Obtenir le menu de ton CROUS favori\n' +
      '/qcm - Voir tes QCM en attente\n' +
      '/status - Vérifier que l\'OS GEII fonctionne',
      { parse_mode: 'Markdown' }
    );
  });

  bot.command('status', (ctx) => {
    ctx.reply('✅ Le serveur GEII-OS est en ligne et opérationnel !');
  });

  bot.command('crous', async (ctx) => {
    if (!supabase) return ctx.reply('Erreur: Base de données non connectée.');
    // Ideally, we find the user by their telegram chat id
    const { data: user } = await supabase.from('profiles').select('crous_name').eq('telegram_chat_id', String(ctx.chat.id)).single();
    const crousCode = user?.crous_name || '611'; // default to Manu
    const menu = await getCrousMenu(crousCode);
    ctx.reply(menu, { parse_mode: 'Markdown' });
  });

  bot.command('qcm', async (ctx) => {
    if (!supabase) return ctx.reply('Erreur DB.');
    // Mocking real data until tasks DB is fully structured
    ctx.reply('📝 *Vos Prochaines dates* :\n\n1. Rendu Projet (Semaine prochaine)\n2. DS Math (Lundi)', { parse_mode: 'Markdown' });
  });

  // Launch bot
  bot.launch().then(() => {
    console.log('🤖 Telegram bot is running.');
  }).catch((err) => {
    console.error('❌ Failed to start Telegram bot:', err.message);
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // --- CRON JOBS ---
  // 1. CROUS Menu Reminder (Every weekday at 11:15 AM)
  cron.schedule('15 11 * * 1-5', async () => {
    console.log('🕒 Running CROUS Menu Broadcast');
    if (!supabase) return;
    const { data: profiles } = await supabase.from('profiles').select('telegram_chat_id, crous_name').not('telegram_chat_id', 'is', null);
    
    if (profiles) {
      for (const p of profiles) {
        if (!p.telegram_chat_id) continue;
        const crousCode = p.crous_name || '611';
        const menu = await getCrousMenu(crousCode);
        try {
          await bot.telegram.sendMessage(p.telegram_chat_id, '🔔 *Repas de ce midi* :\n\n' + menu, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error(`Failed to send CROUS menu to ${p.telegram_chat_id}:`, err.message);
        }
      }
    }
  });

  // 2. QCM Reminder (Every day at 18:00)
  cron.schedule('0 18 * * *', async () => {
    console.log('🕒 Running Tasks Reminder Broadcast');
    if (!supabase) return;
    const { data: profiles } = await supabase.from('profiles').select('telegram_chat_id').not('telegram_chat_id', 'is', null);
    if (profiles) {
      for (const p of profiles) {
        if (!p.telegram_chat_id) continue;
        try {
          await bot.telegram.sendMessage(p.telegram_chat_id, '🔔 *Rappel Quotidien* (18h00) :\nN\'oublie pas d\'aller vérifier ton OS GEII pour avancer sur tes devoirs et projets !', { parse_mode: 'Markdown' });
        } catch (err) {
          console.error(`Failed to send reminder to ${p.telegram_chat_id}:`, err.message);
        }
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
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ The 'dist' directory was not found. Have you run 'npm run build'? App is answering with a placeholder.`);
  app.get(/(.*)/, (req, res) => {
    res.send('<h2>GEII-OS Server is running, but React frontend is not built.</h2><p>Run <code>npm run build</code> locally, or wait for the Railway build to finish.</p>');
  });
}

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', bot: !!bot }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server (GEII-OS) is running on port ${PORT}`);
});
