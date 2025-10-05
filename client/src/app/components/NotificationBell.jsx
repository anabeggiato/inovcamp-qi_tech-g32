"use client"
import { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, markNotificationAsRead, getUnreadNotificationsCount } = useAccountStatus();

    const unreadCount = getUnreadNotificationsCount();

    const handleMarkAsRead = async (notificationId) => {
        await markNotificationAsRead(notificationId);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'welcome':
                return '🎉';
            case 'score_update':
                return '📊';
            case 'match_created':
                return '🤝';
            case 'contract_generated':
                return '📄';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'welcome':
                return 'bg-green-50 border-green-200';
            case 'score_update':
                return 'bg-blue-50 border-blue-200';
            case 'match_created':
                return 'bg-purple-50 border-purple-200';
            case 'contract_generated':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Nenhuma notificação
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 ${getNotificationColor(notification.type)} ${notification.status === 'unread' ? 'border-l-4 border-l-primary' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">
                                                {notification.title}
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.created_at).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        {notification.status === 'unread' && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="Marcar como lida"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}