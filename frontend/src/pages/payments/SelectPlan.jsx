import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Check, Loader2, Tag, X, CheckCircle2 } from 'lucide-react';
import AddressCheckStep from '../../components/address/AddressCheckStep';
import SecurityBadge from '../../components/shared/SecurityBadge';
import { API } from '@/config';

const SelectPlan = () => {
  const { id } = useParams();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [memorial, setMemorial] = useState(null);

  const [supporterCode, setSupporterCode]   = useState('');
  const [codeInput, setCodeInput]           = useState('');
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeValid, setCodeValid]           = useState(false);
  const [codeError, setCodeError]           = useState('');
  const [discountInfo, setDiscountInfo]     = useState(null);

  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showAddressStep, setShowAddressStep] = useState(false);
  const [pendingPlan, setPendingPlan]         = useState(null);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const token = await getToken();
        const res = await axios.get(`${API}/memorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMemorial(res.data);
      } catch (e) {
        console.error('Error:', e);
      }
    };
    if (user) fetchMemorial();
  }, [id, user]);

  const validateCode = useCallback(async (codeToValidate) => {
    const code = (codeToValidate || codeInput).trim().toUpperCase();
    if (!code) return;
    setCodeValidating(true);
    setCodeError('');
    setCodeValid(false);
    setDiscountInfo(null);
    try {
      const res = await axios.get(`${API}/supporters/validate/${code}`);
      if (res.data.valid) {
        setSupporterCode(code);
        setCodeInput(code);
        setCodeValid(true);
        setDiscountInfo({
          discount_percentage: res.data.discount_percentage,
          supporter_name: res.data.supporter_name,
        });
        toast.success(`Código ${code} aplicado! ${res.data.discount_percentage}% de desconto`);
      } else {
        setCodeError('Código inválido ou inativo.');
      }
    } catch (e) {
      const msg = e.response?.data?.detail || 'Código inválido ou inativo.';
      setCodeError(msg);
    } finally {
      setCodeValidating(false);
    }
  }, [codeInput]);

  useEffect(() => {
    const apoio = searchParams.get('apoio') || sessionStorage.getItem('apoio_code');
    if (apoio) {
      setCodeInput(apoio.toUpperCase());
      validateCode(apoio.toUpperCase());
    }
  }, []);

  const removeCode = () => {
    setSupporterCode('');
    setCodeInput('');
    setCodeValid(false);
    setCodeError('');
    setDiscountInfo(null);
  };

  const plans = [
    {
      id: 'digital',
      name: 'Plano Digital',
      price: 29.90,
      features: [
        'Memorial digital completo',
        'Galeria de até 10 fotos',
        'Áudio de homenagem',
        'QR Code digital',
        'Publicação instantânea',
        'Hospedagem eterna'
      ]
    },
    {
      id: 'plaque',
      name: 'Plano Placa QR Code',
      price: 149.90,
      features: [
        'Tudo do Plano Digital',
        'Placa física em aço inox',
        'QR Code gravado permanente',
        'Envio para todo Brasil',
        'Suporte prioritário',
        'Rastreamento de entrega'
      ],
      highlighted: true
    }
  ];

  const getFinalPrice = (originalPrice) => {
    if (!codeValid || !discountInfo) return originalPrice;
    const disc = originalPrice * (discountInfo.discount_percentage / 100);
    return originalPrice - disc;
  };

  const PHYSICAL_PLANS = ['plaque', 'complete', 'qrcode_plaque'];

  const handleSelectPlan = async (plan) => {
    if (!user) { toast.error('Faça login para continuar'); return; }
    if (PHYSICAL_PLANS.includes(plan.id)) {
      setPendingPlan(plan);
      setShowAddressStep(true);
      return;
    }
    await processCheckout(plan, null);
  };

  const processCheckout = async (plan, address) => {
    setLoading(true);
    try {
      const token = await getToken();
      const payload = {
        memorial_id: id,
        plan_type: plan.id,
        transaction_amount: plan.price,
        description: `${plan.name} - Memorial de ${memorial?.person_data?.full_name || 'homenageado'}`,
        payer_email: user.email,
        payment_method_id: 'account_money',
        supporter_code: supporterCode || null,
        delivery_address: address || null,
      };
      const response = await axios.post(
        `${API}/payments/create-checkout`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.checkout_url) {
        toast.success('Redirecionando para o pagamento...');
        window.location.href = response.data.checkout_url;
      } else {
        toast.error('Erro ao criar checkout. Tente novamente.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Erro ao processar pagamento';
      toast.error(errorMessage);
      console.error('Erro pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showAddressStep && pendingPlan) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '100px 20px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <AddressCheckStep
            authToken={getToken}
            apiBase={API}
            onAddressReady={(addr) => {
              setDeliveryAddress(addr);
              setShowAddressStep(false);
              processCheckout(pendingPlan, addr);
            }}
            onBack={() => { setShowAddressStep(false); setPendingPlan(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-hidden"
      data-testid="select-plan-page"
      style={{
        background: 'linear-gradient(180deg, #c8e8f5 0%, #ddf0f7 35%, #eef8fb 70%, #eef8fb 100%)',
        fontFamily: '"Georgia", serif',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes floatSP1 { 0%,100%{transform:translateY(0) translateX(0);} 45%{transform:translateY(-14px) translateX(8px);} }
        @keyframes floatSP2 { 0%,100%{transform:translateY(0) translateX(0);} 55%{transform:translateY(-9px) translateX(-6px);} }
        @keyframes revealSP { from{opacity:0;transform:translateY(24px);filter:blur(5px);} to{opacity:1;transform:translateY(0);filter:blur(0);} }
        @keyframes revealCard { from{opacity:0;transform:translateY(20px) scale(0.98);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .sp-card { transition:transform 0.38s cubic-bezier(.22,1,.36,1),box-shadow 0.38s ease; }
        .sp-card:hover { transform:translateY(-6px); box-shadow:0 28px 60px rgba(26,39,68,0.14) !important; }
        .sp-btn-primary { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px 28px; border-radius:999px; background:#1a2744; color:white; font-family:"Georgia",serif; font-size:0.9rem; font-weight:700; letter-spacing:0.06em; border:none; cursor:pointer; transition:background 0.25s ease,transform 0.25s ease,box-shadow 0.25s ease; box-shadow:0 6px 20px rgba(26,39,68,0.2); min-height:52px; -webkit-tap-highlight-color:transparent; }
        .sp-btn-primary:hover:not(:disabled) { background:#2a3d5e; transform:translateY(-2px); }
        .sp-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
        .sp-btn-outline { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px 28px; border-radius:999px; background:transparent; color:#2a3d5e; font-family:"Georgia",serif; font-size:0.9rem; font-weight:700; letter-spacing:0.06em; border:1.5px solid rgba(26,39,68,0.18); cursor:pointer; transition:all 0.25s ease; min-height:52px; -webkit-tap-highlight-color:transparent; }
        .sp-btn-outline:hover:not(:disabled) { border-color:rgba(90,168,224,0.5); background:rgba(90,168,224,0.06); color:#1a2744; }
        .sp-btn-outline:disabled { opacity:0.6; cursor:not-allowed; }
        .sp-feature { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid rgba(26,39,68,0.06); }
        .sp-feature:last-child { border-bottom:none; }
        .code-input-wrap { display:flex; gap:8px; align-items:center; }
        .code-input { flex:1; padding:11px 16px; border-radius:999px; border:1.5px solid rgba(26,39,68,0.16); background:rgba(255,255,255,0.7); font-family:"Georgia",serif; font-size:0.85rem; color:#1a2744; letter-spacing:0.08em; text-transform:uppercase; outline:none; transition:border-color 0.2s; }
        .code-input:focus { border-color:rgba(90,168,224,0.6); }
        .code-input::placeholder { text-transform:none; letter-spacing:0; color:rgba(58,80,112,0.45); }
        .code-btn { padding:11px 20px; border-radius:999px; background:#1a2744; color:white; font-family:"Georgia",serif; font-size:0.78rem; font-weight:700; letter-spacing:0.06em; border:none; cursor:pointer; transition:background 0.2s; white-space:nowrap; }
        .code-btn:hover:not(:disabled) { background:#2a3d5e; }
        .code-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div className="absolute top-[-10px] left-[-50px] w-44 md:w-72 opacity-55 pointer-events-none select-none"
        style={{ animation: 'floatSP1 11s ease-in-out infinite' }}>
        <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>
      <div className="absolute top-[4%] right-[-40px] w-36 md:w-60 opacity-40 pointer-events-none select-none hidden md:block"
        style={{ animation: 'floatSP2 8s ease-in-out infinite' }}>
        <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div className="relative z-10" style={{
        maxWidth: 960, margin: '0 auto', padding: '0 20px',
        paddingTop: 'clamp(100px, 16vw, 160px)',
        paddingBottom: 'clamp(60px, 10vw, 120px)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 52px)', animation: 'revealSP 0.75s cubic-bezier(.22,1,.36,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)' }} />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.62rem', fontWeight: 700, color: '#2a3d5e' }}>
              Publicar memorial
            </span>
            <div style={{ height: 1, width: 28, background: 'rgba(42,61,94,0.3)' }} />
          </div>
          <h1 data-testid="page-title" style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.9rem, 6vw, 3.4rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.1, marginBottom: 16 }}>
            Escolha seu Plano
          </h1>
          <p style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: '#3a5070', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 0' }}>
            Selecione o plano ideal para eternizar as memórias
          </p>
        </div>

        {/* Código affiliate */}
        <div style={{ maxWidth: 440, margin: '0 auto clamp(36px, 6vw, 56px)', animation: 'revealSP 0.75s cubic-bezier(.22,1,.36,1) 0.08s both' }}>
          {!codeValid ? (
            <>
              <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2a3d5e', marginBottom: 10, textAlign: 'center' }}>
                Tem um código de affiliate?
              </p>
              <div className="code-input-wrap">
                <input className="code-input" placeholder="Ex: JOAO2024" value={codeInput}
                  onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && validateCode()} maxLength={20} data-testid="supporter-code-input" />
                <button className="code-btn" onClick={() => validateCode()} disabled={!codeInput.trim() || codeValidating} data-testid="apply-code-btn">
                  {codeValidating ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Aplicar'}
                </button>
              </div>
              {codeError && <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.78rem', color: '#e53e3e', marginTop: 8, textAlign: 'center' }}>{codeError}</p>}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34,197,94,0.10)', border: '1.5px solid rgba(34,197,94,0.3)', borderRadius: 999, padding: '10px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} style={{ color: '#15803d', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                    Código <span style={{ letterSpacing: '0.08em' }}>{supporterCode}</span> aplicado
                  </p>
                  <p style={{ fontFamily: '"Georgia", serif', fontSize: '0.72rem', color: '#3a5070', marginTop: 2 }}>
                    {discountInfo.discount_percentage}% de desconto no plano escolhido
                  </p>
                </div>
              </div>
              <button onClick={removeCode} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b' }} title="Remover código">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 28px)', maxWidth: 820, margin: '0 auto' }}>
          {plans.map((plan, index) => {
            const originalPrice = plan.price;
            const finalPrice    = getFinalPrice(originalPrice);
            const hasDiscount   = codeValid && finalPrice < originalPrice;

            return (
              <div key={plan.id} className="sp-card" data-testid={`plan-card-${plan.id}`} style={{
                borderRadius: 28, overflow: 'hidden',
                background: plan.highlighted ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: plan.highlighted ? '1.5px solid rgba(90,168,224,0.45)' : '1px solid rgba(255,255,255,0.85)',
                boxShadow: plan.highlighted ? '0 16px 52px rgba(26,39,68,0.13)' : '0 8px 32px rgba(26,39,68,0.08)',
                animation: `revealCard 0.65s cubic-bezier(.22,1,.36,1) ${0.1 + index * 0.12}s both`,
                display: 'flex', flexDirection: 'column',
              }}>
                {plan.highlighted && (
                  <div style={{ background: 'linear-gradient(90deg, #5aa8e0 0%, #2a3d5e 100%)', padding: '10px 24px', textAlign: 'center' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '0.6rem', fontWeight: 700, color: 'white' }}>Recomendado</span>
                  </div>
                )}

                <div style={{ padding: 'clamp(24px, 4vw, 36px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 700, color: '#1a2744', marginBottom: 12 }}>
                      {plan.name}
                    </h3>
                    <div style={{ marginBottom: 6 }}>
                      {hasDiscount && (
                        <div style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: 400, color: 'rgba(58,80,112,0.45)', textDecoration: 'line-through', lineHeight: 1, marginBottom: 4 }}>
                          R$ {originalPrice.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                      <div style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: hasDiscount ? '#15803d' : '#1a2744', lineHeight: 1 }}>
                        R$ {finalPrice.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: '"Georgia", serif', fontSize: '0.75rem', color: 'rgba(58,80,112,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Pagamento único
                      </span>
                      {hasDiscount && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 999, padding: '2px 10px', fontFamily: '"Georgia", serif', fontSize: '0.7rem', fontWeight: 700, color: '#15803d' }}>
                          <Tag size={10} />-{discountInfo.discount_percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'rgba(26,39,68,0.07)', marginBottom: 20 }} />

                  <div style={{ flex: 1, marginBottom: 28 }}>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="sp-feature">
                        <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: plan.highlighted ? 'rgba(90,168,224,0.15)' : 'rgba(26,39,68,0.07)', border: plan.highlighted ? '1px solid rgba(90,168,224,0.3)' : '1px solid rgba(26,39,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                          <Check size={12} style={{ color: plan.highlighted ? '#5aa8e0' : '#2a3d5e' }} />
                        </div>
                        <span style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(0.8rem, 2vw, 0.88rem)', color: '#3a5070', lineHeight: 1.5 }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botão */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                    {plan.highlighted ? (
                      <button className="sp-btn-primary" onClick={() => handleSelectPlan(plan)} disabled={loading} data-testid={`button-select-${plan.id}`}>
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Processando...</> : 'Selecionar Plano'}
                      </button>
                    ) : (
                      <button className="sp-btn-outline" onClick={() => handleSelectPlan(plan)} disabled={loading} data-testid={`button-select-${plan.id}`}>
                        {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Processando...</> : 'Selecionar Plano'}
                      </button>
                    )}

                    <SecurityBadge variant="minimal" style={{ marginTop: 20 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <SecurityBadge variant="bar" />

      </div>
    </div>
  );
};

export default SelectPlan;