import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import AddressForm, { isAddressComplete } from '../components/AddressForm';
import { toast } from 'sonner';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Save, ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserData = async () => {
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
      // Buscar endereço de entrega separado
      const addrRes = await axios.get(`${API}/auth/me/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (addrRes.data.has_address) {
        setDeliveryAddress(addrRes.data.address);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

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

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        // Atualizar o formData localmente
        setFormData(prev => ({
          ...prev,
          photo_url: base64
        }));

        // Salvar no backend
        try {
          await axios.put(`${API}/auth/me`, {
            photo_url: base64
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Foto atualizada com sucesso!');
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Erro ao salvar foto');
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

  const formatZipCode = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
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

  const handleZipCodeChange = (e) => {
    const formatted = formatZipCode(e.target.value);
    setFormData(prev => ({ ...prev, zip_code: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/auth/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
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
      toast.success('Endereço de entrega salvo!');
    } catch (error) {
      toast.error('Erro ao salvar endereço de entrega');
      throw error;
    } finally {
      setSavingDelivery(false);
    }
  };

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  if (loading) {
    return (
      <div
        style={{
          background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 40%, #eef8fb 100%)',
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
      <style>{`
        @keyframes floatPR1 {
          0%,100% { transform: translateY(0) translateX(0); }
          45%     { transform: translateY(-14px) translateX(8px); }
        }
        @keyframes floatPR2 {
          0%,100% { transform: translateY(0) translateX(0); }
          55%     { transform: translateY(-9px) translateX(-6px); }
        }
        @keyframes revealPR {
          from { opacity: 0; transform: translateY(24px); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes slideCard {
          from { opacity: 0; transform: translateY(18px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pr-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(26,39,68,0.12);
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          font-family: "Georgia", serif;
          font-size: 1rem;
          color: #1a2744;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          -webkit-appearance: none;
          appearance: none;
          box-sizing: border-box;
        }
        .pr-input:focus {
          border-color: #5aa8e0;
          box-shadow: 0 0 0 3px rgba(90,168,224,0.15);
        }
        .pr-input:disabled {
          background: rgba(255,255,255,0.35);
          color: rgba(58,80,112,0.5);
          cursor: not-allowed;
        }
        .pr-input::placeholder { color: rgba(58,80,112,0.4); }
        .pr-select {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(26,39,68,0.12);
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          font-family: "Georgia", serif;
          font-size: 1rem;
          color: #1a2744;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          -webkit-appearance: none;
          appearance: none;
          box-sizing: border-box;
          cursor: pointer;
        }
        .pr-select:focus {
          border-color: #5aa8e0;
          box-shadow: 0 0 0 3px rgba(90,168,224,0.15);
        }
        .pr-label {
          display: block;
          font-family: "Georgia", serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2a3d5e;
          margin-bottom: 8px;
        }
        .pr-card {
          background: rgba(255,255,255,0.62);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.85);
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(26,39,68,0.08);
          overflow: hidden;
          margin-bottom: 18px;
        }
        .pr-card-header {
          padding: clamp(18px, 3vw, 24px) clamp(20px, 4vw, 30px) clamp(14px, 2vw, 18px);
          border-bottom: 1px solid rgba(26,39,68,0.07);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pr-card-body {
          padding: clamp(20px, 4vw, 28px) clamp(20px, 4vw, 30px);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .pr-input-icon {
          position: relative;
        }
        .pr-input-icon .pr-input { padding-left: 42px; }
        .pr-input-icon svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(90,168,224,0.7);
          pointer-events: none;
        }
        .pr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pr-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        .pr-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 999px;
          background: #1a2744;
          color: white;
          font-family: "Georgia", serif;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          border: none;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 20px rgba(26,39,68,0.18);
          min-height: 48px;
          -webkit-tap-highlight-color: transparent;
        }
        .pr-btn-save:hover:not(:disabled) {
          background: #2a3d5e;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(26,39,68,0.22);
        }
        .pr-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .pr-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          border-radius: 999px;
          background: transparent;
          color: #3a5070;
          font-family: "Georgia", serif;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1.5px solid rgba(26,39,68,0.15);
          cursor: pointer;
          transition: all 0.25s ease;
          min-height: 40px;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .pr-btn-outline:hover {
          border-color: rgba(90,168,224,0.5);
          color: #1a2744;
          background: rgba(90,168,224,0.06);
        }
        .pr-photo-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(26,39,68,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .pr-photo-wrap:hover .pr-photo-overlay { opacity: 1; }
        @media (max-width: 600px) {
          .pr-grid-2 { grid-template-columns: 1fr; }
          .pr-grid-3 { grid-template-columns: 1fr 1fr; }
          .pr-photo-row { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .pr-btn-save { width: 100%; }
        }
        @media (max-width: 380px) {
          .pr-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

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
            Voltar ao Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 8 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)', flexShrink: 0 }} />
            <span style={{
              textTransform: 'uppercase', letterSpacing: '0.22em',
              fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e',
            }}>
              Painel do usuário
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
            Minha Conta
          </h1>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.9rem', color: '#3a5070', lineHeight: 1.6 }}>
            Gerencie suas informações pessoais
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
                Foto de Perfil
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
                      <img src={formData.photo_url} alt="Foto de perfil"
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
                      <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Enviando...</>
                    ) : (
                      <><Camera size={13} /> {formData.photo_url ? 'Alterar foto' : 'Adicionar foto'}</>
                    )}
                  </button>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: 'rgba(58,80,112,0.55)' }}>
                    JPG, PNG ou GIF. Máximo 5MB.
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
                Informações Básicas
              </h2>
            </div>

            <div className="pr-card-body">
              <div className="pr-grid-2">
                <div>
                  <label className="pr-label" htmlFor="name">Nome Completo</label>
                  <input id="name" name="name" className="pr-input"
                    value={formData.name} onChange={handleChange}
                    placeholder="Seu nome completo" data-testid="input-name" />
                </div>
                <div>
                  <label className="pr-label" htmlFor="email">E-mail</label>
                  <div className="pr-input-icon">
                    <Mail size={15} />
                    <input id="email" className="pr-input"
                      value={user?.email || ''} disabled data-testid="input-email" />
                  </div>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.7rem', color: 'rgba(58,80,112,0.5)', marginTop: 5 }}>
                    O e-mail não pode ser alterado
                  </p>
                </div>
              </div>

              <div className="pr-grid-2">
                <div>
                  <label className="pr-label" htmlFor="phone">Telefone / WhatsApp</label>
                  <div className="pr-input-icon">
                    <Phone size={15} />
                    <input id="phone" name="phone" className="pr-input"
                      value={formData.phone} onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000" maxLength={15} data-testid="input-phone" />
                  </div>
                </div>
                <div>
                  <label className="pr-label" htmlFor="birth_date">Data de Nascimento</label>
                  <div className="pr-input-icon">
                    <Calendar size={15} />
                    <input id="birth_date" name="birth_date" type="date" className="pr-input"
                      value={formData.birth_date} onChange={handleChange} data-testid="input-birth-date" />
                  </div>
                </div>
              </div>

              <div>
                <label className="pr-label" htmlFor="cpf">CPF</label>
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
                  Endereço de Entrega
                </h2>
                <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: 'rgba(58,80,112,0.55)', marginTop: 2 }}>
                  Usado para entrega de placas físicas
                </p>
              </div>
              {isAddressComplete(deliveryAddress) ? (
                <span style={{
                  marginLeft: 'auto', padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  fontSize: '0.7rem', fontWeight: 700, color: '#15803d',
                }}>
                  ✅ Completo
                </span>
              ) : (
                <span style={{
                  marginLeft: 'auto', padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                  fontSize: '0.7rem', fontWeight: 700, color: '#92400e',
                }}>
                  ⚠️ Não preenchido
                </span>
              )}
            </div>

            <div className="pr-card-body">
              <AddressForm
                initialData={deliveryAddress}
                onSave={handleSaveDeliveryAddress}
                loading={savingDelivery}
                submitLabel="Salvar endereço de entrega"
                title=""
              />
            </div>
          </div>

          {/* Botão salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="pr-btn-save" disabled={saving} data-testid="button-save">
              {saving ? (
                <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Salvando...</>
              ) : (
                <><Save size={16} /> Salvar Alterações</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
