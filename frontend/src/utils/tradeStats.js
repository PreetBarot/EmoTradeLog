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

  closedTrades.forEach(trade => {
    const pnl = Number(trade.pnl);
    totalPnl += pnl;

    if (pnl > 0) {
      grossProfit += pnl;
      wins += 1;
      if (pnl > bestTrade) bestTrade = pnl;
    } else if (pnl < 0) {
      grossLoss += pnl;
      losses += 1;
      if (pnl < worstTrade) worstTrade = pnl;
    }
  });

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
  };
};
