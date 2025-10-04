// Enums and Types
export type UserRole = 'ADMIN' | 'AGENT' | 'OFFICER' | 'CFO' | 'TELCO' | 'OPERATION_MANAGER' | 'MANAGING_DIRECTOR';

export type ServiceType = 'AIRTIME' | 'MOBILE_MONEY' | 'SIM_CARD' | 'OTHER';

export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';

export type TransactionStatus = 'PENDING' | 'VALIDATED' | 'APPROVED' | 'PROCESSED' | 'NOTIFIED' | 'COMPLETED' | 'REJECTED' | 'RETURNED';

export type ApprovalAction = 'APPROVE' | 'REJECT' | 'RETURN_FOR_REVIEW';

export type PostingStatus = 'PENDING' | 'SENT' | 'FAILED' | 'ACKED';

export type EntryType = 'DEBIT' | 'CREDIT';

export type NotificationChannel = 'SMS' | 'EMAIL';

export type NotificationStatus = 'QUEUED' | 'SENT' | 'FAILED';

export type DealerType = 'DISTRIBUTOR' | 'RESELLER' | 'AGENT' | 'OTHER';

export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

// Interfaces
export interface User {
  id: string;
  uuid: string;
  phone: string;
  username: string;
  displayName?: string;
  email?: string;
  dob?: Date;
  password: string;
  country: string;
  countryISO: string;
  connexionAttemps: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  version: number;
}

export interface Role {
  id: string;
  name: UserRole;
}

export interface UserRole_ {
  userId: string;
  roleId: string;
  zoneId?: string;
  user?: User;
  role?: Role;
  zone?: Zone;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  parentZoneId?: string;
  parentZone?: Zone;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TelcoOperator {
  id: string;
  code: string;
  name: string;
  contractReference?: string;
  commissionAccount?: string;
  createdAt: Date;
}

export interface OperatorService {
  id: string;
  operatorId: string;
  serviceType: ServiceType;
  serviceAccount: string;
  code?: string;
  displayName?: string;
  isEnabled: boolean;
  operator?: TelcoOperator;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface CommissionProfile {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  userId?: string;
  status: AgentStatus;
  accountNumber: string;
  commissionProfileId?: string;
  biometricHash?: string;
  contractReference?: string;
  createdAt: Date;
  updatedAt?: Date;
  zone?: Zone;
  user?: User;
  commissionProfile?: CommissionProfile;
}

export interface Device {
  id: string;
  agentId: string;
  serialNumber: string;
  model?: string;
  firmwareVersion?: string;
  status: DeviceStatus;
  lastSeenAt?: Date;
  publicKey?: string;
  agent?: Agent;
}

export interface Dealer {
  id: string;
  type: DealerType;
  name: string;
  zoneId: string;
  accountNumber: string;
  kycStatus: KYCStatus;
  contractReference?: string;
  createdAt: Date;
  updatedAt?: Date;
  zone?: Zone;
}

export interface SubDealer {
  id: string;
  name: string;
  parentDealerId: string;
  kycReference?: string;
  createdAt: Date;
  parentDealer?: Dealer;
}

export interface CommissionRate {
  id: string;
  operatorId: string;
  serviceType: ServiceType;
  applicableTo: 'AGENT' | 'DEALER' | 'GLOBAL';
  ratePercent: number;
  fixedAmount?: number;
  currencyCode: string;
  validFrom: Date;
  validTo?: Date;
  operator?: TelcoOperator;
  currency?: Currency;
}

export interface Transaction {
  id: string;
  reference: string;
  createdAt: Date;
  createdByUserId: string;
  originDeviceId?: string;
  agentId?: string;
  dealerId: string;
  subDealerId?: string;
  operatorId: string;
  operatorServiceId: string;
  serviceType: ServiceType;
  amount: number;
  currencyId: string;
  phoneNumber?: string;
  sourceOfFunds: string;
  depositorName: string;
  depositorSignatureFileId?: string;
  biometricHash?: string;
  status: TransactionStatus;
  statusReason?: string;
  approvedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  version: number;
  // Relations
  createdBy?: User;
  originDevice?: Device;
  agent?: Agent;
  dealer?: Dealer;
  subDealer?: SubDealer;
  operator?: TelcoOperator;
  operatorService?: OperatorService;
  currency?: Currency;
  depositorSignatureFile?: FileStore;
}

export interface TransactionSignature {
  id: string;
  transactionId: string;
  signatureFileId: string;
  signedBy: string;
  signedAt: Date;
  transaction?: Transaction;
  signatureFile?: FileStore;
}

export interface TransactionBiometric {
  id: string;
  transactionId: string;
  biometricType: string;
  biometricHash: string;
  verified: boolean;
  verifiedByUserId?: string;
  transaction?: Transaction;
  verifiedBy?: User;
}

export interface TransactionApproval {
  id: string;
  transactionId: string;
  approverUserId: string;
  approverRole: string;
  level: number;
  action: ApprovalAction;
  comment?: string;
  createdAt: Date;
  transaction?: Transaction;
  approver?: User;
}

export interface AccountingEntry {
  id: string;
  uuid: string;
  transactionId: string;
  entryType: EntryType;
  accountNumber: string;
  amount: number;
  currencyCode: string;
  narration?: string;
  createdAt: Date;
  sequence: number;
  transaction?: Transaction;
}

export interface CBSPosting {
  id: string;
  transactionId: string;
  attempts: number;
  lastAttemptAt?: Date;
  status: PostingStatus;
  cbsReference?: string;
  responseMessage?: string;
  createdAt: Date;
  transaction?: Transaction;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
}

export interface Notification {
  id: string;
  toPhone?: string;
  toEmail?: string;
  templateId: string;
  payload: Record<string, any>;
  status: NotificationStatus;
  sentAt?: Date;
  retries: number;
  template?: NotificationTemplate;
}

export interface FileStore {
  id: string;
  storagePath: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: string;
  uploadedAt: Date;
  referenceType?: string;
  referenceId?: string;
  uploader?: User;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy?: string;
  performedAt: Date;
  payload?: Record<string, any>;
  ipAddress?: string;
  deviceInfo?: string;
  user?: User;
}

// Dashboard Statistics
export interface DashboardStats {
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  totalAmount: number;
  activeAgents: number;
  activeDealers: number;
  recentTransactions: Transaction[];
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface TransactionFormData {
  dealerId: string;
  subDealerId?: string;
  depositorName: string;
  operatorId: string;
  operatorServiceId: string;
  serviceType: ServiceType;
  amount: number;
  currencyId: string;
  phoneNumber?: string;
  sourceOfFunds: string;
}

export interface AgentFormData {
  code: string;
  name: string;
  zoneId: string;
  userId?: string;
  accountNumber: string;
  contractReference?: string;
}

export interface DealerFormData {
  type: DealerType;
  name: string;
  zoneId: string;
  accountNumber: string;
  contractReference?: string;
}

export interface ZoneFormData {
  code: string;
  name: string;
  parentZoneId?: string;
}

export interface UserFormData {
  username: string;
  phone: string;
  email?: string;
  displayName?: string;
  password: string;
  country: string;
  countryISO: string;
  roleIds: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
