// Shared types across applications

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  createdAt?: string | Date;
}
