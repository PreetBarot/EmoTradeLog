import Trade from '../models/Trade.js';
import User from '../models/User.model.js';

export const getLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const leaderboard = await Trade.aggregate([
      // 1. Filter trades for the current month
      {
        $match: {
          date: { $gte: firstDayOfMonth },
          status: 'Journaled' // Assuming we only count closed/journaled trades
        }
      },
      // 2. Group by user and calculate stats
      {
        $group: {
          _id: '$user',
          totalPnl: { $sum: '$pnl' },
          totalTrades: { $sum: 1 },
          winningTrades: {
            $sum: {
              $cond: [{ $eq: ['$isWinner', true] }, 1, 0]
            }
          }
        }
      },
      // 3. Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // 4. Unwind user array
      {
        $unwind: '$userDetails'
      },
      // 5. Project the final shape and calculate winRate
      {
        $project: {
          _id: 1,
          name: '$userDetails.name',
          totalPnl: 1,
          totalTrades: 1,
          winRate: {
            $multiply: [
              { $divide: ['$winningTrades', '$totalTrades'] },
              100
            ]
          }
        }
      },
      // 6. Sort by totalPnl descending
      {
        $sort: { totalPnl: -1 }
      },
      // 7. Limit to top 50
      {
        $limit: 50
      }
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error fetching leaderboard data" });
  }
};
