import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Smartphone, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { operatorApi } from '../../services/api';
import type { TelcoOperator } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const OperatorList: React.FC = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState<TelcoOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    setLoading(true);
    try {
      const response = await operatorApi.getAll({
        page: 1,
        limit: 100,
        search: searchTerm
      });
      if (response.success && response.data) {
        setOperators(response.data.items);
      }
    } catch (error) {
      console.error('Error loading operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet opérateur?')) return;

    try {
      const response = await operatorApi.delete(id);
      if (response.success) {
        loadOperators();
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  };

  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    operator.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opérateurs Télécom</h1>
          <p className="text-gray-600 mt-1">Gestion des opérateurs et leurs services</p>
        </div>
        <Button onClick={() => navigate('/operators/new')} icon={Plus}>
          Nouvel Opérateur
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Operators Grid */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des opérateurs...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOperators.map((operator) => (
            <Card key={operator.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <Smartphone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                      <p className="text-sm text-gray-500">{operator.code}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  {operator.contractReference && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Contrat:</span> {operator.contractReference}
                    </div>
                  )}
                  {operator.commissionAccount && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Compte:</span> {operator.commissionAccount}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Settings}
                    onClick={() => navigate(`/operators/${operator.id}/services`)}
                    className="flex-1"
                  >
                    Services
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/operators/${operator.id}/edit`)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(operator.id)}
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
      {!loading && filteredOperators.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Smartphone className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun opérateur trouvé</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par créer votre premier opérateur'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/operators/new')} icon={Plus} className="mt-4">
                Créer un opérateur
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
