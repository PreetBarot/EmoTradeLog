import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Journal from './pages/Journal';
import Analysis from './pages/Analysis';
import Market from './pages/Market';
import Login from './pages/Login';
import Register from './pages/Register';
import EmotionDetector from './pages/AIFeatures/EmotionDetector';
import TradeCoach from './pages/AIFeatures/TradeCoach';
import WeeklyReport from './pages/AIFeatures/WeeklyReport';
import ScreenshotAnalyzer from './pages/AIFeatures/ScreenshotAnalyzer';
import ChatWithData from './pages/AIFeatures/ChatWithData';
import PatternFinder from './pages/AIFeatures/PatternFinder';
import RiskAdvisor from './pages/AIFeatures/RiskAdvisor';
import NewsCorrelation from './pages/AIFeatures/NewsCorrelation';
import Community from './pages/Community';
import Leaderboard from './pages/Leaderboard';
import Backtesting from './pages/Backtesting';
import Integrations from './pages/Integrations';
import ConnectMT5 from './pages/ConnectMT5';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/trades', element: <Trades /> },
      { path: '/journal', element: <Journal /> },
      { path: '/analysis', element: <Analysis /> },
      { path: '/market', element: <Market /> },
      { path: '/ai/emotion-detector', element: <EmotionDetector /> },
      { path: '/ai/trade-coach', element: <TradeCoach /> },
      { path: '/ai/weekly-report', element: <WeeklyReport /> },
      { path: '/ai/screenshot-analyzer', element: <ScreenshotAnalyzer /> },
      { path: '/ai/chat-with-data', element: <ChatWithData /> },
      { path: '/ai/pattern-finder', element: <PatternFinder /> },
      { path: '/ai/risk-advisor', element: <RiskAdvisor /> },
      { path: '/ai/news-correlation', element: <NewsCorrelation /> },
      { path: '/community', element: <Community /> },
      { path: '/leaderboard', element: <Leaderboard /> },
      { path: '/backtesting', element: <Backtesting /> },
      { path: '/integrations', element: <Integrations /> },
      { path: '/connect-mt5', element: <ConnectMT5 /> },
    ],
  },
]);

export default router;
