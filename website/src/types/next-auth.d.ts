import type { User } from '.';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & User
  }
}
