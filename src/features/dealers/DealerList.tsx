import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dealerApi } from '../../services/api';
import type { Dealer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const DealerList: React.FC = () => {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'DISTRIBUTOR' | 'RESELLER'>('all');

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setLoading(true);
    try {
      const response = await dealerApi.getAll({
        page: 1,
        limit: 100,
        search: searchTerm
      });
      if (response.success && response.data) {
        setDealers(response.data.items);
      }
    } catch (error) {
      console.error('Error loading dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce dealer?')) return;

    try {
      const response = await dealerApi.delete(id);
      if (response.success) {
        loadDealers();
      }
    } catch (error) {
      console.error('Error deleting dealer:', error);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'secondary';
    }
  };

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || dealer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Dealers</h1>
          <p className="text-gray-600 mt-1">Gestion des distributeurs et revendeurs</p>
        </div>
        <Button onClick={() => navigate('/dealers/new')} icon={Plus}>
          Nouveau Dealer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher par nom ou compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Tous
            </Button>
            <Button
              variant={typeFilter === 'DISTRIBUTOR' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('DISTRIBUTOR')}
            >
              Distributeurs
            </Button>
            <Button
              variant={typeFilter === 'RESELLER' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('RESELLER')}
            >
              Revendeurs
            </Button>
          </div>
        </div>
      </Card>

      {/* Dealers Grid */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des dealers...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <Building2 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{dealer.name}</h3>
                      <p className="text-sm text-gray-500">{dealer.accountNumber}</p>
                    </div>
                  </div>
                  <Badge variant={dealer.type === 'DISTRIBUTOR' ? 'primary' : 'secondary'}>
                    {dealer.type}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2" size={16} />
                    <span>{dealer.zone?.name || 'Zone non définie'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="mr-2" size={16} />
                    <span>KYC: </span>
                    <Badge variant={getKycStatusColor(dealer.kycStatus)} className="ml-2">
                      {dealer.kycStatus}
                    </Badge>
                  </div>
                  {dealer.contractReference && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="mr-2" size={16} />
                      <span>{dealer.contractReference}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/dealers/${dealer.id}/edit`)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(dealer.id)}
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
      {!loading && filteredDealers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun dealer trouvé</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || typeFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer votre premier dealer'}
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <Button onClick={() => navigate('/dealers/new')} icon={Plus} className="mt-4">
                Créer un dealer
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
