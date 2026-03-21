const IconBox = ({ icon, color = '#1a2744', bg }) => {
  const bgColor = bg || `${color}18`;
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, flexShrink: 0,
      color: color,
      boxShadow: `0 4px 16px ${color}22`,
    }}>
      {icon}
    </div>
  );
}

export default IconBox;