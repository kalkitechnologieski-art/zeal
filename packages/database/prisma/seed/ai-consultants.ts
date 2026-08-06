import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  'astrologer',
  'psychologist',
  'tarot',
  'numerologist',
  'life_coach',
  'healer'
];

const aiNames = {
  astrologer: ['AstroAI-1', 'AstroAI-2', 'AstroAI-3', 'AstroAI-4', 'AstroAI-5'],
  psychologist: ['PsychAI-1', 'PsychAI-2', 'PsychAI-3', 'PsychAI-4', 'PsychAI-5'],
  tarot: ['TarotAI-1', 'TarotAI-2', 'TarotAI-3', 'TarotAI-4', 'TarotAI-5'],
  numerologist: ['NumerAI-1', 'NumerAI-2', 'NumerAI-3', 'NumerAI-4', 'NumerAI-5'],
  life_coach: ['CoachAI-1', 'CoachAI-2', 'CoachAI-3', 'CoachAI-4', 'CoachAI-5'],
  healer: ['HealAI-1', 'HealAI-2', 'HealAI-3', 'HealAI-4', 'HealAI-5'],
};

const specialties = {
  astrologer: ['Vedic', 'KP', 'Nadi', 'Western', 'Muhurtha'],
  psychologist: ['CBT', 'Anxiety', 'Depression', 'Trauma', 'Mindfulness'],
  tarot: ['Rider-Waite', 'Lenormand', 'Osho Zen', 'Angel Cards', 'Marseille'],
  numerologist: ['Chaldean', 'Pythagorean', 'Kabbalah', 'Chinese', 'Indian'],
  life_coach: ['Career', 'Relationships', 'Health', 'Finance', 'Personal Growth'],
  healer: ['Reiki', 'Pranic', 'Crystal', 'Sound', 'Energy'],
};

const bios = {
  astrologer: 'Expert Vedic astrologer with deep knowledge of planetary alignments.',
  psychologist: 'Compassionate psychologist specializing in anxiety and depression.',
  tarot: 'Intuitive tarot reader with 100+ years of spiritual insight.',
  numerologist: 'Master numerologist decoding life paths and destiny.',
  life_coach: 'Empowering life coach helping you achieve your goals.',
  healer: 'Energy healer balancing chakras and restoring harmony.',
};

const models = ['zhipu', 'agnes', 'roxy'];

export async function seedAIConsultants() {
  for (const category of categories) {
    const names = aiNames[category as keyof typeof aiNames];
    const spec = specialties[category as keyof typeof specialties];
    const bio = bios[category as keyof typeof bios];

    for (let i = 0; i < names.length; i++) {
      const isPaid = i >= 3; // First 3 free, last 2 paid
      await prisma.aIConsultant.upsert({
        where: { username: names[i].toLowerCase() },
        update: {},
        create: {
          name: names[i],
          username: names[i].toLowerCase(),
          avatar: `https://ui-avatars.com/api/?name=${names[i].replace(/[^a-zA-Z]/g, '')}&background=533AFD&color=fff`,
          category,
          isPaid,
          perMinuteRate: isPaid ? 2 : 0,
          rating: 4.5 + Math.random() * 0.4,
          experience: 100,
          totalConsultations: Math.floor(1000 + Math.random() * 9000),
          sparks: 50000 + Math.floor(Math.random() * 50000),
          bio: `${bio} ${isPaid ? 'Premium consultant with advanced expertise.' : 'Free consultant providing general guidance.'}`,
          specialties: spec.slice(0, 3),
          languages: ['English', 'Hindi'],
          model: models[i % models.length],
          responseTime: 150 + Math.floor(Math.random() * 100),
          accuracy: 0.92 + Math.random() * 0.07,
          isActive: true,
        },
      });
    }
  }
  console.log('✅ AI consultants seeded.');
}
