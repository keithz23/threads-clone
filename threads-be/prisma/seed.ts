// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUsername(i: number) {
  return `user${String(i).padStart(4, '0')}`;
}

function randomEmail(i: number) {
  return `user${i}@example.test`;
}

function randomISODateOffset(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59), 0);
  return d;
}

function randomInterests(): string[] {
  const pool = [
    'music',
    'tech',
    'travel',
    'food',
    'photography',
    'gaming',
    'fitness',
    'reading',
    'movies',
    'coding',
  ];
  const len = randInt(0, 4);
  const out = new Set<string>();
  while (out.size < len) {
    out.add(pool[randInt(0, pool.length - 1)]);
  }
  return Array.from(out);
}

async function main() {
  const COUNT = 100; // số user muốn tạo — đổi tuỳ ý

  const users: Array<{
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    link: string | null;
    linkTitle: string | null;
    interests: string[];
    verified: boolean;
    isPrivate: boolean;
    isOnline: boolean;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    phoneNumber: string | null;
    website: string | null;
    location: string | null;
  }> = [];
  for (let i = 1; i <= COUNT; i++) {
    const createdAt = randomISODateOffset(365);
    const updatedAt = new Date(
      createdAt.getTime() + randInt(0, 1000 * 60 * 60 * 24 * 90),
    ); // up to +90 days
    const lastSeenAt = Math.random() > 0.3 ? randomISODateOffset(30) : null; // 70% có lastSeen, 30% null

    users.push({
      username: randomUsername(i),
      email: randomEmail(i),
      passwordHash: `seeded-hash-${i}`,
      displayName: `User ${i}`,
      bio: Math.random() > 0.6 ? `Hello, I'm user ${i}` : null,
      avatarUrl: null,
      coverUrl: null,
      link: null,
      linkTitle: null,
      interests: randomInterests(),

      verified: Math.random() > 0.9, // ~10% verified
      isPrivate: Math.random() > 0.85, // ~15% private
      isOnline: Math.random() > 0.7, // ~30% online
      lastSeenAt,

      createdAt,
      updatedAt,

      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      phoneNumber: null,
      website: null,
      location: null,
    });
  }

  console.log(`Seeding ${users.length} users...`);

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        email: u.email,
        passwordHash: u.passwordHash,
        displayName: u.displayName,
        bio: u.bio,
        interests: u.interests,
        verified: u.verified,
        isPrivate: u.isPrivate,
        isOnline: u.isOnline,
        lastSeenAt: u.lastSeenAt,
        updatedAt: u.updatedAt,
        followersCount: u.followersCount,
        followingCount: u.followingCount,
        postsCount: u.postsCount,
        avatarUrl: u.avatarUrl,
        coverUrl: u.coverUrl,
        link: u.link,
        linkTitle: u.linkTitle,
        phoneNumber: u.phoneNumber,
        website: u.website,
        location: u.location,
      },
      create: u,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
