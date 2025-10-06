import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, Smartphone } from 'lucide-react';
import { operatorApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface OperatorFormData {
  code: string;
  name: string;
  contractReference?: string;
  commissionAccount?: string;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Le code est requis')
    .matches(/^[A-Z]{3,10}$/, 'Code en majuscules, 3-10 caractères'),
  name: Yup.string()
    .required('Le nom est requis')
    .min(3, 'Minimum 3 caractères'),
  contractReference: Yup.string(),
  commissionAccount: Yup.string()
    .matches(/^[0-9]{4}-[A-Z]+-COMM$/, 'Format: XXXX-CODE-COMM (ex: 1000-MTN-COMM)')
});

export const OperatorForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadOperator();
    }
  }, [id]);

  const loadOperator = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await operatorApi.getById(id);
      if (response.success && response.data) {
        const operator = response.data;
        formik.setValues({
          code: operator.code,
          name: operator.name,
          contractReference: operator.contractReference || '',
          commissionAccount: operator.commissionAccount || ''
        });
      }
    } catch (error) {
      console.error('Error loading operator:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<OperatorFormData>({
    initialValues: {
      code: '',
      name: '',
      contractReference: '',
      commissionAccount: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = isEditMode
          ? await operatorApi.update(id!, values)
          : await operatorApi.create(values);

        if (response.success) {
          navigate('/operators');
        }
      } catch (error) {
        console.error('Error saving operator:', error);
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
            onClick={() => navigate('/operators')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'Opérateur' : 'Nouvel Opérateur'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Modifier les informations de l\'opérateur' : 'Créer un nouvel opérateur télécom'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Card title="Informations de l'Opérateur" icon={Smartphone}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Code Opérateur"
              name="code"
              placeholder="MTN"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.code && formik.errors.code}
              required
            />

            <Input
              label="Nom de l'Opérateur"
              name="name"
              placeholder="MTN South Sudan"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
              required
            />

            <Input
              label="Référence Contrat"
              name="contractReference"
              placeholder="MTN-SS-2024-001"
              value={formik.values.contractReference}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contractReference && formik.errors.contractReference}
            />

            <Input
              label="Compte Commission"
              name="commissionAccount"
              placeholder="1000-MTN-COMM"
              value={formik.values.commissionAccount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.commissionAccount && formik.errors.commissionAccount}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/operators')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={loading}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer l\'opérateur'}
          </Button>
        </div>
      </form>
    </div>
  );
};
