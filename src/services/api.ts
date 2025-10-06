import type {
  User,
  Transaction,
  Agent,
  Dealer,
  Zone,
  TelcoOperator,
  OperatorService,
  Currency,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  FilterParams,
  LoginFormData,
  TransactionFormData,
  AgentFormData,
  DealerFormData,
  ZoneFormData,
  OperatorFormData,
  OperatorServiceFormData,
  UserFormData,
  TransactionApproval,
  ApprovalAction,
  Role,
} from '../types';

import {
  mockUsers,
  mockTransactions,
  mockAgents,
  mockDealers,
  mockZones,
  mockOperators,
  mockOperatorServices,
  mockCurrencies,
  mockDashboardStats,
  mockTransactionApprovals,
  mockRoles,
} from './mockData';

// Simulated delay for API calls
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export const authApi = {
  login: async (credentials: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay();
    const user = mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      return {
        success: true,
        data: {
          user,
          token: `mock-token-${user.id}-${Date.now()}`,
        },
        message: 'Login successful',
      };
    }

    return {
      success: false,
      error: 'Invalid username or password',
    };
  },

  logout: async (): Promise<ApiResponse<void>> => {
    await delay(200);
    return { success: true, message: 'Logout successful' };
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    await delay(300);
    // In real app, get from token
    return { success: true, data: mockUsers[0] };
  },
};

