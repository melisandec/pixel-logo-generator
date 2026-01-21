// Test the gallery API with the merged query logic
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testGalleryAPI() {
  console.log('\n=== TESTING MERGED GALLERY API ===\n');

  try {
    // Test recent sort
    console.log('1. Testing sort=recent (should show data from both tables):');
    const recentRes = await fetch(`${BASE_URL}/api/generated-logos?sort=recent&limit=50`);
    const recentData = await recentRes.json();
    console.log(`   Status: ${recentRes.status}`);
    console.log(`   Total entries returned: ${recentData.entries?.length || 0}`);

    if (recentData.entries?.length > 0) {
      console.log('   Sample entries:');
      recentData.entries.slice(0, 5).forEach((entry: any, i: number) => {
        console.log(`   [${i + 1}] ${entry.username}: "${entry.text}"`);
        console.log(`       Date: ${entry.createdAt}, Casted: ${entry.casted}`);
      });
    }

    // Test likes sort
    console.log('\n2. Testing sort=likes (highest likes first):');
    const likesRes = await fetch(`${BASE_URL}/api/generated-logos?sort=likes&limit=20`);
    const likesData = await likesRes.json();
    console.log(`   Status: ${likesRes.status}`);
    console.log(`   Total entries returned: ${likesData.entries?.length || 0}`);

    if (likesData.entries?.length > 0) {
      console.log('   Top entries:');
      likesData.entries.slice(0, 3).forEach((entry: any, i: number) => {
        console.log(`   [${i + 1}] ${entry.username}: ${entry.likes} likes`);
      });
    }

    // Test default score sort
    console.log('\n3. Testing default score sort (trending):');
    const scoreRes = await fetch(`${BASE_URL}/api/generated-logos?limit=20`);
    const scoreData = await scoreRes.json();
    console.log(`   Status: ${scoreRes.status}`);
    console.log(`   Total entries returned: ${scoreData.entries?.length || 0}`);

    // Test casted parameter
    console.log('\n4. Testing casted=true (cast gallery):');
    const castedRes = await fetch(`${BASE_URL}/api/generated-logos?casted=true&sort=recent&limit=50`);
    const castedData = await castedRes.json();
    console.log(`   Status: ${castedRes.status}`);
    console.log(`   Total casted entries returned: ${castedData.entries?.length || 0}`);

    if (castedData.entries?.length > 0) {
      console.log('   Casted entries:');
      castedData.entries.slice(0, 3).forEach((entry: any, i: number) => {
        console.log(`   [${i + 1}] ${entry.username}: "${entry.text}"`);
        console.log(`       Casted: ${entry.casted}, URL: ${entry.castUrl ? 'YES' : 'NO'}`);
      });
    }

    console.log('\n=== TEST COMPLETE ===\n');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testGalleryAPI();
