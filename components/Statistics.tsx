import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EventType, Driver } from '../types';

type StatTab = 'drivers' | 'teams';
type EventFilter = 'all' | 'race' | 'qualifying' | 'sprint';

interface DriverStats {
  driverId: string;
  driverName: string;
  driverNumber: number;
  teamName: string;
  teamId: string;
  imageUrl: string;
  totalPoints: number;
  raceEntries: number;
  positions: Record<number, number>; // position -> count
  wins: number;
  podiums: number;
  top5s: number;
  avgPosition: number;
  bestPosition: number;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  logoUrl: string;
  totalPoints: number;
  raceEntries: number;
  positions: Record<number, number>;
  wins: number;
  podiums: number;
  top5s: number;
  avgPosition: number;
  bestPosition: number;
  drivers: string[];
}

// F1-style points system
const POINTS_TABLE: Record<number, number> = {
  0: 25, 1: 18, 2: 15, 3: 12, 4: 10,
};

const SPRINT_POINTS: Record<number, number> = {
  0: 8, 1: 7, 2: 6, 3: 5, 4: 4,
};

interface StatisticsProps {
  onBack?: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ onBack }) => {
  const { results, events, rounds, drivers, teams, users } = useData();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<StatTab>('drivers');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const eventMap = useMemo(() => {
    const map: Record<string, typeof events[0]> = {};
    events.forEach(e => { map[e.id] = e; });
    return map;
  }, [events]);

  const roundMap = useMemo(() => {
    const map: Record<string, typeof rounds[0]> = {};
    rounds.forEach(r => { map[r.id] = r; });
    return map;
  }, [rounds]);

  const teamMap = useMemo(() => {
    const map: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { map[t.id] = t; });
    return map;
  }, [teams]);

  // Supporter counts
  const driverSupporters = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { if (u.supportedDriverId) map[u.supportedDriverId] = (map[u.supportedDriverId] || 0) + 1; });
    return map;
  }, [users]);

  const teamSupporters = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { if (u.supportedTeamId) map[u.supportedTeamId] = (map[u.supportedTeamId] || 0) + 1; });
    return map;
  }, [users]);

  // Filter results by event type
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const ev = eventMap[r.eventId];
      if (!ev) return false;
      if (eventFilter === 'race') return ev.type === EventType.MAIN_RACE;
      if (eventFilter === 'qualifying') return ev.type === EventType.QUALIFYING;
      if (eventFilter === 'sprint') return ev.type === EventType.SPRINT_RACE;
      return true;
    });
  }, [results, eventMap, eventFilter]);

  // Build driver statistics
  const driverStats = useMemo(() => {
    const statsMap: Record<string, DriverStats> = {};

    // Initialize all drivers
    drivers.forEach(d => {
      statsMap[d.id] = {
        driverId: d.id,
        driverName: d.name,
        driverNumber: d.number,
        teamName: d.teamName,
        teamId: d.teamId,
        imageUrl: d.imageUrl,
        totalPoints: 0,
        raceEntries: 0,
        positions: {},
        wins: 0,
        podiums: 0,
        top5s: 0,
        avgPosition: 0,
        bestPosition: 99,
      };
    });

    filteredResults.forEach(result => {
      const ev = eventMap[result.eventId];
      if (!ev) return;
      const isSprint = ev.type === EventType.SPRINT_RACE;
      const pointsTable = isSprint ? SPRINT_POINTS : POINTS_TABLE;

      result.positions.forEach((driver: Driver, index: number) => {
        if (!statsMap[driver.id]) {
          statsMap[driver.id] = {
            driverId: driver.id,
            driverName: driver.name,
            driverNumber: driver.number,
            teamName: driver.teamName,
            teamId: driver.teamId,
            imageUrl: driver.imageUrl,
            totalPoints: 0,
            raceEntries: 0,
            positions: {},
            wins: 0,
            podiums: 0,
            top5s: 0,
            avgPosition: 0,
            bestPosition: 99,
          };
        }

        const stat = statsMap[driver.id];
        const pos = index + 1;
        stat.raceEntries++;
        stat.positions[pos] = (stat.positions[pos] || 0) + 1;
        stat.totalPoints += pointsTable[index] || 0;
        if (pos === 1) stat.wins++;
        if (pos <= 3) stat.podiums++;
        if (pos <= 5) stat.top5s++;
        if (pos < stat.bestPosition) stat.bestPosition = pos;
      });
    });

    return Object.values(statsMap)
      .filter(s => s.raceEntries > 0)
      .map(s => ({
        ...s,
        avgPosition: s.raceEntries > 0
          ? Math.round((Object.entries(s.positions).reduce((sum, [pos, count]) => sum + Number(pos) * count, 0) / s.raceEntries) * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || a.avgPosition - b.avgPosition);
  }, [filteredResults, drivers, eventMap]);

  // Build team statistics
  const teamStats = useMemo(() => {
    const statsMap: Record<string, TeamStats> = {};

    teams.forEach(t => {
      statsMap[t.id] = {
        teamId: t.id,
        teamName: t.name,
        logoUrl: t.logoUrl,
        totalPoints: 0,
        raceEntries: 0,
        positions: {},
        wins: 0,
        podiums: 0,
        top5s: 0,
        avgPosition: 0,
        bestPosition: 99,
        drivers: [],
      };
    });

    // Collect driver-team mapping
    drivers.forEach(d => {
      if (statsMap[d.teamId] && !statsMap[d.teamId].drivers.includes(d.name)) {
        statsMap[d.teamId].drivers.push(d.name);
      }
    });

    filteredResults.forEach(result => {
      const ev = eventMap[result.eventId];
      if (!ev) return;
      const isSprint = ev.type === EventType.SPRINT_RACE;
      const pointsTable = isSprint ? SPRINT_POINTS : POINTS_TABLE;

      result.positions.forEach((driver: Driver, index: number) => {
        const teamId = driver.teamId;
        if (!statsMap[teamId]) return;

        const stat = statsMap[teamId];
        const pos = index + 1;
        stat.raceEntries++;
        stat.positions[pos] = (stat.positions[pos] || 0) + 1;
        stat.totalPoints += pointsTable[index] || 0;
        if (pos === 1) stat.wins++;
        if (pos <= 3) stat.podiums++;
        if (pos <= 5) stat.top5s++;
        if (pos < stat.bestPosition) stat.bestPosition = pos;
      });
    });

    return Object.values(statsMap)
      .filter(s => s.raceEntries > 0)
      .map(s => ({
        ...s,
        avgPosition: s.raceEntries > 0
          ? Math.round((Object.entries(s.positions).reduce((sum, [pos, count]) => sum + Number(pos) * count, 0) / s.raceEntries) * 10) / 10
          : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || a.avgPosition - b.avgPosition);
  }, [filteredResults, teams, drivers, eventMap]);

  const maxPositions = useMemo(() => {
    const all = activeTab === 'drivers' ? driverStats : teamStats;
    let max = 5;
    all.forEach(s => {
      Object.keys(s.positions).forEach(p => {
        if (Number(p) > max) max = Number(p);
      });
    });
    return max;
  }, [driverStats, teamStats, activeTab]);

  const eventsWithResults = useMemo(() => {
    return filteredResults.map(r => {
      const ev = eventMap[r.eventId];
      const round = ev ? roundMap[ev.roundId] : null;
      return { result: r, event: ev, round };
    }).filter(e => e.event && e.round);
  }, [filteredResults, eventMap, roundMap]);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <i className="fas fa-chart-bar text-5xl mb-4 text-gray-600"></i>
        <p className="text-lg font-bold">{t('statsNoData')}</p>
        <p className="text-sm mt-1">{t('statsNoDataDesc')}</p>
      </div>
    );
  }

  const renderPositionBadge = (pos: number) => {
    if (pos === 1) return <span className="text-yellow-400 font-black">P1</span>;
    if (pos === 2) return <span className="text-gray-300 font-black">P2</span>;
    if (pos === 3) return <span className="text-amber-600 font-black">P3</span>;
    return <span className="text-gray-400 font-bold">P{pos}</span>;
  };

  const stats = activeTab === 'drivers' ? driverStats : teamStats;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 border-t-4 border-red-600">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <i className="fas fa-chart-line text-red-500 text-2xl"></i>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">{t('statistics')}</h2>
            {onBack && (
              <button onClick={onBack} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded-full text-xs uppercase tracking-wider transition-colors">
                Go Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">{t('statsEventsRecorded')}:</span>
            <span className="text-white font-bold">{filteredResults.length}</span>
          </div>
        </div>
      </div>

      {/* Tab + Filter Bar */}
      <div className="bg-gray-800 rounded-lg p-3 flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Tabs */}
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => { setActiveTab('drivers'); setExpandedRow(null); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'drivers' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            <i className="fas fa-user mr-1"></i> {t('statDrivers')}
          </button>
          <button
            onClick={() => { setActiveTab('teams'); setExpandedRow(null); }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'teams' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            <i className="fas fa-users mr-1"></i> {t('statTeams')}
          </button>
        </div>

        {/* Event Type Filter */}
        <div className="flex gap-1 flex-wrap justify-center">
          {(['all', 'race', 'qualifying', 'sprint'] as EventFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setEventFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase transition-colors ${eventFilter === f ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'}`}
            >
              {t(`statFilter_${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-gray-400 uppercase text-xs">
                <th className="py-3 px-3 text-left">#</th>
                <th className="py-3 px-3 text-left">{activeTab === 'drivers' ? t('statDriver') : t('statTeam')}</th>
                <th className="py-3 px-3 text-center">{t('statPts')}</th>
                <th className="py-3 px-3 text-center">{t('statWins')}</th>
                <th className="py-3 px-3 text-center">{t('statPodiums')}</th>
                <th className="py-3 px-3 text-center">{t('statTop5')}</th>
                <th className="py-3 px-3 text-center">{t('statEntries')}</th>
                <th className="py-3 px-3 text-center">{t('statAvgPos')}</th>
                <th className="py-3 px-3 text-center">{t('statBestPos')}</th>
                <th className="py-3 px-3 text-center"><i className="fas fa-heart text-red-500 mr-1"></i>{t('statFans')}</th>
                {Array.from({ length: Math.min(maxPositions, 5) }, (_, i) => (
                  <th key={i} className="py-3 px-2 text-center text-xs">P{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, idx) => {
                const isDriver = activeTab === 'drivers';
                const ds = stat as DriverStats;
                const ts = stat as TeamStats;
                const id = isDriver ? ds.driverId : ts.teamId;
                const isExpanded = expandedRow === id;

                return (
                  <React.Fragment key={id}>
                    <tr
                      className={`border-t border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${idx === 0 ? 'bg-yellow-900/10' : idx === 1 ? 'bg-gray-700/20' : idx === 2 ? 'bg-amber-900/10' : ''}`}
                      onClick={() => setExpandedRow(isExpanded ? null : id)}
                    >
                      <td className="py-3 px-3 font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {isDriver ? (
                            <img src={ds.imageUrl} alt={ds.driverName} className="w-8 h-8 rounded-full border border-gray-600" />
                          ) : (
                            <img src={ts.logoUrl} alt={ts.teamName} className="w-8 h-8 rounded-full bg-white p-0.5 border border-gray-600" />
                          )}
                          <div>
                            <span className="text-white font-bold text-sm">{isDriver ? ds.driverName : ts.teamName}</span>
                            {isDriver && <p className="text-gray-500 text-xs">{ds.teamName} #{ds.driverNumber}</p>}
                            {!isDriver && <p className="text-gray-500 text-xs">{ts.drivers.join(', ')}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-white text-base">{stat.totalPoints}</td>
                      <td className="py-3 px-3 text-center text-yellow-400 font-bold">{stat.wins}</td>
                      <td className="py-3 px-3 text-center text-gray-300 font-bold">{stat.podiums}</td>
                      <td className="py-3 px-3 text-center text-gray-300">{stat.top5s}</td>
                      <td className="py-3 px-3 text-center text-gray-400">{stat.raceEntries}</td>
                      <td className="py-3 px-3 text-center text-gray-300">{stat.avgPosition}</td>
                      <td className="py-3 px-3 text-center">{renderPositionBadge(stat.bestPosition)}</td>
                      <td className="py-3 px-3 text-center text-red-400 font-bold">{(isDriver ? driverSupporters[ds.driverId] : teamSupporters[ts.teamId]) || 0}</td>
                      {Array.from({ length: Math.min(maxPositions, 5) }, (_, i) => (
                        <td key={i} className="py-3 px-2 text-center text-gray-400 text-xs">{stat.positions[i + 1] || 0}</td>
                      ))}
                    </tr>
                    {/* Expanded row: event-by-event breakdown */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={10 + Math.min(maxPositions, 5)} className="bg-gray-900 p-0">
                          <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                              <i className="fas fa-history mr-1"></i> {t('statEventBreakdown')}
                            </h4>
                            <div className="grid gap-2">
                              {eventsWithResults.map(({ result, event, round }) => {
                                if (!event || !round) return null;
                                const posIndex = result.positions.findIndex(
                                  (d: Driver) => isDriver ? d.id === ds.driverId : d.teamId === ts.teamId
                                );
                                if (posIndex === -1) return null;
                                const pos = posIndex + 1;
                                const isSprint = event.type === EventType.SPRINT_RACE;
                                const pts = (isSprint ? SPRINT_POINTS : POINTS_TABLE)[posIndex] || 0;

                                return (
                                  <div key={result.eventId} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2 text-xs">
                                    <div className="flex items-center gap-3">
                                      <span className="text-gray-500 w-24 truncate">{round.name}</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${event.type === EventType.MAIN_RACE ? 'bg-red-900/40 text-red-400' : event.type === EventType.SPRINT_RACE ? 'bg-orange-900/40 text-orange-400' : 'bg-blue-900/40 text-blue-400'}`}>
                                        {event.type}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {renderPositionBadge(pos)}
                                      <span className="text-white font-bold w-8 text-right">+{pts}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-700">
          {stats.map((stat, idx) => {
            const isDriver = activeTab === 'drivers';
            const ds = stat as DriverStats;
            const ts = stat as TeamStats;
            const id = isDriver ? ds.driverId : ts.teamId;
            const isExpanded = expandedRow === id;

            return (
              <div key={id} className={`p-3 ${idx === 0 ? 'bg-yellow-900/10' : ''}`} onClick={() => setExpandedRow(isExpanded ? null : id)}>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-bold text-sm w-6">{idx + 1}</span>
                  {isDriver ? (
                    <img src={ds.imageUrl} alt={ds.driverName} className="w-10 h-10 rounded-full border border-gray-600" />
                  ) : (
                    <img src={ts.logoUrl} alt={ts.teamName} className="w-10 h-10 rounded-full bg-white p-0.5 border border-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{isDriver ? ds.driverName : ts.teamName}</p>
                    {isDriver && <p className="text-gray-500 text-xs">{ds.teamName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-lg">{stat.totalPoints}</p>
                    <p className="text-gray-500 text-xs">{t('statPts')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2 text-center text-xs">
                  <div>
                    <p className="text-yellow-400 font-bold">{stat.wins}</p>
                    <p className="text-gray-500">{t('statWins')}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-bold">{stat.podiums}</p>
                    <p className="text-gray-500">{t('statPodiums')}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">{stat.avgPosition}</p>
                    <p className="text-gray-500">{t('statAvgPos')}</p>
                  </div>
                  <div>
                    <p>{renderPositionBadge(stat.bestPosition)}</p>
                    <p className="text-gray-500">{t('statBestPos')}</p>
                  </div>
                  <div>
                    <p className="text-red-400 font-bold"><i className="fas fa-heart text-[10px] mr-0.5"></i>{(isDriver ? driverSupporters[ds.driverId] : teamSupporters[ts.teamId]) || 0}</p>
                    <p className="text-gray-500">{t('statFans')}</p>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 border-t border-gray-700 pt-3 max-h-48 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('statEventBreakdown')}</h4>
                    {eventsWithResults.map(({ result, event, round }) => {
                      if (!event || !round) return null;
                      const posIndex = result.positions.findIndex(
                        (d: Driver) => isDriver ? d.id === ds.driverId : d.teamId === ts.teamId
                      );
                      if (posIndex === -1) return null;
                      const pos = posIndex + 1;
                      const isSprint = event.type === EventType.SPRINT_RACE;
                      const pts = (isSprint ? SPRINT_POINTS : POINTS_TABLE)[posIndex] || 0;
                      return (
                        <div key={result.eventId} className="flex items-center justify-between py-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 truncate max-w-[80px]">{round.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${event.type === EventType.MAIN_RACE ? 'bg-red-900/40 text-red-400' : event.type === EventType.SPRINT_RACE ? 'bg-orange-900/40 text-orange-400' : 'bg-blue-900/40 text-blue-400'}`}>
                              {event.type === EventType.MAIN_RACE ? 'R' : event.type === EventType.SPRINT_RACE ? 'S' : 'Q'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderPositionBadge(pos)}
                            <span className="text-white font-bold">+{pts}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
