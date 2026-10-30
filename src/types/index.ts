export type SubscriptionTier = 'FREE' | 'PRO_MONTHLY' | 'PRO_YEARLY' | 'LIFETIME';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  user?: User;
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  paymentProvider: 'STRIPE' | 'RAZORPAY' | 'MANUAL' | 'COMPLIMENTARY';
  externalSubscriptionId?: string;
  externalCustomerId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionGrant {
  id: string;
  userId: string;
  userEmail: string;
  subscriptionId?: string;
  adminId: string;
  adminEmail: string;
  grantType: 'COMPLIMENTARY' | 'PROMOTIONAL' | 'VIP_COMP' | string;
  tier: SubscriptionTier;
  durationDays?: number;
  startDate: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXTENDED' | 'REVOKED' | 'EXPIRED';
  reason: string;
  revokedAt?: string;
  revokedByAdminId?: string;
  revocationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'GRANT_COMPLIMENTARY' | 'EXTEND_SUBSCRIPTION' | 'REVOKE_SUBSCRIPTION' | 'SUSPEND_USER' | 'ACTIVATE_USER' | 'UPDATE_USER_ROLE' | string;
  targetUserId?: string;
  targetUserEmail?: string;
  reason?: string;
  outcome: 'SUCCESS' | 'FAILURE';
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId?: string;
  subscriptionId?: string;
  provider: 'STRIPE' | 'RAZORPAY';
  eventId: string;
  eventType: string;
  amountCents: number;
  currency: string;
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  rawPayload?: string;
  createdAt: string;
}

export interface EntitlementToken {
  schemaVersion: number;
  productId: string;
  tokenId: string;
  keyId: string;
  userId: string;
  email: string;
  tier: SubscriptionTier;
  issuedAt: number;
  expiresAt: number;
  offlineGracePeriodSeconds: number;
  signature: string;
}

export interface UserDetailView {
  user: User;
  activeSubscription?: Subscription;
  subscriptionHistory: Subscription[];
  grantHistory: SubscriptionGrant[];
  entitlementPreview?: EntitlementToken;
  paymentHistory: PaymentTransaction[];
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersPast7Days: number;
  newUsersPast30Days: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  activeProSubscribers: number;
  freeSubscribers: number;
  complimentaryGrantsCount: number;
  totalRevenueCents: number;
  subscriptionDistribution: Record<string, number>;
  recentAuditLogs: AdminAuditLog[];
  recentGrants: SubscriptionGrant[];
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
  size: number;
  number: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'MOTIVATION' | 'MAINTENANCE' | 'ALERT';
  active: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  tierGrant?: SubscriptionTier;
  durationDays?: number;
  maxRedemptions: number;
  timesRedeemed: number;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}
