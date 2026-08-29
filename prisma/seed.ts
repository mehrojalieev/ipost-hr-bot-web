// Boshlang'ich ma'lumot (seed). Bo'sh bazaga namuna vakansiya/ariza/murojaat qo'yadi.
// Faqat baza bo'sh bo'lsa ishlaydi — mavjud ma'lumotni o'chirmaydi.
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.vacancy.count();
  if (existing > 0) {
    console.log(`Baza bo'sh emas (${existing} ta vakansiya) — seed o'tkazib yuborildi.`);
    return;
  }

  const vacancies: {
    id: string;
    emoji: string;
    active: boolean;
    createdAt: Date;
    uz: Prisma.InputJsonValue;
    ru: Prisma.InputJsonValue;
  }[] = [
    {
      id: "call-operator",
      emoji: "☎️",
      active: true,
      createdAt: new Date("2026-08-20T09:00:00.000Z"),
      uz: {
        title: "Call-operator",
        department: "Mijozlarga xizmat",
        employment: "To'liq stavka",
        salary: "4 000 000 – 6 000 000 so'm",
        location: "Toshkent, Chilonzor",
        description:
          "Mijozlar bilan telefon orqali ishlash, savollarga javob berish va murojaatlarni qayd etish.",
        requirements: [
          "O'zbek va rus tillarini yaxshi bilish",
          "Muloqot va tinglash qobiliyati",
          "Kompyuterda ishlash ko'nikmasi",
          "Mas'uliyat va bosiqlik",
        ],
      },
      ru: {
        title: "Оператор call-центра",
        department: "Клиентский сервис",
        employment: "Полная ставка",
        salary: "4 000 000 – 6 000 000 сум",
        location: "Ташкент, Чиланзар",
        description:
          "Работа с клиентами по телефону, ответы на вопросы и регистрация обращений.",
        requirements: [
          "Хорошее знание узбекского и русского языков",
          "Навыки общения и слушания",
          "Умение работать за компьютером",
          "Ответственность и спокойствие",
        ],
      },
    },
    {
      id: "courier",
      emoji: "🛵",
      active: true,
      createdAt: new Date("2026-08-21T09:00:00.000Z"),
      uz: {
        title: "Kuryer",
        department: "Yetkazib berish",
        employment: "To'liq / Yarim stavka",
        salary: "5 000 000 – 9 000 000 so'm",
        location: "Toshkent bo'ylab",
        description:
          "Buyurtmalarni mijozlarga o'z vaqtida va butun holatda yetkazib berish.",
        requirements: [
          "18 yoshdan katta",
          "Shahar yo'nalishlarini bilish",
          "O'z transporti bo'lishi (afzallik)",
          "Punktuallik va halollik",
        ],
      },
      ru: {
        title: "Курьер",
        department: "Доставка",
        employment: "Полная / частичная ставка",
        salary: "5 000 000 – 9 000 000 сум",
        location: "По Ташкенту",
        description: "Своевременная и бережная доставка заказов клиентам.",
        requirements: [
          "От 18 лет",
          "Знание районов города",
          "Наличие своего транспорта (преимущество)",
          "Пунктуальность и честность",
        ],
      },
    },
    {
      id: "sales-manager",
      emoji: "💼",
      active: true,
      createdAt: new Date("2026-08-22T09:00:00.000Z"),
      uz: {
        title: "Sotuv menejeri",
        department: "Savdo bo'limi",
        employment: "To'liq stavka",
        salary: "6 000 000 so'm + bonus",
        location: "Toshkent, Chilonzor",
        description:
          "Yangi mijozlarni jalb qilish, shartnomalar tuzish va savdo rejasini bajarish.",
        requirements: [
          "Savdo sohasida tajriba (afzallik)",
          "Natijaga yo'naltirilganlik",
          "Yaxshi muloqot ko'nikmalari",
          "CRM tizimlari bilan ishlash",
        ],
      },
      ru: {
        title: "Менеджер по продажам",
        department: "Отдел продаж",
        employment: "Полная ставка",
        salary: "6 000 000 сум + бонус",
        location: "Ташкент, Чиланзар",
        description:
          "Привлечение новых клиентов, заключение договоров и выполнение плана продаж.",
        requirements: [
          "Опыт в продажах (преимущество)",
          "Ориентация на результат",
          "Хорошие коммуникативные навыки",
          "Работа с CRM-системами",
        ],
      },
    },
    {
      id: "smm",
      emoji: "📱",
      active: false,
      createdAt: new Date("2026-08-19T09:00:00.000Z"),
      uz: {
        title: "SMM menejer",
        department: "Marketing",
        employment: "Masofaviy",
        salary: "5 000 000 – 8 000 000 so'm",
        location: "Toshkent / Masofaviy",
        description:
          "Ijtimoiy tarmoqlarni yuritish, kontent tayyorlash va auditoriyani oshirish.",
        requirements: [
          "Instagram, Telegram, TikTok bilan ishlash",
          "Kontent va dizaynga did",
          "Copywriting ko'nikmasi",
          "Portfolio (afzallik)",
        ],
      },
      ru: {
        title: "SMM-менеджер",
        department: "Маркетинг",
        employment: "Удалённо",
        salary: "5 000 000 – 8 000 000 сум",
        location: "Ташкент / Удалённо",
        description: "Ведение соцсетей, подготовка контента и рост аудитории.",
        requirements: [
          "Работа с Instagram, Telegram, TikTok",
          "Вкус к контенту и дизайну",
          "Навыки копирайтинга",
          "Портфолио (преимущество)",
        ],
      },
    },
  ];

  for (const v of vacancies) {
    await prisma.vacancy.create({ data: v });
  }

  await prisma.application.createMany({
    data: [
      {
        vacancyId: "call-operator",
        vacancyTitle: "Call-operator",
        name: "Dilnoza Karimova",
        phone: "+998 90 111 22 33",
        age: "23",
        experience: "1 yil call-markazda ishlaganman",
        hasResume: false,
        status: "new",
        telegramUser: "@dilnoza_k",
        lang: "uz",
        createdAt: new Date("2026-08-25T14:20:00.000Z"),
      },
      {
        vacancyId: "courier",
        vacancyTitle: "Kuryer",
        name: "Sardor Aliyev",
        phone: "+998 93 444 55 66",
        age: "27",
        experience: "2 yil kuryerlik, o'z mototsiklim bor",
        hasResume: false,
        status: "reviewing",
        telegramUser: "@sardor_a",
        lang: "uz",
        createdAt: new Date("2026-08-25T11:05:00.000Z"),
      },
      {
        vacancyId: "sales-manager",
        vacancyTitle: "Sotuv menejeri",
        name: "Malika Yusupova",
        phone: "+998 97 777 88 99",
        age: "25",
        experience: "3 yil savdo, CRM bilan ishlaganman",
        hasResume: false,
        status: "accepted",
        telegramUser: "@malika_y",
        lang: "ru",
        createdAt: new Date("2026-08-24T16:40:00.000Z"),
      },
      {
        vacancyId: "call-operator",
        vacancyTitle: "Call-operator",
        name: "Jasur Toshmatov",
        phone: "+998 91 222 33 44",
        age: "20",
        experience: "yo'q",
        hasResume: false,
        status: "new",
        telegramUser: "@jasur_t",
        lang: "uz",
        createdAt: new Date("2026-08-26T08:15:00.000Z"),
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        name: "Dilnoza Karimova",
        telegramUser: "@dilnoza_k",
        topic: "Ariza holati",
        text: "Assalomu alaykum, Call-operator lavozimiga ariza qoldirgandim. Qachon javob bo'ladi?",
        status: "new",
        createdAt: new Date("2026-08-26T09:10:00.000Z"),
      },
      {
        name: "Bekzod Rahimov",
        telegramUser: "@bekzod_r",
        topic: "Ish vaqti",
        text: "Kuryer uchun ish vaqti nechchidan nechchigacha? Yarim stavka bormi?",
        status: "new",
        createdAt: new Date("2026-08-26T08:30:00.000Z"),
      },
      {
        name: "Nigora Islomova",
        telegramUser: "@nigora_i",
        topic: "Maosh",
        text: "Sotuv menejeri bonus tizimi qanday hisoblanadi?",
        status: "answered",
        createdAt: new Date("2026-08-25T15:00:00.000Z"),
      },
    ],
  });

  console.log("✅ Seed tugadi: 4 vakansiya (2 tilli), 4 ariza, 3 murojaat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
