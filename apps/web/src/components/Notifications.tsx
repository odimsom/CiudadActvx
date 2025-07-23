import React from 'react';

export type Notification = {
  id: string;
  type: 'emergency' | 'incident';
  title: string;
  message: string;
  createdAt: string;
};

interface NotificationsProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export const Notifications: React.FC<NotificationsProps> = ({ open, onClose, notifications }) => {
  if (!open) return null;

  return (
    <aside className="fixed top-16 right-4 w-80 max-w-full bg-white shadow-xl border border-gray-200 rounded-lg z-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Notificaciones</h2>
        <button onClick={onClose} className="text-gray-500 text-xl">×</button>
      </div>
      <ul className="space-y-3 max-h-[70vh] overflow-y-auto">
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500">No hay notificaciones aún.</p>
        )}
        {notifications.map((n) => (
          <li key={n.id} className="p-3 rounded border bg-gray-50">
            <p className="text-sm font-semibold">{n.title}</p>
            <p className="text-xs text-gray-600">{n.message}</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
              })}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
};
