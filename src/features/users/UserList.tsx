import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User as UserIcon, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import type { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll({
        page: 1,
        limit: 100,
        search: searchTerm
      });
      if (response.success && response.data) {
        setUsers(response.data.items);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;

    try {
      const response = await userApi.delete(id);
      if (response.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gestion des comptes utilisateurs et rôles</p>
        </div>
        <Button onClick={() => navigate('/users/new')} icon={Plus}>
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher par nom, username ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tous
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Actifs
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('inactive')}
            >
              Inactifs
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <UserIcon className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {user.displayName || user.username}
                      </h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <Badge variant={user.isActive ? 'success' : 'secondary'}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Téléphone:</span> {user.phone}
                  </div>
                  {user.email && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Pays:</span> {user.country} ({user.countryISO})
                  </div>
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <Shield className="text-gray-400" size={16} />
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <Badge key={role.id} variant="primary" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <UserIcon className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer votre premier utilisateur'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => navigate('/users/new')} icon={Plus} className="mt-4">
                Créer un utilisateur
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
