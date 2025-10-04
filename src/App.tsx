import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { TransactionList } from './features/transactions/TransactionList';
import { TransactionDetail } from './features/transactions/TransactionDetail';
import { NewTransaction } from './features/transactions/NewTransaction';
import { AgentList } from './features/agents/AgentList';

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
            <Route path="/dealers" element={<div className="p-6"><h1 className="text-3xl font-bold">Dealers</h1><p className="text-muted-foreground">Dealers management coming soon...</p></div>} />

            {/* Operators */}
            <Route path="/operators" element={<div className="p-6"><h1 className="text-3xl font-bold">Operators</h1><p className="text-muted-foreground">Operators management coming soon...</p></div>} />

            {/* Zones */}
            <Route path="/zones" element={<div className="p-6"><h1 className="text-3xl font-bold">Zones</h1><p className="text-muted-foreground">Zones management coming soon...</p></div>} />

            {/* Users */}
            <Route path="/users" element={<div className="p-6"><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground">Users management coming soon...</p></div>} />

            {/* Settings */}
            <Route path="/settings" element={<div className="p-6"><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Settings coming soon...</p></div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
