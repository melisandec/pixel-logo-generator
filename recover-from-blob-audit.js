#!/usr/bin/env node

/**
 * DATABASE RECOVERY FROM BLOB AUDIT
 * 
 * Recovers GeneratedLogo entries from Vercel Blob storage audit data.
 * Uses blob references to reconstruct database records.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Blob audit data - extracted from admin panel
const blobAuditData = [
  {
    text: "Oracle",
    username: "Unknown",
    seed: 1225051913,
    date: "2026-01-27T08:09:49Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1225051913-oanbvbast4-aRxfEniIxenhPXHK6AlGNQilw4VJav.png",
  },
  {
    text: "I berry",
    username: "ladymel",
    seed: 1015208071,
    date: "2026-01-26T19:39:06Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1015208071-uo2h2w22dd-6Pf76nwRA4vae6jhdkY2NyHY7fMGIi.png",
  },
  {
    text: "Black Mirror",
    username: "ladymel",
    seed: 1399998385,
    date: "2026-01-26T16:17:07Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1399998385-e9oc491thfr-gGNwbQW2ni8C97BIvy03znDpWJ8XWk.png",
  },
  {
    text: "Tokyo",
    username: "ladymel",
    seed: 2132256975,
    date: "2026-01-26T16:14:58Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/2132256975-hgn1hh9t00c-P2bX0KhwYxkvDg9RUR24CkL5Fmsoqs.png",
  },
  {
    text: "777",
    username: "111iks.base.eth",
    seed: 1837254301,
    date: "2026-01-25T21:36:19Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1837254301-ury3no1h1sn-x7YZGQdxuodwix3SdiQsLNpwp10ADN.png",
  },
  {
    text: "Arpanet",
    username: "111iks",
    seed: 166733719,
    date: "2026-01-25T21:33:30Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/166733719-qmxzq3lapm-5qCfZMoqIkShBYbKXcOWsDQmGeJcOK.png",
  },
  {
    text: "Quest",
    username: "ladymel",
    seed: 1757711869,
    date: "2026-01-25T12:36:19Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1757711869-t4ulv8qpe6p-Uwd1G0fqdpSA9ESNuvQnySqBM4TjNp.png",
  },
  {
    text: "Restake",
    username: "ladymel",
    seed: 516501377,
    date: "2026-01-25T12:34:28Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/516501377-pi5vj80xmw-aYAuYXrqtAzxTYIUnxiYxhiA13jXri.png",
  },
  {
    text: "Louise",
    username: "ladymel",
    seed: 1316654047,
    date: "2026-01-25T12:32:45Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1316654047-qv807qvwshi-5YtFuPdTi4rsgAVPnKdpBsALiba2JC.png",
  },
  {
    text: "Quantum Byte",
    username: "ladymel",
    seed: 1134033005,
    date: "2026-01-24T15:05:09Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1134033005-nrdv5wk5q6-QE4IHN7WWSQSd8VVxAPOUTqHFeJAfS.png",
  },
  {
    text: "Base",
    username: "ladymel",
    seed: 807820888,
    date: "2026-01-24T15:03:32Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/807820888-zg5d737rr7s-AOQRvOu3emv0oLM5jrs4OCLPBbJsTO.png",
  },
  {
    text: "#pixel",
    username: "Unknown",
    seed: 1664733341,
    date: "2026-01-24T13:40:24Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1664733341-l62usb6muas-WUNmggubEGSlzWoOnSCX3wDBxzJGcw.png",
  },
  {
    text: "///714$",
    username: "111iks.base.eth",
    seed: 2096924652,
    date: "2026-01-23T18:01:08Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/2096924652-raiwirtfyi-sQkcwzKpHvmNZVBKZr01Qvd1iIrOfN.png",
  },
  {
    text: "NEAR",
    username: "ladymel",
    seed: 1341475471,
    date: "2026-01-23T13:49:31Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1341475471-jaglreun3q-pnZ3B553uZgGFNa3TMPitbvc1yiz1q.png",
  },
  {
    text: "Hello",
    username: "ladymel",
    seed: 1259553980,
    date: "2026-01-23T13:45:04Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1259553980-o8jp8kzrkge-wUdhXvYmapkFnfvuVhEXXoKtmmTkHH.png",
  },
  {
    text: "Cat",
    username: "Unknown",
    seed: 411625121,
    date: "2026-01-23T11:18:45Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/411625121-507h5kdsiyq-iRribLot4AHNgNmiqHV09cmRe7parE.png",
  },
  {
    text: "Kuchisabishii",
    username: "Unknown",
    seed: 1054397416,
    date: "2026-01-23T11:15:04Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1054397416-a8lt3wtm57d-xRrr2aJCUBjZ03NS1JQ2N0vW0wsvCI.png",
  },
  {
    text: "[2026]",
    username: "ladymel",
    seed: 178347861,
    date: "2026-01-23T11:05:33Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/178347861-0auyziwyawbq-flKcxSFkEOuDQrlFugT3fYvPf0di3l.png",
  },
  {
    text: "@",
    username: "111iks.base.eth",
    seed: 2063030899,
    date: "2026-01-23T10:24:50Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1769160289512-a498jbcftq4-wo86jX6FALFuztBeQiyMEOpbSCOnnq.png",
  },
  {
    text: "(°_°)",
    username: "111iks.base.eth",
    seed: 1202144196,
    date: "2026-01-23T00:34:37Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1202144196-jp7tvvu2hi-z43wZv4s38PQCilXWnQ1Bn8RP1jVbU.png",
  },
  {
    text: "Coolbeans1r",
    username: "coolbeans1r.eth",
    seed: 710744051,
    date: "2026-01-22T13:24:05Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/710744051-eq3uhabfhan-7HAMtD8fl9ZNYfkbLg9UiuHG08SYtI.png",
  },
  {
    text: "Lil nouns",
    username: "coolbeans1r.eth",
    seed: 392365961,
    date: "2026-01-22T13:21:02Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/392365961-m0apru7hfqs-mH7KKx6FWltjH0vakL1qmJWI5cvWPB.png",
  },
  {
    text: "Crypto Lambo",
    username: "happyeyeballs",
    seed: 1512221873,
    date: "2026-01-22T08:54:56Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1512221873-htk71ax1lcu-IKbQhwU0o4PAWo6p8iyHNzTbKYT8m6.png",
  },
  {
    text: "Farcaster",
    username: "ladymel",
    seed: 1022930827,
    date: "2026-01-22T08:06:06Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1022930827-3kdytau9am5-3MdayPuQsJ14TdIUiaIoCNcOLJttXl.png",
  },
  {
    text: "IBM",
    username: "ladymel",
    seed: 1888568993,
    date: "2026-01-21T22:52:19Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/1888568993-5g9gyerwfhw-pXX7TBnlKOCNUAZnsxbaNTR0XAlO5b.png",
  },
  {
    text: "Battlestar",
    username: "ladymel",
    seed: 874237097,
    date: "2026-01-20T11:42:05Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logos/874237097-s8utchdy5i-4OPmERaSdhX7AUsBFSICTsyeQuI1Mq.png",
  },
  {
    text: "Meta",
    username: "bambunio30",
    seed: 32299961,
    date: "2026-01-20T04:47:01Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-32299961-ukvohcybe7g-zWnFiiOaAHidiWbciuBip8p5YIYzpe.png",
  },
  {
    text: "Sony",
    username: "bambunio30",
    seed: 2582855,
    date: "2026-01-20T04:44:20Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-2582855-s1ln7caq0g-fKxZwGLss51wDhfTLk4Ec0idkvHqH0.png",
  },
  {
    text: "Coucou",
    username: "111iks.base.eth",
    seed: 960660649,
    date: "2026-01-20T01:00:00Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-960660649-crpge3p8qy-EVNWFK4MLVqjCLsPconM7PYa1xBWwn.png",
  },
  {
    text: "Pac-Man",
    username: "robbi3",
    seed: 1399341032,
    date: "2026-01-19T23:55:41Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-1399341032-4f8qf5x2bzk-zHz3eh9O1SP191uTD6IW6dZdoNEumk.png",
  },
  {
    text: "Eggs is life",
    username: "guillaumecornet",
    seed: 1525015610,
    date: "2026-01-19T21:16:00Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-1525015610-d7dl55kqx4-TnjQTU4MC9vqCmOz6rx1zSBHE8xIjf.png",
  },
  {
    text: "Amazon",
    username: "feiyuka.base.eth",
    seed: 1994889813,
    date: "2026-01-19T16:54:21Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-1994889813-4vodryuxetd-pCOgpQrRiqEyziK9eiM3BoUJHjMYNq.png",
  },
  {
    text: "Meta",
    username: "ladymel",
    seed: 1663558198,
    date: "2026-01-19T09:04:24Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-1663558198-c2hudv01dvd-wXMxSHTFdOjLpnxfKjzGBbLMtCsray.png",
  },
  {
    text: "Uber",
    username: "ladymel",
    seed: 574705121,
    date: "2026-01-19T08:46:41Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-574705121-a8plecr9r-R5SCahnd16vgL7ZF8go3ce3NLkJ7Gg.png",
  },
  {
    text: "Sony",
    username: "bambunio30",
    seed: 2582855,
    date: "2026-01-19T02:59:50Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-2582855-va1wmjbqp3m-rqZNqn3LiJJ4STLdHJY0CVS9JtzAxj.png",
  },
  {
    text: "The Matrix",
    username: "ladymel",
    seed: 2055809392,
    date: "2026-01-18T18:54:04Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-2055809392-ofu1zpxjdq-DOtx5iEbk8hBcmschdiHaONFQ8G51b.png",
  },
  {
    text: "Ladymel",
    username: "ladymel",
    seed: 106284,
    date: "2026-01-18T18:41:29Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-106284-5eokj8zxg7a-N5Z6U5mLEdoKHJqMF4a17FWJAmSdca.png",
  },
  {
    text: "Arcade",
    username: "ladymel",
    seed: 1969221936,
    date: "2026-01-18T18:10:47Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-1969221936-fet6kybu4kj-M6oWjj8EQzhCzs7q2HAwqqFCxMTWHu.png",
  },
  {
    text: "Sony",
    username: "ladymel",
    seed: 32387987,
    date: "2026-01-18T18:08:35Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-32387987-0ca6z8b10hs7-ISMhz6WkXhO69thqbDk04b9j0RM1zf.png",
  },
  {
    text: "Crt",
    username: "jpechi1191",
    seed: 68037,
    date: "2026-01-18T15:53:12Z",
    logoImageUrl:
      "https://jbynitfoirrg7bu8.public.blob.vercel-storage.com/logo-68037-pd0qlgc1sqs-CrJmZ66mOI2l7L5EXC7K5lvyc6bkgs.png",
  },
];

async function recoverDatabase() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       📦 DATABASE RECOVERY FROM BLOB AUDIT 📦                  ║
║     Restoring GeneratedLogo entries from Vercel Blob storage   ║
╚════════════════════════════════════════════════════════════════╝
`);

  console.log(`\n📋 Processing ${blobAuditData.length} entries...\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const entry of blobAuditData) {
    try {
      const generatedEntry = await prisma.generatedLogo.create({
        data: {
          id: `${entry.seed}-${Date.now()}`, // Unique ID combining seed and timestamp
          text: entry.text,
          seed: entry.seed,
          username:
            entry.username === "Unknown" ? null : entry.username.toLowerCase(),
          displayName: entry.username,
          logoImageUrl: entry.logoImageUrl,
          imageUrl: entry.logoImageUrl, // Also set imageUrl for compatibility
          createdAt: new Date(entry.date),
          updatedAt: new Date(entry.date),
          rarity: "COMMON", // Default, can be updated later
        },
      });

      console.log(`  ✓ ${entry.text} by ${entry.username} (Seed: ${entry.seed})`);
      successCount++;
    } catch (error) {
      console.log(
        `  ✗ ${entry.text} - Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      errors.push({
        text: entry.text,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      errorCount++;
    }
  }

  console.log(`
════════════════════════════════════════════════════════════════════

✅ RECOVERY COMPLETE

  Total entries processed: ${blobAuditData.length}
  ✓ Successfully recovered: ${successCount}
  ✗ Failed: ${errorCount}

════════════════════════════════════════════════════════════════════
`);

  if (errorCount > 0) {
    console.log("❌ ERRORS:\n");
    errors.forEach((err) => {
      console.log(`  - ${err.text}: ${err.error}`);
    });
  }

  // Get current database status
  const totalLogos = await prisma.generatedLogo.count();
  console.log(`\n📊 DATABASE STATUS:\n`);
  console.log(`  Total GeneratedLogo entries: ${totalLogos}`);

  if (totalLogos > 0) {
    const oldestEntry = await prisma.generatedLogo.findFirst({
      orderBy: { createdAt: "asc" },
      select: { text: true, createdAt: true },
    });

    const newestEntry = await prisma.generatedLogo.findFirst({
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true },
    });

    console.log(`  Oldest: ${oldestEntry?.text} (${oldestEntry?.createdAt})`);
    console.log(`  Newest: ${newestEntry?.text} (${newestEntry?.createdAt})`);
  }

  console.log(`
════════════════════════════════════════════════════════════════════

🎉 YOUR DATA HAS BEEN RECOVERED!

Next steps:
  1. Verify data in admin panel: http://localhost:3000/admin/generated-logos
  2. Run: node test-data-recovery.js (verify database)
  3. Run blob audit: http://localhost:3000/admin/generated-logos (check blob stats)

════════════════════════════════════════════════════════════════════
`);

  await prisma.$disconnect();
}

recoverDatabase().catch((error) => {
  console.error("❌ Recovery failed:", error);
  process.exit(1);
});
