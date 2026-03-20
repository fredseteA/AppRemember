import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Settings, Save, Loader2, RefreshCw,
  TrendingUp, Package, Truck, CreditCard, Users,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { API } from '@/config.js';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

// ─── Input numérico estilizado ────────────────────────────────────────────────
const CostInput = ({ label, value, onChange, prefix = 'R$', suffix, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
      {label}
    </label>
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-[#64748b] font-medium select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`
          w-full bg-[#0b121b] border border-[#2d3a52] rounded-lg py-2.5 text-white text-sm
          focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]/30
          transition-colors
          ${prefix ? 'pl-9' : 'pl-3'}
          ${suffix ? 'pr-10' : 'pr-3'}
        `}
      />
      {suffix && (
        <span className="absolute right-3 text-sm text-[#64748b] font-medium select-none">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="text-xs text-[#64748b]">{hint}</p>}
  </div>
);

// ─── Card de lucro estimado ───────────────────────────────────────────────────
const ProfitCard = ({ title, data, color }) => {
  if (!data) return null;
  const rows = [
    { label: 'Preço de venda',   value: fmt(data.preco_produto),     bold: false },
    data.desconto > 0
      ? { label: 'Desconto ao cliente', value: `- ${fmt(data.desconto)}`, color: '#f59e0b' }
      : null,
    data.preco_com_desconto
      ? { label: 'Valor recebido',      value: fmt(data.preco_com_desconto), color: '#94a3b8' }
      : null,
    { label: 'Custo do produto', value: `- ${fmt(data.custo_produto)}`,  color: '#ef4444' },
    { label: 'Frete médio',      value: `- ${fmt(data.frete)}`,          color: '#ef4444' },
    { label: 'Taxa gateway',     value: `- ${fmt(data.taxa_gateway)}`,   color: '#ef4444' },
    data.comissao > 0
      ? { label: 'Comissão afiliado', value: `- ${fmt(data.comissao)}`,  color: '#f59e0b' }
      : null,
  ].filter(Boolean);

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: `${color}08`,
        borderColor: `${color}25`,
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color }}>
        {title}
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-[#94a3b8]">{row.label}</span>
            <span style={{ color: row.color || '#e2e8f0' }}>{row.value}</span>
          </div>
        ))}
        <div className="border-t border-[#2d3a52] pt-2 mt-2 flex justify-between items-center">
          <span className="text-sm font-bold text-white">Lucro estimado</span>
          <span className="text-lg font-bold" style={{ color }}>
            {fmt(data.lucro)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#64748b]">Margem</span>
          <span className="text-xs font-semibold" style={{ color }}>
            {data.margem_pct}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const AdminCostSettings = () => {
  const { token } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [config, setConfig]     = useState(null);
  const [preview, setPreview]   = useState({ sem: null, com: null, custo: 0 });

  const loadConfig = useCallback(async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API}/admin/settings/costs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setConfig(res.data.config);
    setPreview({
      sem:   res.data.lucro_sem_afiliado,
      com:   res.data.lucro_com_afiliado,
      custo: res.data.custo_total,
    });
  } catch {
    toast.error('Erro ao carregar configurações de custo');
  } finally {
    setLoading(false);
  }
}, [token]);

useEffect(() => { if (token) loadConfig(); }, [token, loadConfig]);

  // Atualiza preview localmente ao digitar
  const updateField = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Recalcula preview sempre que config mudar
  useEffect(() => {
    if (!config) return;
    const c = config;

    const custoTotal = c.custo_placa + c.custo_caixa + c.custo_palha + c.custo_papel_seda + c.custo_fitilho;
    const taxaSem    = (c.preco_produto * c.taxa_percentual_gateway) + c.taxa_fixa_gateway;
    const lucroSem   = c.preco_produto - custoTotal - c.frete_medio - taxaSem;

    const precoDesc  = c.preco_produto * (1 - c.desconto_percentual_afiliado);
    const taxaCom    = (precoDesc * c.taxa_percentual_gateway) + c.taxa_fixa_gateway;
    const comissao   = precoDesc * c.comissao_percentual_afiliado;
    const lucroCom   = precoDesc - custoTotal - c.frete_medio - taxaCom - comissao;

    setPreview({
      custo: custoTotal,
      sem: {
        preco_produto:  c.preco_produto,
        custo_produto:  custoTotal,
        frete:          c.frete_medio,
        taxa_gateway:   taxaSem,
        comissao:       0,
        desconto:       0,
        lucro:          lucroSem,
        margem_pct:     c.preco_produto > 0 ? ((lucroSem / c.preco_produto) * 100).toFixed(1) : 0,
      },
      com: {
        preco_produto:      c.preco_produto,
        desconto:           c.preco_produto - precoDesc,
        preco_com_desconto: precoDesc,
        custo_produto:      custoTotal,
        frete:              c.frete_medio,
        taxa_gateway:       taxaCom,
        comissao:           comissao,
        lucro:              lucroCom,
        margem_pct:         c.preco_produto > 0 ? ((lucroCom / c.preco_produto) * 100).toFixed(1) : 0,
      },
    });
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings/costs`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Configurações salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-6 animate-pulse">
        <div className="h-6 w-56 bg-[#2d3a52] rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-[#2d3a52] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1a2535] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
            <Settings className="text-[#3b82f6]" size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Configurações de Custo do Produto</p>
            <p className="text-xs text-[#94a3b8]">
              Custo total: {fmt(preview.custo)} · Lucro s/ afil.: {fmt(preview.sem?.lucro)} · c/ afil.: {fmt(preview.com?.lucro)}
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={18} className="text-[#94a3b8]" />
          : <ChevronDown size={18} className="text-[#94a3b8]" />
        }
      </button>

      {expanded && (
        <div className="border-t border-[#2d3a52] p-6 space-y-8">

          {/* Preço do produto */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#10b981]" />
              <h3 className="text-sm font-semibold text-[#10b981] uppercase tracking-wider">Preço do Produto</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CostInput
                label="Preço de venda"
                value={config.preco_produto}
                onChange={v => updateField('preco_produto', v)}
                hint="Valor cobrado do cliente"
              />
            </div>
          </div>

          {/* Custos físicos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-[#3b82f6]" />
              <h3 className="text-sm font-semibold text-[#3b82f6] uppercase tracking-wider">Custos do Produto</h3>
              <span className="ml-auto text-xs text-[#94a3b8]">
                Total: <span className="text-white font-semibold">{fmt(preview.custo)}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CostInput label="Placa QR (metal)" value={config.custo_placa}       onChange={v => updateField('custo_placa', v)} />
              <CostInput label="Caixa marrom"      value={config.custo_caixa}       onChange={v => updateField('custo_caixa', v)} />
              <CostInput label="Palha decorativa"  value={config.custo_palha}       onChange={v => updateField('custo_palha', v)} />
              <CostInput label="Papel de seda"     value={config.custo_papel_seda}  onChange={v => updateField('custo_papel_seda', v)} />
              <CostInput label="Fitilho"           value={config.custo_fitilho}     onChange={v => updateField('custo_fitilho', v)} />
            </div>
          </div>

          {/* Logística */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Truck size={16} className="text-[#f59e0b]" />
              <h3 className="text-sm font-semibold text-[#f59e0b] uppercase tracking-wider">Logística</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CostInput label="Frete médio" value={config.frete_medio} onChange={v => updateField('frete_medio', v)} hint="Média dos fretes pagos" />
            </div>
          </div>

          {/* Gateway */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[#8b5cf6]" />
              <h3 className="text-sm font-semibold text-[#8b5cf6] uppercase tracking-wider">Taxa de Pagamento</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CostInput
                label="Taxa percentual"
                value={(config.taxa_percentual_gateway * 100).toFixed(2)}
                onChange={v => updateField('taxa_percentual_gateway', v / 100)}
                prefix=""
                suffix="%"
                hint="Ex: 4.99 para 4,99%"
              />
              <CostInput
                label="Taxa fixa"
                value={config.taxa_fixa_gateway}
                onChange={v => updateField('taxa_fixa_gateway', v)}
                hint="Valor fixo por transação"
              />
            </div>
            <div className="mt-3 flex items-start gap-2 p-3 bg-[#8b5cf6]/5 border border-[#8b5cf6]/15 rounded-lg">
              <Info size={14} className="text-[#8b5cf6] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#94a3b8]">
                Mercado Pago padrão: <span className="text-white">4,99% + R$0,40</span> por transação.
              </p>
            </div>
          </div>

          {/* Afiliados */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#ef4444]" />
              <h3 className="text-sm font-semibold text-[#ef4444] uppercase tracking-wider">Afiliados</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CostInput
                label="Desconto ao cliente"
                value={(config.desconto_percentual_afiliado * 100).toFixed(1)}
                onChange={v => updateField('desconto_percentual_afiliado', v / 100)}
                prefix=""
                suffix="%"
                hint="Desconto dado ao comprador"
              />
              <CostInput
                label="Comissão do afiliado"
                value={(config.comissao_percentual_afiliado * 100).toFixed(1)}
                onChange={v => updateField('comissao_percentual_afiliado', v / 100)}
                prefix=""
                suffix="%"
                hint="% pago ao parceiro"
              />
            </div>
          </div>

          {/* Preview de lucro */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#94a3b8]" />
              <h3 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">Preview de Lucro por Venda</h3>
              <span className="text-xs text-[#64748b] ml-1">(atualiza em tempo real)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfitCard title="Sem afiliado" data={preview.sem} color="#10b981" />
              <ProfitCard title="Com afiliado" data={preview.com} color="#f59e0b" />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2d3a52]">
            <button
              onClick={loadConfig}
              className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
            >
              <RefreshCw size={14} /> Recarregar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] hover:bg-[#3b82f6]/90 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                : <><Save size={15} /> Salvar configurações</>
              }
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminCostSettings;