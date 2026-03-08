
import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { EventStatus, EventType } from '../../types';

// Simple bar chart component
const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; title: string; maxBars?: number }> = ({ data, title, maxBars }) => {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const display = maxBars ? sorted.slice(0, maxBars) : sorted;
  const max = Math.max(...display.map(d => d.value), 1);
  return (
    <div>
      <h4 className="text-[10px] text-gray-500 font-black uppercase mb-2">{title}</h4>
      <div className="space-y-1.5">
        {display.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 w-20 truncate text-right font-bold" title={d.label}>{d.label}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-500"
                style={{ width: `${Math.max((d.value / max) * 100, 8)}%`, backgroundColor: d.color || '#e10600' }}
              >
                <span className="text-[8px] text-white font-black">{d.value}</span>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-[10px] text-gray-600 italic">No data</p>}
      </div>
    </div>
  );
};

// Donut chart component
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string; size?: number }> = ({ data, title, size = 100 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - 10) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-[10px] text-gray-500 font-black uppercase mb-2">{title}</h4>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((d, i) => {
          const pct = d.value / total;
          const dashLen = pct * circumference;
          const dashOffset = -offset;
          offset += dashLen;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth={12}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={r - 14} fill="#1a1a24" />
      </svg>
      <div className="text-center -mt-[62px] mb-6">
        <div className="text-lg font-black text-white">{total}</div>
        <div className="text-[8px] text-gray-500 uppercase font-bold">Total</div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span className="text-[8px] text-gray-400 font-bold">{d.label} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mini sparkline
const Sparkline: React.FC<{ values: number[]; color?: string }> = ({ values, color = '#e10600' }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 30;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// KPI Card
const KPI: React.FC<{ icon: string; label: string; value: string | number; sub?: string; color?: string; sparkData?: number[] }> = ({ icon, label, value, sub, color = '#e10600', sparkData }) => (
  <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3 flex flex-col justify-between">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[9px] text-gray-500 font-black uppercase">{label}</span>
      <i className={`fas ${icon} text-xs`} style={{ color }}></i>
    </div>
    <div className="text-xl font-black text-white">{value}</div>
    {sub && <div className="text-[9px] text-gray-500 font-bold">{sub}</div>}
    {sparkData && sparkData.length > 1 && <div className="mt-1"><Sparkline values={sparkData} color={color} /></div>}
  </div>
);

const OverviewDashboard: React.FC = () => {
  const { users, allBets, events, results, leagues, rounds, drivers, teams } = useData();

  const stats = useMemo(() => {
    // --- USER STATS ---
    const totalUsers = users.length;
    const admins = users.filter(u => u.isAdmin).length;
    const withAge = users.filter(u => u.age);
    const avgAge = withAge.length ? Math.round(withAge.reduce((s, u) => s + (u.age || 0), 0) / withAge.length) : 0;
    const totalBalance = users.reduce((s, u) => s + u.balance, 0);
    const avgBalance = totalUsers ? Math.round(totalBalance / totalUsers) : 0;
    const totalPoints = users.reduce((s, u) => s + u.points, 0);

    // Country breakdown
    const countryMap: Record<string, number> = {};
    users.forEach(u => { const c = u.country || 'Unknown'; countryMap[c] = (countryMap[c] || 0) + 1; });
    const countryData = Object.entries(countryMap).map(([label, value]) => ({ label, value }));

    // Age brackets
    const ageBrackets = [
      { label: '<18', min: 0, max: 17, count: 0 },
      { label: '18-24', min: 18, max: 24, count: 0 },
      { label: '25-34', min: 25, max: 34, count: 0 },
      { label: '35-44', min: 35, max: 44, count: 0 },
      { label: '45-54', min: 45, max: 54, count: 0 },
      { label: '55+', min: 55, max: 200, count: 0 },
    ];
    users.forEach(u => {
      if (u.age) {
        const bracket = ageBrackets.find(b => u.age! >= b.min && u.age! <= b.max);
        if (bracket) bracket.count++;
      }
    });
    const ageColors = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const ageData = ageBrackets.filter(b => b.count > 0).map((b, i) => ({ label: b.label, value: b.count, color: ageColors[i] }));

    // --- BETTING STATS ---
    const totalBets = allBets.length;
    const activeBets = allBets.filter(b => b.status === 'Active').length;
    const settledBets = allBets.filter(b => b.status === 'Settled').length;
    const cancelledBets = allBets.filter(b => b.status === 'Cancelled').length;
    const avgMultiplier = totalBets ? (allBets.reduce((s, b) => s + b.lockedMultiplier, 0) / totalBets).toFixed(2) : '0';
    
    // Bets with driver predictions vs team predictions
    const driverOnlyBets = allBets.filter(b => b.predictions?.length > 0 && (!b.teamPredictions || b.teamPredictions.length === 0)).length;
    const teamOnlyBets = allBets.filter(b => (!b.predictions || b.predictions.length === 0) && b.teamPredictions?.length > 0).length;
    const comboBets = allBets.filter(b => b.predictions?.length > 0 && b.teamPredictions?.length > 0).length;

    const betTypeData = [
      { label: 'Driver Only', value: driverOnlyBets, color: '#e10600' },
      { label: 'Team Only', value: teamOnlyBets, color: '#3b82f6' },
      { label: 'Combo', value: comboBets, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    const betStatusData = [
      { label: 'Active', value: activeBets, color: '#10b981' },
      { label: 'Settled', value: settledBets, color: '#6366f1' },
      { label: 'Cancelled', value: cancelledBets, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // --- EVENT STATS ---
    const totalEvents = events.length;
    const finishedEvents = events.filter(e => e.status === EventStatus.FINISHED).length;
    const liveEvents = events.filter(e => e.status === EventStatus.LIVE).length;
    const upcomingEvents = events.filter(e => e.status === EventStatus.UPCOMING).length;
    const totalPrizePool = events.reduce((s, e) => s + e.poolPrize, 0);

    const eventTypeData = [
      { label: 'Main Race', value: events.filter(e => e.type === EventType.MAIN_RACE).length, color: '#e10600' },
      { label: 'Qualifying', value: events.filter(e => e.type === EventType.QUALIFYING).length, color: '#3b82f6' },
      { label: 'Sprint Race', value: events.filter(e => e.type === EventType.SPRINT_RACE).length, color: '#f59e0b' },
    ].filter(d => d.value > 0);

    // --- BETS PER ROUND (for trend sparkline) ---
    const sortedRounds = [...rounds].sort((a, b) => a.number - b.number);
    const betsPerRound = sortedRounds.map(round => {
      const roundEvents = events.filter(e => e.roundId === round.id);
      return allBets.filter(b => roundEvents.some(e => e.id === b.eventId)).length;
    });

    // --- LEAGUE STATS ---
    const totalLeagues = leagues.length;
    const privateLeagues = leagues.filter(l => l.isPrivate).length;
    const publicLeagues = totalLeagues - privateLeagues;
    const avgMembers = totalLeagues ? (leagues.reduce((s, l) => s + l.members.length, 0) / totalLeagues).toFixed(1) : '0';
    const totalMessages = leagues.reduce((s, l) => s + l.messages.length, 0);
    const leaguesWithPrize = leagues.filter(l => l.prize).length;

    // --- RESULTS / JACKPOT STATS ---
    const totalResultEvents = results.length;
    const totalPrizeDistributed = results.reduce((s, r) => s + r.totalPrizePool, 0);
    const totalWinners = results.reduce((s, r) => s + r.winners.length, 0);
    const jackpotEvents = results.filter(r => r.winners.some(w => w.prizeAmount > 0)).length;

    // --- TOP USERS BY POINTS ---
    const topUsers = [...users].sort((a, b) => b.points - a.points).slice(0, 8).map(u => ({ label: u.username, value: u.points }));

    // --- TOP USERS BY BALANCE ---
    const topBalance = [...users].sort((a, b) => b.balance - a.balance).slice(0, 8).map(u => ({ label: u.username, value: u.balance }));

    // --- ENGAGEMENT: Users with bets vs without ---
    const usersWithBets = new Set(allBets.map(b => b.userId)).size;
    const usersNoBets = totalUsers - usersWithBets;
    const engagementData = [
      { label: 'Active Bettors', value: usersWithBets, color: '#10b981' },
      { label: 'No Bets Yet', value: usersNoBets, color: '#4b5563' },
    ].filter(d => d.value > 0);

    // --- USERS IN LEAGUES ---
    const usersInLeagues = new Set(leagues.flatMap(l => l.members)).size;
    const usersNoLeague = totalUsers - usersInLeagues;
    const leagueEngagement = [
      { label: 'In League', value: usersInLeagues, color: '#6366f1' },
      { label: 'No League', value: usersNoLeague, color: '#4b5563' },
    ].filter(d => d.value > 0);

    // --- MOST BET-ON EVENT TYPES ---
    const betsByEventType: Record<string, number> = {};
    allBets.forEach(b => {
      const ev = events.find(e => e.id === b.eventId);
      if (ev) betsByEventType[ev.type] = (betsByEventType[ev.type] || 0) + 1;
    });
    const betsByEventTypeData = Object.entries(betsByEventType).map(([label, value]) => ({ label, value }));

    // --- RETENTION: Bets per user histogram ---
    const betsPerUser: Record<string, number> = {};
    allBets.forEach(b => { betsPerUser[b.userId] = (betsPerUser[b.userId] || 0) + 1; });
    const betsPerUserBuckets = [
      { label: '1 bet', min: 1, max: 1, count: 0 },
      { label: '2-3', min: 2, max: 3, count: 0 },
      { label: '4-6', min: 4, max: 6, count: 0 },
      { label: '7-10', min: 7, max: 10, count: 0 },
      { label: '11+', min: 11, max: 9999, count: 0 },
    ];
    Object.values(betsPerUser).forEach(count => {
      const b = betsPerUserBuckets.find(bk => count >= bk.min && count <= bk.max);
      if (b) b.count++;
    });
    const retentionColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'];
    const retentionData = betsPerUserBuckets.filter(b => b.count > 0).map((b, i) => ({ label: b.label, value: b.count, color: retentionColors[i] }));

    // --- PERFORMANCE BY COUNTRY ---
    const countryPerf: Record<string, { users: number; totalPoints: number }> = {};
    users.forEach(u => {
      const c = u.country || 'Unknown';
      if (!countryPerf[c]) countryPerf[c] = { users: 0, totalPoints: 0 };
      countryPerf[c].users++;
      countryPerf[c].totalPoints += u.points;
    });
    const countryPerformance = Object.entries(countryPerf)
      .map(([country, d]) => ({ country, users: d.users, totalPoints: d.totalPoints, avgPoints: d.users ? Math.round((d.totalPoints / d.users) * 10) / 10 : 0 }))
      .sort((a, b) => b.avgPoints - a.avgPoints);

    // --- SUPPORTER / FAN DATA ---
    const driverFanMap: Record<string, number> = {};
    const teamFanMap: Record<string, number> = {};
    users.forEach(u => {
      if (u.supportedDriverId) driverFanMap[u.supportedDriverId] = (driverFanMap[u.supportedDriverId] || 0) + 1;
      if (u.supportedTeamId) teamFanMap[u.supportedTeamId] = (teamFanMap[u.supportedTeamId] || 0) + 1;
    });
    const driverFansData = Object.entries(driverFanMap)
      .map(([id, value]) => { const d = drivers.find(dr => dr.id === id); return { label: d ? d.name : id, value }; })
      .sort((a, b) => b.value - a.value);
    const teamFansData = Object.entries(teamFanMap)
      .map(([id, value]) => { const tm = teams.find(t => t.id === id); return { label: tm ? tm.name : id, value }; })
      .sort((a, b) => b.value - a.value);
    const totalFans = users.filter(u => u.supportedDriverId || u.supportedTeamId).length;

    return {
      totalUsers, admins, avgAge, totalBalance, avgBalance, totalPoints,
      countryData, ageData,
      totalBets, activeBets, settledBets, cancelledBets, avgMultiplier,
      betTypeData, betStatusData,
      totalEvents, finishedEvents, liveEvents, upcomingEvents, totalPrizePool,
      eventTypeData, betsPerRound,
      totalLeagues, privateLeagues, publicLeagues, avgMembers, totalMessages, leaguesWithPrize,
      totalResultEvents, totalPrizeDistributed, totalWinners, jackpotEvents,
      topUsers, topBalance,
      engagementData, leagueEngagement,
      betsByEventTypeData, retentionData,
      driverOnlyBets, teamOnlyBets, comboBets, usersWithBets,
      countryPerformance,
      driverFansData, teamFansData, totalFans,
    };
  }, [users, allBets, events, results, leagues, rounds, drivers, teams]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e10600]/20 via-[#1a1a24] to-[#1a1a24] border border-red-900/30 rounded-lg p-4">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
          <i className="fas fa-chart-line text-red-500"></i> Platform Overview
        </h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Real-time analytics & audience behaviour</p>
      </div>

      {/* KPI Row 1: Core Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KPI icon="fa-users" label="Total Users" value={stats.totalUsers} sub={`${stats.admins} admin(s)`} color="#3b82f6" />
        <KPI icon="fa-receipt" label="Total Bets" value={stats.totalBets} sub={`${stats.activeBets} active`} color="#e10600" sparkData={stats.betsPerRound} />
        <KPI icon="fa-flag-checkered" label="Events" value={stats.totalEvents} sub={`${stats.finishedEvents} finished`} color="#f59e0b" />
        <KPI icon="fa-trophy" label="Jackpot Wins" value={stats.jackpotEvents} sub={`${stats.totalWinners} winner(s)`} color="#10b981" />
        <KPI icon="fa-users-cog" label="Leagues" value={stats.totalLeagues} sub={`avg ${stats.avgMembers} members`} color="#6366f1" />
        <KPI icon="fa-coins" label="Total Pool" value={`${stats.totalPrizePool.toLocaleString()}`} sub="Fun-Coins in events" color="#f59e0b" />
      </div>

      {/* KPI Row 2: Deeper Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KPI icon="fa-wallet" label="Avg Balance" value={stats.avgBalance} sub="per user" color="#06b6d4" />
        <KPI icon="fa-star" label="Total Points" value={stats.totalPoints.toLocaleString()} color="#f59e0b" />
        <KPI icon="fa-birthday-cake" label="Avg Age" value={stats.avgAge || 'N/A'} color="#a855f7" />
        <KPI icon="fa-bolt" label="Avg Multiplier" value={`${stats.avgMultiplier}x`} color="#10b981" />
        <KPI icon="fa-comment-dots" label="Chat Messages" value={stats.totalMessages} sub="across leagues" color="#3b82f6" />
        <KPI icon="fa-medal" label="Prize Distributed" value={stats.totalPrizeDistributed.toLocaleString()} sub="Fun-Coins won" color="#e10600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <DonutChart data={stats.engagementData} title="User Engagement" size={100} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <DonutChart data={stats.betStatusData} title="Bet Status" size={100} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <DonutChart data={stats.betTypeData} title="Bet Types" size={100} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <DonutChart data={stats.leagueEngagement} title="League Participation" size={100} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <BarChart data={stats.countryData} title="Users by Country" maxBars={10} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <BarChart data={stats.ageData} title="Age Distribution" />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <BarChart data={stats.retentionData} title="Bets per User (Retention)" />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <BarChart data={stats.topUsers} title="Top Users by Points" maxBars={8} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <BarChart data={stats.topBalance} title="Top Users by Balance" maxBars={8} />
        </div>
        <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
          <DonutChart data={stats.eventTypeData} title="Events by Type" size={100} />
        </div>
      </div>

      {/* Fan Support */}
      <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
        <h4 className="text-[10px] text-gray-500 font-black uppercase mb-3 flex items-center gap-2">
          <i className="fas fa-heart text-red-500"></i> Fan Support ({stats.totalFans} users have declared support)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BarChart data={stats.driverFansData} title="Most Supported Drivers" maxBars={10} />
          <BarChart data={stats.teamFansData} title="Most Supported Teams" maxBars={10} />
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
        <h4 className="text-[10px] text-gray-500 font-black uppercase mb-3">Bets by Event Type</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-[9px] uppercase font-black border-b border-gray-800">
                <th className="text-left pb-2">Event Type</th>
                <th className="text-right pb-2">Total Bets</th>
                <th className="text-right pb-2">% of All Bets</th>
                <th className="text-right pb-2">Popularity</th>
              </tr>
            </thead>
            <tbody>
              {stats.betsByEventTypeData.sort((a, b) => b.value - a.value).map((row, i) => (
                <tr key={i} className="border-b border-gray-800/50 text-gray-300">
                  <td className="py-1.5 font-bold">{row.label}</td>
                  <td className="text-right">{row.value}</td>
                  <td className="text-right">{stats.totalBets ? ((row.value / stats.totalBets) * 100).toFixed(1) : 0}%</td>
                  <td className="text-right">
                    <div className="inline-block w-16 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats.totalBets ? (row.value / stats.totalBets) * 100 : 0}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance by Country */}
      <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
        <h4 className="text-[10px] text-gray-500 font-black uppercase mb-3 flex items-center gap-2">
          <i className="fas fa-globe-americas text-red-500"></i> Performance by Country
        </h4>
        <p className="text-[9px] text-gray-600 mb-3">Ranked by average points per user — reflects strategy quality, not volume.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 text-[9px] uppercase font-black border-b border-gray-800">
                <th className="text-left pb-2 w-8">#</th>
                <th className="text-left pb-2">Country</th>
                <th className="text-right pb-2">Users</th>
                <th className="text-right pb-2">Total Points</th>
                <th className="text-right pb-2">Avg Points/User</th>
                <th className="text-right pb-2 w-24">Performance</th>
              </tr>
            </thead>
            <tbody>
              {stats.countryPerformance.map((row, i) => {
                const topAvg = stats.countryPerformance[0]?.avgPoints || 1;
                return (
                  <tr key={row.country} className="border-b border-gray-800/50 text-gray-300 hover:bg-gray-800/30 transition-colors">
                    <td className="py-1.5">
                      <span className={`font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-1.5 font-bold">{row.country}</td>
                    <td className="text-right">{row.users}</td>
                    <td className="text-right">{row.totalPoints.toLocaleString()}</td>
                    <td className="text-right font-black text-white">{row.avgPoints.toLocaleString()}</td>
                    <td className="text-right">
                      <div className="inline-block w-20 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(row.avgPoints / topAvg) * 100}%`, backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#e10600' }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {stats.countryPerformance.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-600 py-4 italic">No user data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* League Summary Table */}
      <div className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3">
        <h4 className="text-[10px] text-gray-500 font-black uppercase mb-3">League Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-gray-800/50 rounded p-2 text-center">
            <div className="text-lg font-black text-indigo-400">{stats.publicLeagues}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase">Public</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2 text-center">
            <div className="text-lg font-black text-yellow-400">{stats.privateLeagues}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase">Private</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2 text-center">
            <div className="text-lg font-black text-green-400">{stats.leaguesWithPrize}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase">With Prizes</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2 text-center">
            <div className="text-lg font-black text-blue-400">{stats.totalMessages}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase">Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
