import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { TransactionList } from './features/transactions/TransactionList';
import { TransactionDetail } from './features/transactions/TransactionDetail';
import { NewTransaction } from './features/transactions/NewTransaction';
import { AgentList } from './features/agents/AgentList';
import { DealerList } from './features/dealers/DealerList';
import { DealerForm } from './features/dealers/DealerForm';
import { OperatorList } from './features/operators/OperatorList';
import { OperatorForm } from './features/operators/OperatorForm';
import { OperatorServices } from './features/operators/OperatorServices';
import { ZoneList } from './features/zones/ZoneList';
import { ZoneForm } from './features/zones/ZoneForm';
import { UserList } from './features/users/UserList';
import { UserForm } from './features/users/UserForm';
import { Settings } from './features/settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Transactions */}
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/new" element={<NewTransaction />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />

            {/* Agents */}
            <Route path="/agents" element={<AgentList />} />

            {/* Dealers */}
            <Route path="/dealers" element={<DealerList />} />
            <Route path="/dealers/new" element={<DealerForm />} />
            <Route path="/dealers/:id/edit" element={<DealerForm />} />

            {/* Operators */}
            <Route path="/operators" element={<OperatorList />} />
            <Route path="/operators/new" element={<OperatorForm />} />
            <Route path="/operators/:id/edit" element={<OperatorForm />} />
            <Route path="/operators/:id/services" element={<OperatorServices />} />

            {/* Zones */}
            <Route path="/zones" element={<ZoneList />} />
            <Route path="/zones/new" element={<ZoneForm />} />
            <Route path="/zones/:id/edit" element={<ZoneForm />} />

            {/* Users */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id/edit" element={<UserForm />} />

            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
