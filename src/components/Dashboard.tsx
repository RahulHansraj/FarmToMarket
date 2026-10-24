import { useState, useMemo, lazy, Suspense } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Cloud,
  Database,
  Store,
  DollarSign,
  MessageSquare,
  Bell,
  LogOut,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

// Load each tab on demand so recharts and the speech SDK stay out of the initial bundle
const PriceDashboard = lazy(() => import('./features/PriceDashboard'));
const WeatherAlerts = lazy(() => import('./features/WeatherAlerts'));
const FarmDataInput = lazy(() => import('./features/FarmDataInput'));
const MarketExplorer = lazy(() => import('./features/MarketExplorer'));
const ProfitDashboard = lazy(() => import('./features/ProfitDashboard'));
const AIAssistant = lazy(() => import('./features/AIAssistant'));
const NotificationsPanel = lazy(() => import('./features/NotificationsPanel'));
const OverviewDashboard = lazy(() => import('./features/OverviewDashboard'));

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const menuItems = useMemo(() => [
    { id: 'overview', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'prices', label: t('prices'), icon: TrendingUp },
    { id: 'weather', label: t('weather'), icon: Cloud },
    { id: 'farmData', label: t('farmData'), icon: Database },
    { id: 'markets', label: t('markets'), icon: Store },
    { id: 'profit', label: t('profit'), icon: DollarSign },
    { id: 'ai', label: t('aiAssistant'), icon: MessageSquare },
    { id: 'notifications', label: t('notifications'), icon: Bell },
  ], [t]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'prices':
        return <PriceDashboard />;
      case 'weather':
        return <WeatherAlerts />;
      case 'farmData':
        return <FarmDataInput />;
      case 'markets':
        return <MarketExplorer />;
      case 'profit':
        return <ProfitDashboard />;
      case 'ai':
        return <AIAssistant />;
      case 'notifications':
        return <NotificationsPanel />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">AgriMarket Pro</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                aria-current={activeTab === item.id ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 mt-8"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden lg:block">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  aria-label="Change language"
                  aria-expanded={showLangMenu}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Languages className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-gray-700 transition-colors ${
                          language === lang.code ? 'bg-green-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        <span className="text-gray-800 dark:text-gray-200">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-8">
          <Suspense
            fallback={
              <div className="flex justify-center py-20 text-gray-500 dark:text-gray-400">Loading...</div>
            }
          >
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
