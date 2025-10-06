import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import { userApi, roleApi } from '../../services/api';
import type { Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

interface UserFormData {
  username: string;
  phone: string;
  displayName?: string;
  email?: string;
  dob?: Date;
  password?: string;
  confirmPassword?: string;
  country: string;
  countryISO: string;
  roleIds: string[];
  isActive: boolean;
}

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Le nom d\'utilisateur est requis')
    .min(3, 'Minimum 3 caractères'),
  phone: Yup.string()
    .required('Le téléphone est requis')
    .matches(/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide'),
  displayName: Yup.string()
    .min(2, 'Minimum 2 caractères'),
  email: Yup.string()
    .email('Email invalide'),
  dob: Yup.date(),
  password: Yup.string()
    .min(6, 'Minimum 6 caractères'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas'),
  country: Yup.string()
    .required('Le pays est requis'),
  countryISO: Yup.string()
    .required('Le code pays est requis')
    .length(2, 'Code ISO à 2 lettres'),
  roleIds: Yup.array()
    .min(1, 'Au moins un rôle est requis'),
  isActive: Yup.boolean()
});

export const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    loadRoles();
    if (isEditMode) {
      loadUser();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const response = await roleApi.getAll({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setRoles(response.data.items);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUser = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await userApi.getById(id);
      if (response.success && response.data) {
        const user = response.data;
        formik.setValues({
          username: user.username,
          phone: user.phone,
          displayName: user.displayName || '',
          email: user.email || '',
          dob: user.dob,
          password: '',
          confirmPassword: '',
          country: user.country,
          countryISO: user.countryISO,
          roleIds: user.roles?.map(r => r.id) || [],
          isActive: user.isActive
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<UserFormData>({
    initialValues: {
      username: '',
      phone: '',
      displayName: '',
      email: '',
      dob: undefined,
      password: '',
      confirmPassword: '',
      country: 'South Sudan',
      countryISO: 'SS',
      roleIds: [],
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = isEditMode
          ? await userApi.update(id!, values)
          : await userApi.create(values);

        if (response.success) {
          navigate('/users');
        }
      } catch (error) {
        console.error('Error saving user:', error);
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
            onClick={() => navigate('/users')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Modifier les informations de l\'utilisateur' : 'Créer un nouveau compte utilisateur'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card title="Informations de base" icon={UserIcon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nom d'utilisateur"
              name="username"
              placeholder="johndoe"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && formik.errors.username}
              required
            />

            <Input
              label="Téléphone"
              name="phone"
              type="tel"
              placeholder="+211912345678"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && formik.errors.phone}
              required
            />

            <Input
              label="Nom d'affichage"
              name="displayName"
              placeholder="John Doe"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.displayName && formik.errors.displayName}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
            />

            <Input
              label="Date de naissance"
              name="dob"
              type="date"
              value={formik.values.dob ? new Date(formik.values.dob).toISOString().split('T')[0] : ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dob && formik.errors.dob}
            />

            <Input
              label="Pays"
              name="country"
              placeholder="South Sudan"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.country && formik.errors.country}
              required
            />

            <Input
              label="Code ISO Pays"
              name="countryISO"
              placeholder="SS"
              value={formik.values.countryISO}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.countryISO && formik.errors.countryISO}
              required
            />
          </div>
        </Card>

        {/* Sécurité */}
        <Card title="Sécurité">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={isEditMode ? "Nouveau mot de passe" : "Mot de passe"}
              name="password"
              type="password"
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              required={!isEditMode}
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              required={!isEditMode}
            />
          </div>
        </Card>

        {/* Rôles et Permissions */}
        <Card title="Rôles et Permissions">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôles <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {(roles || []).map(role => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formik.values.roleIds.includes(role.id)}
                      onChange={(e) => {
                        const newRoleIds = e.target.checked
                          ? [...formik.values.roleIds, role.id]
                          : formik.values.roleIds.filter(id => id !== role.id);
                        formik.setFieldValue('roleIds', newRoleIds);
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{role.name}</span>
                    {role.description && (
                      <span className="ml-2 text-sm text-gray-500">- {role.description}</span>
                    )}
                  </label>
                ))}
              </div>
              {formik.touched.roleIds && formik.errors.roleIds && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.roleIds}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Compte actif
              </label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/users')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={loading}
          >
            {isEditMode ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </Button>
        </div>
      </form>
    </div>
  );
};
