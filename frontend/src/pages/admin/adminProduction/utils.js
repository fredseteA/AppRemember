export const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const Section = ({ title, color, count, children }) => (
  <div>
    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      {title} ({count})
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);