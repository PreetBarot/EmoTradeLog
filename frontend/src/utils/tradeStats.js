export const calculateTradeStats = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      wins: 0,
      losses: 0,
      avgWinner: 0,
      avgLoser: 0,
      bestTrade: 0,
      worstTrade: 0,
      expectancy: 0,
      maxWinStreak: 0,
      maxLossStreak: 0,
      totalTradingDays: 0,
      winningDays: 0,
      losingDays: 0,
      breakevenDays: 0,
      avgDailyPnl: 0,
      avgWinningDayPnl: 0,
      avgLosingDayPnl: 0,
      largestProfitableDay: 0,
      largestLosingDay: 0,
      bestMonth: { name: 'N/A', pnl: 0 },
      worstMonth: { name: 'N/A', pnl: 0 },
      avgMonthlyPnl: 0,
    };
  }

  // Filter for trades that have a PnL to count as closed
  const closedTrades = trades.filter(t => t.pnl !== undefined && t.pnl !== null);
  const totalTrades = closedTrades.length;

  let totalPnl = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let bestTrade = 0;
  let worstTrade = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  const dailyPnL = {};
  const monthlyPnL = {};

  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedTrades.forEach(trade => {
    const pnl = Number(trade.pnl);
    totalPnl += pnl;

    const date = new Date(trade.date);
    const dateStr = date.toDateString();
    if (!dailyPnL[dateStr]) dailyPnL[dateStr] = 0;
    dailyPnL[dateStr] += pnl;

    const monthStr = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthlyPnL[monthStr]) monthlyPnL[monthStr] = 0;
    monthlyPnL[monthStr] += pnl;

    if (pnl > 0) {
      grossProfit += pnl;
      wins += 1;
      if (pnl > bestTrade) bestTrade = pnl;
      currentWinStreak += 1;
      currentLossStreak = 0;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
    } else if (pnl < 0) {
      grossLoss += pnl;
      losses += 1;
      if (pnl < worstTrade) worstTrade = pnl;
      currentLossStreak += 1;
      currentWinStreak = 0;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    } else {
      currentWinStreak = 0;
      currentLossStreak = 0;
    }
  });

  const totalTradingDays = Object.keys(dailyPnL).length;
  let winningDays = 0;
  let losingDays = 0;
  let breakevenDays = 0;
  let largestProfitableDay = 0;
  let largestLosingDay = 0;
  let grossWinningDayPnl = 0;
  let grossLosingDayPnl = 0;

  Object.values(dailyPnL).forEach(dpnl => {
    if (dpnl > 0) {
      winningDays += 1;
      grossWinningDayPnl += dpnl;
      if (dpnl > largestProfitableDay) largestProfitableDay = dpnl;
    } else if (dpnl < 0) {
      losingDays += 1;
      grossLosingDayPnl += dpnl;
      if (dpnl < largestLosingDay) largestLosingDay = dpnl;
    } else {
      breakevenDays += 1;
    }
  });

  const avgWinningDayPnl = winningDays > 0 ? grossWinningDayPnl / winningDays : 0;
  const avgLosingDayPnl = losingDays > 0 ? grossLosingDayPnl / losingDays : 0;
  const avgDailyPnl = totalTradingDays > 0 ? totalPnl / totalTradingDays : 0;

  let bestMonth = { name: 'N/A', pnl: 0 };
  let worstMonth = { name: 'N/A', pnl: 0 };
  const months = Object.keys(monthlyPnL);
  if (months.length > 0) {
    bestMonth = { name: months[0], pnl: monthlyPnL[months[0]] };
    worstMonth = { name: months[0], pnl: monthlyPnL[months[0]] };
    for (let m of months) {
      if (monthlyPnL[m] > bestMonth.pnl) bestMonth = { name: m, pnl: monthlyPnL[m] };
      if (monthlyPnL[m] < worstMonth.pnl) worstMonth = { name: m, pnl: monthlyPnL[m] };
    }
  }
  const avgMonthlyPnl = months.length > 0 ? totalPnl / months.length : 0;

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const profitFactor = grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : (grossProfit > 0 ? grossProfit : 0);
  const avgWinner = wins > 0 ? grossProfit / wins : 0;
  const avgLoser = losses > 0 ? grossLoss / losses : 0;
  const expectancy = totalTrades > 0 ? totalPnl / totalTrades : 0;

  return {
    totalPnl,
    winRate,
    profitFactor,
    totalTrades,
    wins,
    losses,
    avgWinner,
    avgLoser,
    bestTrade,
    worstTrade,
    expectancy,
    maxWinStreak,
    maxLossStreak,
    totalTradingDays,
    winningDays,
    losingDays,
    breakevenDays,
    avgDailyPnl,
    avgWinningDayPnl,
    avgLosingDayPnl,
    largestProfitableDay,
    largestLosingDay,
    bestMonth,
    worstMonth,
    avgMonthlyPnl,
  };
};
