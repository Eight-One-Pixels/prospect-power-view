
import { toast } from "sonner";
import { Bell, Calendar, User, Building, Clock } from "lucide-react";

interface NotificationData {
  id: string;
  type: 'follow_up' | 'scheduled' | 'reminder';
  company_name: string;
  contact_person?: string;
  visit_type: string;
  date: string;
  priority: 'overdue' | 'today' | 'upcoming';
}

export const showNotificationToast = (notification: NotificationData) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'follow_up': return Clock;
      case 'scheduled': return Calendar;
      case 'reminder': return Bell;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'overdue': return 'text-red-600';
      case 'today': return 'text-orange-600';
      case 'upcoming': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const Icon = getIcon();
  
  toast(
    <div className="flex items-start gap-3">
      <Icon className={`h-5 w-5 mt-0.5 ${getPriorityColor(notification.priority)}`} />
      <div className="flex-1">
        <div className="font-medium text-sm">
          {notification.type === 'follow_up' ? 'Follow-up Required' : 
           notification.type === 'scheduled' ? 'Scheduled Visit' : 'Reminder'}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1 mb-1">
            <Building className="h-3 w-3" />
            <span className="font-medium">{notification.company_name}</span>
          </div>
          {notification.contact_person && (
            <div className="flex items-center gap-1 mb-1">
              <User className="h-3 w-3" />
              <span>{notification.contact_person}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{notification.date}</span>
          </div>
        </div>
      </div>
    </div>,
    {
      duration: 5000,
      className: notification.priority === 'overdue' ? 'border-l-4 border-red-500' :
                 notification.priority === 'today' ? 'border-l-4 border-orange-500' :
                 'border-l-4 border-blue-500'
    }
  );
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 4000,
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 3000,
  });
};
