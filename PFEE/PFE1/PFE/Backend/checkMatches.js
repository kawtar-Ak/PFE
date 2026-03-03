const mongoose = require('mongoose');
const MatchModel = require('./Match/MatchModel');

mongoose.connect('mongodb://127.0.0.1:27017/PFE').then(async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 48 * 60 * 60 * 1000);
    
    console.log(`📅 Aujourd'hui: ${today.toLocaleDateString()}`);
    console.log(`📅 Demain: ${tomorrow.toLocaleDateString()}\n`);
    
    // Chercher les matches prévus
    const scheduledMatches = await MatchModel
      .find({
        $or: [
          { status: 'scheduled', date: { $gte: now, $lte: tomorrow } },
          { status: 'live', date: { $gte: now, $lte: tomorrow } },
          { status: 'finished', date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } }
        ]
      })
      .limit(20);
    
    console.log(`\n=== Matches pour Direct (0-48h & FINISHED aujourd'hui) ===`);
    console.log(`Total trouvé: ${scheduledMatches.length}\n`);
    
    scheduledMatches.forEach((m, i) => {
      const matchDate = new Date(m.date);
      console.log(`${i+1}. ${m.homeTeam} vs ${m.awayTeam}`);
      console.log(`   Date: ${matchDate.toLocaleString()}`);
      console.log(`   Statut: ${m.status.toUpperCase()} | Ligue: ${m.league}`);
      if (m.homeScore !== null) console.log(`   Score: ${m.homeScore} - ${m.awayScore}`);
    });
    
    // Statistiques globales
    const stats = await MatchModel.aggregate([
      { 
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byLeague: [
            { $group: { _id: '$league', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);
    
    console.log('\n=== Statistiques ===');
    console.log('Par statut:');
    stats[0].byStatus.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
    console.log('\nPar ligue:');
    stats[0].byLeague.forEach(l => console.log(`  ${l._id}: ${l.count}`));
    
    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e);
    process.exit(1);
  }
});
