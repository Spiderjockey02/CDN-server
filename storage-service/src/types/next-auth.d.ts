import type { FullUser } from './database/User';

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    exp: number
    user: FullUser
  }
}
