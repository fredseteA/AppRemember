import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AddressForm, { isAddressComplete } from '../../components/address/AddressForm';
import { toast } from 'sonner';
import { User, Phone, Mail, Calendar, CreditCard, Save, ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/config';
import { profileStyles, pageBackground } from './shared/userPageStyles.js'
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    photo_url: ''
  });
  const { t } = useTranslation();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        cpf: response.data.cpf || '',
        birth_date: response.data.birth_date || '',
        photo_url: response.data.photo_url || ''
      });
      const addrRes = await axios.get(`${API}/auth/me/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (addrRes.data.has_address) setDeliveryAddress(addrRes.data.address);
    } catch {
      toast.error(t('userPages.profile.toastLoadError'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user, fetchUserData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('userPageStyles.profile.photoErrorType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('userPageStyles.profile.photoErrorSize'));
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        setFormData(prev => ({
          ...prev,
          photo_url: base64
        }));

        try {
          await axios.put(`${API}/auth/me`, {
            photo_url: base64
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success(t('userPages.profile.toastPhotoSuccess'));
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error(t('userPages.profile.toastPhotoError'));
        }
        
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing photo:', error);
      toast.error('Erro ao processar foto');
      setUploadingPhoto(false);
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/auth/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(t('userPages.profile.toastSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('userPages.profile.toastError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDeliveryAddress = async (addressData) => {
    setSavingDelivery(true);
    try {
      await axios.put(`${API}/auth/me/address`, addressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveryAddress(addressData);
      toast.success(t('userPages.profile.addressSaved'));
    } catch (error) {
      toast.error(t('userPages.profile.addressError'));
      throw error;
    } finally {
      setSavingDelivery(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: pageBackground,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid rgba(90,168,224,0.2)',
          borderTopColor: '#5aa8e0',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden"
      data-testid="profile-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
      }}
    >
      <style>{profileStyles}</style>

      {/* Nuvem esquerda */}
      <div
        className="absolute top-[60px] left-[-50px] w-44 md:w-64 opacity-55 pointer-events-none select-none z-0"
        style={{ animation: 'floatPR1 11s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud1.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {/* Nuvem direita */}
      <div
        className="absolute top-[80px] right-[-40px] w-36 md:w-56 opacity-40 pointer-events-none select-none z-0 hidden md:block"
        style={{ animation: 'floatPR2 8s ease-in-out infinite' }}
      >
        <img src="/clouds/cloud2.png" alt="" draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div
        className="relative z-10"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 20px',
          paddingTop: 'clamp(96px, 16vw, 152px)',
          paddingBottom: 'clamp(60px, 10vw, 120px)',
        }}
      >

        {/* Header */}
        <div style={{ animation: 'revealPR 0.75s cubic-bezier(.22,1,.36,1) both', marginBottom: 'clamp(28px, 5vw, 44px)' }}>
          <Link to="/dashboard" className="pr-btn-outline" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <ArrowLeft size={14} />
            {t('userPages.profile.backBtn')}
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 8 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)', flexShrink: 0 }} />
            <span style={{
              textTransform: 'uppercase', letterSpacing: '0.22em',
              fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e',
            }}>
              {t('userPages.profile.eyebrow')}
            </span>
          </div>

          <h1
            data-testid="page-title"
            style={{
              fontFamily: '"Georgia", serif',
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 700, color: '#1a2744', lineHeight: 1.1, marginBottom: 8,
            }}
          >
            {t('userPages.profile.title')}
          </h1>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.9rem', color: '#3a5070', lineHeight: 1.6 }}>
            {t('userPages.profile.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Card: Foto de Perfil ── */}
          <div className="pr-card" style={{ animation: 'slideCard 0.6s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
            <div className="pr-card-header">
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(90,168,224,0.12)',
                border: '1px solid rgba(90,168,224,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Camera size={16} style={{ color: '#5aa8e0' }} />
              </div>
              <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 700, color: '#1a2744' }}>
                {t('userPages.profile.photoCard')}
              </h2>
            </div>

            <div className="pr-card-body">
              <div className="pr-photo-row" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Avatar */}
                <div
                  className="pr-photo-wrap"
                  style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                  onClick={handlePhotoClick}
                >
                  <div style={{
                    width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid rgba(90,168,224,0.35)',
                    boxShadow: '0 4px 20px rgba(26,39,68,0.12)',
                    background: 'rgba(200,232,245,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt={t('userPages.profile.photoCard')}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={36} style={{ color: 'rgba(90,168,224,0.6)' }} />
                    )}
                  </div>
                  <div className="pr-photo-overlay">
                    {uploadingPhoto
                      ? <Loader2 size={24} style={{ color: 'white', animation: 'spin 0.8s linear infinite' }} />
                      : <Camera size={24} style={{ color: 'white' }} />
                    }
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    className="pr-btn-outline"
                    onClick={handlePhotoClick}
                    disabled={uploadingPhoto}
                    style={{ marginBottom: 8 }}
                  >
                    {uploadingPhoto ? (
                      <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> {t('userPages.profile.photoUploading')}</>
                    ) : (
                      <><Camera size={13} /> {formData.photo_url ? t('userPages.profile.photoChange') : t('userPages.profile.photoAdd')}</>
                    )}
                  </button>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: 'rgba(58,80,112,0.55)' }}>
                    {t('userPages.profile.photoHint')}
                  </p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} className="hidden" />
              </div>
            </div>
          </div>

          {/* ── Card: Informações Básicas ── */}
          <div className="pr-card" style={{ animation: 'slideCard 0.6s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
            <div className="pr-card-header">
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(90,168,224,0.12)',
                border: '1px solid rgba(90,168,224,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <User size={16} style={{ color: '#5aa8e0' }} />
              </div>
              <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 700, color: '#1a2744' }}>
                {t('userPages.profile.infoCard')}
              </h2>
            </div>

            <div className="pr-card-body">
              <div className="pr-grid-2">
                <div>
                  <label className="pr-label" htmlFor="name">{t('userPages.profile.fieldName')}</label>
                  <input id="name" name="name" className="pr-input"
                    value={formData.name} onChange={handleChange}
                    placeholder="Seu nome completo" data-testid="input-name" />
                </div>
                <div>
                  <label className="pr-label" htmlFor="email">{t('userPages.profile.fieldEmail')}</label>
                  <div className="pr-input-icon">
                    <Mail size={15} />
                    <input id="email" className="pr-input"
                      value={user?.email || ''} disabled data-testid="input-email" />
                  </div>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.7rem', color: 'rgba(58,80,112,0.5)', marginTop: 5 }}>
                    {t('userPages.profile.fieldEmailHint')}
                  </p>
                </div>
              </div>

              <div className="pr-grid-2">
                <div>
                  <label className="pr-label" htmlFor="phone">{t('userPages.profile.fieldPhone')}</label>
                  <div className="pr-input-icon">
                    <Phone size={15} />
                    <input id="phone" name="phone" className="pr-input"
                      value={formData.phone} onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000" maxLength={15} data-testid="input-phone" />
                  </div>
                </div>
                <div>
                  <label className="pr-label" htmlFor="birth_date">{t('userPages.profile.dateBirth')}</label>
                  <div className="pr-input-icon">
                    <Calendar size={15} />
                    <input id="birth_date" name="birth_date" type="date" className="pr-input"
                      value={formData.birth_date} onChange={handleChange} data-testid="input-birth-date" />
                  </div>
                </div>
              </div>

              <div>
                <label className="pr-label" htmlFor="cpf">{t('userPages.profile.fieldCpf')}</label>
                <div className="pr-input-icon">
                  <CreditCard size={15} />
                  <input id="cpf" name="cpf" className="pr-input"
                    value={formData.cpf} onChange={handleCPFChange}
                    placeholder="000.000.000-00" maxLength={14} data-testid="input-cpf" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Card: Endereço de Entrega ── */}
          <div className="pr-card" style={{ animation: 'slideCard 0.6s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
            <div className="pr-card-header">
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 16 }}>📦</span>
              </div>
              <div>
                <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 700, color: '#1a2744' }}>
                  {t('userPages.profile.addressCard')}
                </h2>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: 'rgba(58,80,112,0.55)', marginTop: 2 }}>
                  {t('userPages.profile.addressSubtitle')}
                </p>
              </div>
              {isAddressComplete(deliveryAddress) ? (
                <span style={{
                  marginLeft: 'auto', padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  fontSize: '0.7rem', fontWeight: 700, color: '#15803d',
                }}>
                  {t('userPages.profile.addressComplete')}
                </span>
              ) : (
                <span style={{
                  marginLeft: 'auto', padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  fontSize: '0.7rem', fontWeight: 700, color: '#92400e',
                }}>
                  {t('userPages.profile.addressMissing')}
                </span>
              )}
            </div>

            <div className="pr-card-body">
              <AddressForm
                initialData={deliveryAddress}
                onSave={handleSaveDeliveryAddress}
                loading={savingDelivery}
                submitLabel={t('userPages.profile.addressSaveBtn')}
                title=""
              />
            </div>
          </div>

          {/* Botão salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="pr-btn-save" disabled={saving} data-testid="button-save">
              {saving ? (
                <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />{t('userPages.profile.saving')}</>
              ) : (
                <><Save size={16} /> {t('userPages.profile.saveBtn')}</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
