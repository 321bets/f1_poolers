/**
 * Update F1 2026 teams and drivers lineup in production database
 * Data sourced from formula1.com on 2026-03-06
 */
const https = require('https');

const API_BASE = 'https://adster.app/api';

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('=== F1 2026 Lineup Update ===\n');

  // ─── 1. Move Tsunoda from Racing Bulls to Red Bull (before deleting team) ───
  console.log('1. Moving Tsunoda to Red Bull...');
  let r = await apiCall('PUT', '/drivers/tsunoda', {
    name: 'Yuki Tsunoda',
    nationality: 'Japanese',
    teamId: 'redbull',
    number: 22,
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025Drivers/tsunoda.jpg.img.1024.medium.jpg'
  });
  console.log(`   → ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);

  // ─── 2. Delete drivers no longer on the grid ───
  console.log('\n2. Removing drivers no longer on 2026 grid...');
  for (const id of ['doohan', 'hadjar', 'lawson']) {
    r = await apiCall('DELETE', `/drivers/${id}`);
    console.log(`   → DELETE ${id}: ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);
  }

  // ─── 3. Delete Racing Bulls team (no longer exists in 2026) ───
  console.log('\n3. Removing Racing Bulls team...');
  r = await apiCall('DELETE', '/teams/racingbulls');
  console.log(`   → ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);

  // ─── 4. Add Franco Colapinto (new driver at Alpine) ───
  console.log('\n4. Adding Franco Colapinto...');
  r = await apiCall('POST', '/drivers', {
    name: 'Franco Colapinto',
    nationality: 'Argentine',
    teamId: 'alpine',
    number: 43,
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/colapinto.jpg.img.1024.medium.jpg'
  });
  console.log(`   → ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);

  // ─── 5. Update all team names and logos to 2026 ───
  console.log('\n5. Updating team names and logos...');
  const teams = [
    { id: 'alpine',      name: 'BWT Alpine Formula One Team',              logoSlug: 'alpine' },
    { id: 'astonmartin', name: 'Aston Martin Aramco Formula One Team',     logoSlug: 'astonmartin' },
    { id: 'audi',        name: 'Audi Revolut F1 Team',                     logoSlug: 'audi' },
    { id: 'cadillac',    name: 'Cadillac Formula 1 Team',                  logoSlug: 'cadillac' },
    { id: 'ferrari',     name: 'Scuderia Ferrari HP',                      logoSlug: 'ferrari' },
    { id: 'haas',        name: 'TGR Haas F1 Team',                         logoSlug: 'haas' },
    { id: 'mclaren',     name: 'McLaren Mastercard F1 Team',               logoSlug: 'mclaren' },
    { id: 'mercedes',    name: 'Mercedes-AMG PETRONAS Formula One Team',   logoSlug: 'mercedes' },
    { id: 'redbull',     name: 'Oracle Red Bull Racing',                   logoSlug: 'redbullracing' },
    { id: 'williams',    name: 'Atlassian Williams F1 Team',               logoSlug: 'williams' },
  ];

  // Team nationalities (keep existing)
  const teamNationalities = {
    alpine: 'French', astonmartin: 'British', audi: 'German', cadillac: 'American',
    ferrari: 'Italian', haas: 'American', mclaren: 'British', mercedes: 'German',
    redbull: 'Austrian', williams: 'British'
  };

  for (const t of teams) {
    const logoUrl = `https://media.formula1.com/image/upload/c_fit,h_64/q_auto/v1740000000/common/f1/2026/${t.logoSlug}/2026${t.logoSlug}logowhite.webp`;
    r = await apiCall('PUT', `/teams/${t.id}`, {
      name: t.name,
      nationality: teamNationalities[t.id],
      logoUrl
    });
    console.log(`   → ${t.id}: ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);
  }

  // ─── 6. Update all driver data (numbers, images) ───
  console.log('\n6. Updating driver data...');
  const drivers = [
    { id: 'albon',      name: 'Alexander Albon',   nationality: 'Thai',        teamId: 'williams',    number: 23, imgYear: '2025' },
    { id: 'alonso',     name: 'Fernando Alonso',    nationality: 'Spanish',     teamId: 'astonmartin', number: 14, imgYear: '2025' },
    { id: 'antonelli',  name: 'Kimi Antonelli',     nationality: 'Italian',     teamId: 'mercedes',    number: 12, imgYear: '2025' },
    { id: 'bearman',    name: 'Oliver Bearman',     nationality: 'British',     teamId: 'haas',        number: 87, imgYear: '2025' },
    { id: 'bortoleto',  name: 'Gabriel Bortoleto',  nationality: 'Brazilian',   teamId: 'audi',        number: 5,  imgYear: '2025' },
    { id: 'bottas',     name: 'Valtteri Bottas',    nationality: 'Finnish',     teamId: 'cadillac',    number: 77, imgYear: '2024' },
    { id: 'gasly',      name: 'Pierre Gasly',       nationality: 'French',      teamId: 'alpine',      number: 10, imgYear: '2025' },
    { id: 'hamilton',   name: 'Lewis Hamilton',     nationality: 'British',     teamId: 'ferrari',     number: 44, imgYear: '2025' },
    { id: 'hulkenberg', name: 'Nico Hulkenberg',    nationality: 'German',      teamId: 'audi',        number: 27, imgYear: '2025' },
    { id: 'leclerc',    name: 'Charles Leclerc',    nationality: 'Monegasque',  teamId: 'ferrari',     number: 16, imgYear: '2025' },
    { id: 'norris',     name: 'Lando Norris',       nationality: 'British',     teamId: 'mclaren',     number: 1,  imgYear: '2025' },
    { id: 'ocon',       name: 'Esteban Ocon',       nationality: 'French',      teamId: 'haas',        number: 31, imgYear: '2025' },
    { id: 'perez',      name: 'Sergio Perez',       nationality: 'Mexican',     teamId: 'cadillac',    number: 11, imgYear: '2024' },
    { id: 'piastri',    name: 'Oscar Piastri',      nationality: 'Australian',  teamId: 'mclaren',     number: 81, imgYear: '2025' },
    { id: 'russell',    name: 'George Russell',     nationality: 'British',     teamId: 'mercedes',    number: 63, imgYear: '2025' },
    { id: 'sainz',      name: 'Carlos Sainz',       nationality: 'Spanish',     teamId: 'williams',    number: 55, imgYear: '2025' },
    { id: 'stroll',     name: 'Lance Stroll',       nationality: 'Canadian',    teamId: 'astonmartin', number: 18, imgYear: '2025' },
    { id: 'tsunoda',    name: 'Yuki Tsunoda',       nationality: 'Japanese',    teamId: 'redbull',     number: 22, imgYear: '2025' },
    { id: 'verstappen', name: 'Max Verstappen',     nationality: 'Dutch',       teamId: 'redbull',     number: 3,  imgYear: '2025' },
  ];

  for (const d of drivers) {
    const imageUrl = `https://media.formula1.com/content/dam/fom-website/drivers/${d.imgYear}Drivers/${d.id}.jpg.img.1024.medium.jpg`;
    r = await apiCall('PUT', `/drivers/${d.id}`, {
      name: d.name,
      nationality: d.nationality,
      teamId: d.teamId,
      number: d.number,
      imageUrl
    });
    console.log(`   → ${d.id}: ${r.status === 200 ? 'OK' : 'FAIL'} (${r.status})`);
  }

  // ─── 7. Verify final state ───
  console.log('\n7. Verifying final state...');
  const teamsResult = await apiCall('GET', '/teams');
  const driversResult = await apiCall('GET', '/drivers');
  
  console.log(`\n   Teams (${teamsResult.data.length}):`);
  teamsResult.data.forEach(t => console.log(`     ${t.id}: ${t.name}`));
  
  console.log(`\n   Drivers (${driversResult.data.length}):`);
  driversResult.data.forEach(d => console.log(`     #${d.number} ${d.name} → ${d.teamName} [${d.imageUrl ? 'has image' : 'NO IMAGE'}]`));

  // Check for missing team: racingbulls should be gone
  const rbTeam = teamsResult.data.find(t => t.id === 'racingbulls');
  if (rbTeam) console.log('\n   ⚠ WARNING: Racing Bulls team still exists!');
  
  // Check for removed drivers
  const removedDrivers = ['doohan', 'hadjar', 'lawson'];
  const remainingRemoved = driversResult.data.filter(d => removedDrivers.includes(d.id));
  if (remainingRemoved.length > 0) {
    console.log(`\n   ⚠ WARNING: Removed drivers still in DB: ${remainingRemoved.map(d=>d.id).join(', ')}`);
  }

  // Check Colapinto was added
  const colapinto = driversResult.data.find(d => d.id === 'francocolapinto' || d.name === 'Franco Colapinto');
  if (!colapinto) console.log('\n   ⚠ WARNING: Colapinto not found in drivers!');
  else console.log(`\n   ✓ Colapinto added: #${colapinto.number} ${colapinto.name} → ${colapinto.teamName}`);

  console.log(`\n   Expected: 10 teams, 20 drivers`);
  console.log(`   Got: ${teamsResult.data.length} teams, ${driversResult.data.length} drivers`);
  
  if (teamsResult.data.length === 10 && driversResult.data.length === 20) {
    console.log('\n=== Update complete! ✓ ===');
  } else {
    console.log('\n=== Update completed with warnings ===');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
