// ============================================================
//  iPOST HR — pm2 process boshqaruvi
//  Ikkala jarayonni (panel + bot) doimiy ishlatib turadi,
//  server qayta yuklansa ham o'zi ko'tariladi.
//
//  TALAB: ikkala repo yonma-yon (sibling) turishi kerak, masalan:
//    /opt/ipost-hr/hr-admin-panel   <-- shu fayl shu yerda
//    /opt/ipost-hr/hr-telegram-bot
//
//  Ishga tushirish (hr-admin-panel papkasidan):
//    pm2 start ecosystem.config.js
//    pm2 save            # ro'yxatni saqlaydi
//    pm2 startup         # server yonganda avto-start (chiqqan buyruqni bajaring)
// ============================================================

module.exports = {
  apps: [
    {
      name: "ipost-hr-panel",
      cwd: "./", // hr-admin-panel
      script: "npm",
      args: "run start", // next start -p 3005 (avval: npm run build)
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "500M",
    },
    {
      name: "ipost-hr-bot",
      cwd: "../hr-telegram-bot",
      script: "npm",
      args: "run start", // node dist/index.js (avval: npm run build)
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "300M",
    },
  ],
};
