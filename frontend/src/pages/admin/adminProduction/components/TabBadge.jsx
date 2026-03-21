const TabBadge = ({ count }) => {
  if (count === 0) return null;
  return (
    <span className="ml-2 px-2 py-0.5 bg-[#3b82f6] text-white text-xs font-bold rounded-full">
      {count}
    </span>
  );
};

export default TabBadge;