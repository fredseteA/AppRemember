const Clouds = () => {
  return (
    <>
      <div className="wpm-cloud-l absolute pointer-events-none select-none"
        style={{ top: '-10px', left: '-55px', width: 'clamp(120px,15vw,220px)', opacity: 0.88, zIndex: 0 }}>
        <div className="wpm-cloud-1"><img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
      <div className="wpm-cloud-r absolute pointer-events-none select-none hidden md:block"
        style={{ bottom: '-10px', right: '-45px', width: 'clamp(120px,13vw,200px)', opacity: 0.72, zIndex: 0 }}>
        <div className="wpm-cloud-2"><img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%' }} /></div>
      </div>
    </>
  );
}

export default Clouds;