// Transactions
export const transactionApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filteredTransactions = [...mockTransactions];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(
        t =>
          t.reference.toLowerCase().includes(searchLower) ||
          t.depositorName.toLowerCase().includes(searchLower)
      );
    }

    const paginatedItems = filteredTransactions.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: filteredTransactions.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredTransactions.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    await delay();
    const transaction = mockTransactions.find(t => t.id === id);

    if (transaction) {
      // Populate relations
      const agent = mockAgents.find(a => a.id === transaction.agentId);
      const dealer = mockDealers.find(d => d.id === transaction.dealerId);
      const operator = mockOperators.find(o => o.id === transaction.operatorId);
      const service = mockOperatorServices.find(s => s.id === transaction.operatorServiceId);
      const currency = mockCurrencies.find(c => c.id === transaction.currencyId);

      return {
        success: true,
        data: {
          ...transaction,
          agent,
          dealer,
          operator,
          operatorService: service,
          currency,
        },
      };
    }

    return { success: false, error: 'Transaction not found' };
  },

  create: async (data: TransactionFormData): Promise<ApiResponse<Transaction>> => {
    await delay();
    const newTransaction: Transaction = {
      id: String(mockTransactions.length + 1),
      reference: `TRX-${new Date().toISOString().split('T')[0]}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      createdAt: new Date(),
      createdByUserId: '1', // Should come from auth context
      dealerId: data.dealerId,
      subDealerId: data.subDealerId,
      operatorId: data.operatorId,
      operatorServiceId: data.operatorServiceId,
      serviceType: data.serviceType,
      amount: data.amount,
      currencyId: data.currencyId,
      phoneNumber: data.phoneNumber,
      sourceOfFunds: data.sourceOfFunds,
      depositorName: data.depositorName,
      status: 'PENDING',
      version: 0,
    };

    mockTransactions.unshift(newTransaction);

    return {
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully',
    };
  },

  approve: async (id: string, level: number, comment?: string): Promise<ApiResponse<TransactionApproval>> => {
    await delay();
    const transaction = mockTransactions.find(t => t.id === id);

    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    const approval: TransactionApproval = {
      id: String(mockTransactionApprovals.length + 1),
      transactionId: id,
      approverUserId: '2', // Should come from auth context
      approverRole: level === 1 ? 'OFFICER' : 'CFO',
      level,
      action: 'APPROVE',
      comment,
      createdAt: new Date(),
    };

    mockTransactionApprovals.push(approval);

    // Update transaction status
    if (level === 1) {
      transaction.status = 'VALIDATED';
    } else if (level === 2) {
      transaction.status = 'APPROVED';
      transaction.approvedAt = new Date();
    }

    return {
      success: true,
      data: approval,
      message: 'Transaction approved successfully',
    };
  },

  reject: async (id: string, reason: string): Promise<ApiResponse<TransactionApproval>> => {
    await delay();
    const transaction = mockTransactions.find(t => t.id === id);

    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    const approval: TransactionApproval = {
      id: String(mockTransactionApprovals.length + 1),
      transactionId: id,
      approverUserId: '2',
      approverRole: 'OFFICER',
      level: 1,
      action: 'REJECT',
      comment: reason,
      createdAt: new Date(),
    };

    mockTransactionApprovals.push(approval);
    transaction.status = 'REJECTED';
    transaction.statusReason = reason;
    transaction.rejectedAt = new Date();

    return {
      success: true,
      data: approval,
      message: 'Transaction rejected',
    };
  },

  getApprovals: async (transactionId: string): Promise<ApiResponse<TransactionApproval[]>> => {
    await delay();
    const approvals = mockTransactionApprovals.filter(a => a.transactionId === transactionId);
    return { success: true, data: approvals };
  },
};

// Agents
export const agentApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<Agent>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filteredAgents = [...mockAgents];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAgents = filteredAgents.filter(
        a => a.name.toLowerCase().includes(searchLower) || a.code.toLowerCase().includes(searchLower)
      );
    }

    const paginatedItems = filteredAgents.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: filteredAgents.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredAgents.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Agent>> => {
    await delay();
    const agent = mockAgents.find(a => a.id === id);

    if (agent) {
      const zone = mockZones.find(z => z.id === agent.zoneId);
      return { success: true, data: { ...agent, zone } };
    }

    return { success: false, error: 'Agent not found' };
  },

  create: async (data: AgentFormData): Promise<ApiResponse<Agent>> => {
    await delay();
    const newAgent: Agent = {
      id: String(mockAgents.length + 1),
      ...data,
      status: 'ACTIVE',
      createdAt: new Date(),
    };

    mockAgents.push(newAgent);

    return { success: true, data: newAgent, message: 'Agent created successfully' };
  },

  update: async (id: string, data: Partial<AgentFormData>): Promise<ApiResponse<Agent>> => {
    await delay();
    const index = mockAgents.findIndex(a => a.id === id);

    if (index === -1) {
      return { success: false, error: 'Agent not found' };
    }

    mockAgents[index] = { ...mockAgents[index], ...data, updatedAt: new Date() };

    return { success: true, data: mockAgents[index], message: 'Agent updated successfully' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockAgents.findIndex(a => a.id === id);

    if (index === -1) {
      return { success: false, error: 'Agent not found' };
    }

    mockAgents.splice(index, 1);

    return { success: true, message: 'Agent deleted successfully' };
  },
};

// Dealers
export const dealerApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<Dealer>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filteredDealers = [...mockDealers];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredDealers = filteredDealers.filter(d => d.name.toLowerCase().includes(searchLower));
    }

    const paginatedItems = filteredDealers.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: filteredDealers.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredDealers.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Dealer>> => {
    await delay();
    const dealer = mockDealers.find(d => d.id === id);

    if (dealer) {
      const zone = mockZones.find(z => z.id === dealer.zoneId);
      return { success: true, data: { ...dealer, zone } };
    }

    return { success: false, error: 'Dealer not found' };
  },

  create: async (data: DealerFormData): Promise<ApiResponse<Dealer>> => {
    await delay();
    const newDealer: Dealer = {
      id: String(mockDealers.length + 1),
      ...data,
      kycStatus: 'PENDING',
      createdAt: new Date(),
    };

    mockDealers.push(newDealer);

    return { success: true, data: newDealer, message: 'Dealer created successfully' };
  },

  update: async (id: string, data: Partial<DealerFormData>): Promise<ApiResponse<Dealer>> => {
    await delay();
    const index = mockDealers.findIndex(d => d.id === id);

    if (index === -1) {
      return { success: false, error: 'Dealer not found' };
    }

    mockDealers[index] = { ...mockDealers[index], ...data, updatedAt: new Date() };

    return { success: true, data: mockDealers[index], message: 'Dealer updated successfully' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockDealers.findIndex(d => d.id === id);

    if (index === -1) {
      return { success: false, error: 'Dealer not found' };
    }

    mockDealers.splice(index, 1);

    return { success: true, message: 'Dealer deleted successfully' };
  },
};

// Zones
export const zoneApi = {
  getAll: async (): Promise<ApiResponse<Zone[]>> => {
    await delay();
    return { success: true, data: mockZones };
  },

  getById: async (id: string): Promise<ApiResponse<Zone>> => {
    await delay();
    const zone = mockZones.find(z => z.id === id);

    if (zone) {
      return { success: true, data: zone };
    }

    return { success: false, error: 'Zone not found' };
  },

  create: async (data: ZoneFormData): Promise<ApiResponse<Zone>> => {
    await delay();
    const newZone: Zone = {
      id: String(mockZones.length + 1),
      ...data,
      createdAt: new Date(),
    };

    mockZones.push(newZone);

    return { success: true, data: newZone, message: 'Zone created successfully' };
  },

  update: async (id: string, data: Partial<ZoneFormData>): Promise<ApiResponse<Zone>> => {
    await delay();
    const index = mockZones.findIndex(z => z.id === id);

    if (index === -1) {
      return { success: false, error: 'Zone not found' };
    }

    mockZones[index] = { ...mockZones[index], ...data, updatedAt: new Date() };

    return { success: true, data: mockZones[index], message: 'Zone updated successfully' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockZones.findIndex(z => z.id === id);

    if (index === -1) {
      return { success: false, error: 'Zone not found' };
    }

    mockZones.splice(index, 1);

    return { success: true, message: 'Zone deleted successfully' };
  },
};

// Operators
export const operatorApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<TelcoOperator>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const paginatedItems = mockOperators.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: mockOperators.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockOperators.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<TelcoOperator>> => {
    await delay();
    const operator = mockOperators.find(o => o.id === id);
    if (operator) {
      return { success: true, data: operator };
    }
    return { success: false, error: 'Operator not found' };
  },

  create: async (data: OperatorFormData): Promise<ApiResponse<TelcoOperator>> => {
    await delay();
    const newOperator: TelcoOperator = {
      id: String(mockOperators.length + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOperators.push(newOperator);
    return { success: true, data: newOperator, message: 'Operator created successfully' };
  },

  update: async (id: string, data: OperatorFormData): Promise<ApiResponse<TelcoOperator>> => {
    await delay();
    const index = mockOperators.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOperators[index] = { ...mockOperators[index], ...data, updatedAt: new Date() };
      return { success: true, data: mockOperators[index], message: 'Operator updated successfully' };
    }
    return { success: false, error: 'Operator not found' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockOperators.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOperators.splice(index, 1);
      return { success: true, message: 'Operator deleted successfully' };
    }
    return { success: false, error: 'Operator not found' };
  },
};

// Operator Services
export const operatorServiceApi = {
  getAll: async (filters?: FilterParams & { operatorId?: string }): Promise<ApiResponse<PaginatedResponse<OperatorService>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filteredServices = [...mockOperatorServices];
    if (filters?.operatorId) {
      filteredServices = filteredServices.filter(s => s.operatorId === filters.operatorId);
    }

    const paginatedItems = filteredServices.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: filteredServices.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredServices.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<OperatorService>> => {
    await delay();
    const service = mockOperatorServices.find(s => s.id === id);
    if (service) {
      return { success: true, data: service };
    }
    return { success: false, error: 'Service not found' };
  },

  create: async (data: OperatorServiceFormData): Promise<ApiResponse<OperatorService>> => {
    await delay();
    const newService: OperatorService = {
      id: String(mockOperatorServices.length + 1),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOperatorServices.push(newService);
    return { success: true, data: newService, message: 'Service created successfully' };
  },

  update: async (id: string, data: OperatorServiceFormData): Promise<ApiResponse<OperatorService>> => {
    await delay();
    const index = mockOperatorServices.findIndex(s => s.id === id);
    if (index !== -1) {
      mockOperatorServices[index] = { ...mockOperatorServices[index], ...data, updatedAt: new Date() };
      return { success: true, data: mockOperatorServices[index], message: 'Service updated successfully' };
    }
    return { success: false, error: 'Service not found' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockOperatorServices.findIndex(s => s.id === id);
    if (index !== -1) {
      mockOperatorServices.splice(index, 1);
      return { success: true, message: 'Service deleted successfully' };
    }
    return { success: false, error: 'Service not found' };
  },
};

// Currencies
export const currencyApi = {
  getAll: async (): Promise<ApiResponse<Currency[]>> => {
    await delay();
    return { success: true, data: mockCurrencies };
  },
};

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay();
    return { success: true, data: mockDashboardStats };
  },
};

// Users
export const userApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filteredUsers = [...mockUsers];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        u =>
          u.username.toLowerCase().includes(searchLower) ||
          (u.displayName && u.displayName.toLowerCase().includes(searchLower))
      );
    }

    const paginatedItems = filteredUsers.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: filteredUsers.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredUsers.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    await delay();
    const user = mockUsers.find(u => u.id === id);
    if (user) {
      return { success: true, data: user };
    }
    return { success: false, error: 'User not found' };
  },

  create: async (data: UserFormData): Promise<ApiResponse<User>> => {
    await delay();
    const roles = mockRoles.filter(r => data.roleIds.includes(r.id));
    const newUser: User = {
      id: String(mockUsers.length + 1),
      uuid: `uuid-${Date.now()}`,
      phone: data.phone,
      username: data.username,
      displayName: data.displayName,
      email: data.email,
      dob: data.dob,
      password: data.password || 'temp123',
      country: data.country,
      countryISO: data.countryISO,
      connexionAttemps: 0,
      isActive: data.isActive,
      roles,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    };

    mockUsers.push(newUser);

    return { success: true, data: newUser, message: 'User created successfully' };
  },

  update: async (id: string, data: UserFormData): Promise<ApiResponse<User>> => {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      const roles = mockRoles.filter(r => data.roleIds.includes(r.id));
      const updatedUser = {
        ...mockUsers[index],
        phone: data.phone,
        displayName: data.displayName,
        email: data.email,
        dob: data.dob,
        country: data.country,
        countryISO: data.countryISO,
        isActive: data.isActive,
        roles,
        updatedAt: new Date(),
      };
      if (data.password) {
        updatedUser.password = data.password;
      }
      mockUsers[index] = updatedUser;
      return { success: true, data: updatedUser, message: 'User updated successfully' };
    }
    return { success: false, error: 'User not found' };
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return { success: true, message: 'User deleted successfully' };
    }
    return { success: false, error: 'User not found' };
  },
};

// Roles
export const roleApi = {
  getAll: async (filters?: FilterParams): Promise<ApiResponse<PaginatedResponse<Role>>> => {
    await delay();
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const paginatedItems = mockRoles.slice(start, end);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total: mockRoles.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockRoles.length / pageSize),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Role>> => {
    await delay();
    const role = mockRoles.find(r => r.id === id);
    if (role) {
      return { success: true, data: role };
    }
    return { success: false, error: 'Role not found' };
  },
};
