import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { zoneApi } from '../../services/api';
import type { Zone } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface ZoneFormData {
  code: string;
  name: string;
  parentZoneId?: string;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Le code est requis')
    .matches(/^[A-Z]{3}$/, 'Code à 3 lettres majuscules (ex: JUB)'),
  name: Yup.string()
    .required('Le nom est requis')
    .min(2, 'Minimum 2 caractères'),
  parentZoneId: Yup.string()
});

export const ZoneForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    loadZones();
    if (isEditMode) {
      loadZone();
    }
  }, [id]);

  const loadZones = async () => {
    try {
      const response = await zoneApi.getAll({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setZones(response.data.items.filter(z => z.id !== id));
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadZone = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await zoneApi.getById(id);
      if (response.success && response.data) {
        const zone = response.data;
        formik.setValues({
          code: zone.code,
          name: zone.name,
          parentZoneId: zone.parentZoneId || ''
        });
      }
    } catch (error) {
      console.error('Error loading zone:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<ZoneFormData>({
    initialValues: {
      code: '',
      name: '',
      parentZoneId: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = isEditMode
          ? await zoneApi.update(id!, values)
          : await zoneApi.create(values);

        if (response.success) {
          navigate('/zones');
        }
      } catch (error) {
        console.error('Error saving zone:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/zones')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier la Zone' : 'Nouvelle Zone'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Modifier les informations de la zone' : 'Créer une nouvelle zone géographique'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card title="Informations de la Zone" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Code Zone"
              name="code"
              placeholder="JUB"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code && formik.errors.code}
              required
            />

            <Input
              label="Nom de la Zone"
              name="name"
              placeholder="Juba"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Parent (optionnel)
              </label>
              <select
                name="parentZoneId"
                value={formik.values.parentZoneId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Aucune (zone racine)</option>
                {(zones || []).map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.code})
                  </option>
                ))}
              </select>
              {formik.touched.parentZoneId && formik.errors.parentZoneId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.parentZoneId}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/zones')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={loading}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer la zone'}
          </Button>
        </div>
      </form>
    </div>
  );
};
