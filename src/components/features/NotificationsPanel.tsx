import { useState, useEffect } from 'react';
import { Bell, TrendingUp, Cloud, DollarSign, Truck, AlertTriangle, X, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export default function NotificationsPanel() {
  const { notifications, addNotification, clearNotification } = useUser();
  const [activeFilter, setActiveFilter] = useState('all');

  // Simulate adding notifications
  useEffect(() => {
    const sampleNotifications = [
      {
        type: 'price',
        title: 'Price Alert: Wheat prices increased!',
        message: 'Wheat prices at Azadpur Mandi increased by 3.2% to ₹4,850/quintal. This is a good time to sell.',
        timestamp: new Date(Date.now() - 3600000),
        priority: 'high',
        actionable: true,
        marketId: 1,
      },
      {
        type: 'weather',
        title: 'Heavy Rainfall Warning',
        message: 'Heavy rainfall expected on Feb 12-13. Consider harvesting early or ensuring proper drainage.',
        timestamp: new Date(Date.now() - 7200000),
        priority: 'high',
        actionable: false,
      },
      {
        type: 'profit',
        title: 'Best Selling Day Prediction',
        message: 'Our AI predicts February 15 as the best day to sell your wheat for maximum profit (₹5,250/quintal).',
        timestamp: new Date(Date.now() - 10800000),
        priority: 'medium',
        actionable: true,
      },
      {
        type: 'transport',
        title: 'Transport Cost Reduced',
        message: 'Transport cost to Vashi Market reduced by 15%. New cost: ₹7,225.',
        timestamp: new Date(Date.now() - 14400000),
        priority: 'medium',
        actionable: false,
      },
      {
        type: 'demand',
        title: 'High Demand Alert! 🔥',
        message: 'Urgent: Market demand for wheat increased drastically at Azadpur Mandi. Profit potential: ₹58,000. Act now!',
        timestamp: new Date(Date.now() - 1800000),
        priority: 'urgent',
        actionable: true,
        marketId: 1,
      },
      {
        type: 'spoilage',
        title: 'Spoilage Risk Alert',
        message: 'Weather conditions may increase spoilage risk. Consider selling within 5 days or improving storage.',
        timestamp: new Date(Date.now() - 21600000),
        priority: 'medium',
        actionable: false,
      },
    ];

    // Add initial notifications if empty
    if (notifications.length === 0) {
      sampleNotifications.forEach(notif => addNotification(notif));
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'price':
        return TrendingUp;
      case 'weather':
        return Cloud;
      case 'profit':
      case 'demand':
        return DollarSign;
      case 'transport':
        return Truck;
      case 'spoilage':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter((n: any) => n.type === activeFilter);

  const notificationTypes = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'price', label: 'Price Alerts', count: notifications.filter((n: any) => n.type === 'price').length },
    { id: 'weather', label: 'Weather', count: notifications.filter((n: any) => n.type === 'weather').length },
    { id: 'demand', label: 'High Demand', count: notifications.filter((n: any) => n.type === 'demand').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Notifications</h2>
            <p className="text-blue-100">Stay updated with real-time alerts and important updates</p>
          </div>
          <div className="relative">
            <Bell className="w-12 h-12" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-2">
          {notificationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveFilter(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type.label} ({type.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map((notification: any) => {
            const Icon = getIcon(notification.type);
            const priorityColor = getPriorityColor(notification.priority);

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-900 rounded-xl p-6 border-l-4 border-${priorityColor}-500 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-lg bg-${priorityColor}-100 dark:bg-${priorityColor}-900/20`}>
                    <Icon className={`w-6 h-6 text-${priorityColor}-600 dark:text-${priorityColor}-400`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{notification.title}</h3>
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>

                      {notification.actionable && (
                        <div className="flex gap-2">
                          {notification.type === 'price' || notification.type === 'demand' ? (
                            <>
                              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                                View Market
                              </button>
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Sell Now
                              </button>
                            </>
                          ) : notification.type === 'profit' ? (
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                              View Prediction
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {notification.priority === 'urgent' && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                          Urgent Action Required
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                          High demand situation detected. Would you like to proceed with selling?
                        </p>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Yes, Sell Now
                          </button>
                          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg text-sm font-medium transition-colors">
                            Remind Me Later
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Price Alerts', description: 'Get notified when prices change significantly' },
            { label: 'Weather Alerts', description: 'Receive weather warnings and forecasts' },
            { label: 'Demand Alerts', description: 'High demand situations with profit opportunities' },
            { label: 'Best Selling Day', description: 'AI-predicted optimal selling dates' },
          ].map((pref, index) => (
            <label key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{pref.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{pref.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
