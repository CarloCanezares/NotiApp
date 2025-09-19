export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  userId: string;
}