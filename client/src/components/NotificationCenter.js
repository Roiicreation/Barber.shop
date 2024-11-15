import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { auth } from '../config/firebase';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                if (auth.currentUser) {
                    const userNotifications = await notificationService.getUserNotifications(auth.currentUser.uid);
                    setNotifications(userNotifications);
                }
            } catch (error) {
                console.error('Errore nel caricamento delle notifiche:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, read: true }
                    : notif
            ));
        } catch (error) {
            console.error('Errore nel marcare la notifica come letta:', error);
        }
    };

    if (loading) return <div>Caricamento notifiche...</div>;

    return (
        <div className="notification-center">
            <h3>Notifiche</h3>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p>Nessuna notifica</p>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <small>{new Date(notification.createdAt.toDate()).toLocaleString()}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
