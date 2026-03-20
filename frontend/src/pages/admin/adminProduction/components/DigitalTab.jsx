import { useState, useMemo } from 'react';
import { Smartphone, Search } from 'lucide-react';
import { DigitalCard } from './index';
import { Section } from '../utils';

const DigitalTab = ({ queue, onAction }) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return queue;
    const s = search.toLowerCase();
    return queue.filter(o =>
      o.person_name?.toLowerCase().includes(s) ||
      o.user_email?.toLowerCase().includes(s) ||
      o.id?.toLowerCase().includes(s)
    );
  }, [queue, search]);

  const active    = filtered.filter(o => o.status !== 'cancelled');
  const cancelled = filtered.filter(o => o.status === 'cancelled');

  if (queue.length === 0) {
    return (
      <div className="bg-[#16202e] border border-[#2d3a52] rounded-xl p-12 text-center">
        <Smartphone className="mx-auto mb-4 text-[#94a3b8]" size={48} />
        <h3 className="text-lg font-semibold text-white mb-2">Nenhum pedido digital</h3>
        <p className="text-[#94a3b8]">Não há pedidos do plano digital registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#0b121b] border border-[#2d3a52] rounded-lg text-white text-sm placeholder:text-[#94a3b8]/50 focus:border-[#3b82f6] outline-none" />
      </div>
      <div className="space-y-8">
        {active.length > 0 && (
          <Section title="Planos Digitais Ativos" color="bg-green-500" count={active.length}>
            {active.map(o => <DigitalCard key={o.id} order={o} onAction={onAction} />)}
          </Section>
        )}
        {cancelled.length > 0 && (
          <Section title="Cancelados" color="bg-red-500" count={cancelled.length}>
            {cancelled.slice(0, 6).map(o => <DigitalCard key={o.id} order={o} onAction={onAction} />)}
          </Section>
        )}
      </div>
    </div>
  );
};

export default DigitalTab;