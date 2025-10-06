import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { zoneApi } from '../../services/api';
import type { Zone } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const ZoneList: React.FC = () => {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoading(true);
    try {
      const response = await zoneApi.getAll({
        page: 1,
        limit: 100,
        search: searchTerm
      });
      if (response.success && response.data) {
        setZones(response.data.items);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone?')) return;

    try {
      const response = await zoneApi.delete(id);
      if (response.success) {
        loadZones();
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const filteredZones = (zones || []).filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Zones</h1>
          <p className="text-gray-600 mt-1">Gestion des zones géographiques</p>
        </div>
        <Button onClick={() => navigate('/zones/new')} icon={Plus}>
          Nouvelle Zone
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

      {/* Zones Grid */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des zones...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredZones.map((zone) => (
            <Card key={zone.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                      <p className="text-sm text-gray-500">{zone.code}</p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                {zone.parentZone && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Zone Parent:</span> {zone.parentZone.name}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => navigate(`/zones/${zone.id}/edit`)}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDelete(zone.id)}
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
      {!loading && filteredZones.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <MapPin className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune zone trouvée</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm
                ? 'Essayez de modifier votre recherche'
                : 'Commencez par créer votre première zone'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/zones/new')} icon={Plus} className="mt-4">
                Créer une zone
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
