import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, CreditCard } from 'lucide-react';

const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Crie o Memorial',
      description: 'Preencha as informações da pessoa homenageada com carinho: dados pessoais, uma frase especial, biografia, galeria de fotos e até um áudio de homenagem. Tudo de forma simples e guiada, para que você possa expressar todo o amor que sente.',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
      highlight: 'Criar é gratuito!',
      cta: 'Começar agora',
      ctaLink: '/create-memorial',
    },
    {
      number: '02',
      icon: Eye,
      title: 'Veja o Resultado',
      description: 'Assim que você terminar, o memorial será exibido pronto na tela para você visualizar. Veja como ficou a homenagem completa, confira cada detalhe e sinta o resultado. O memorial fica salvo no seu perfil, pronto para quando você decidir publicar.',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80',
      highlight: 'Prévia instantânea',
      cta: 'Ver exemplo',
      ctaLink: '/explore',
    },
    {
      number: '03',
      icon: CreditCard,
      title: 'Escolha um Plano',
      description: 'Se gostar do resultado, escolha o plano que melhor atende suas necessidades: o Plano Digital para publicar o memorial online, ou o Plano Placa QR Code para receber também uma placa física de aço inox com QR Code gravado para colocar no túmulo.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
      highlight: 'Pague só se quiser publicar',
      cta: 'Ver planos',
      ctaLink: '/#plans',
    },
  ];

const StepsSection = () => {
    const [visibleSteps, setVisibleSteps] = useState([]);
    const stepRefs = useRef([]);

    useEffect(() => {
        const observers = stepRefs.current.map((ref, index) => {
        if (!ref) return null;
        const observer = new IntersectionObserver(
            ([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                setVisibleSteps(prev =>
                    prev.includes(index) ? prev : [...prev, index]
                );
                }, index * 180);
            }
            },
            { threshold: 0.2 }
        );
        observer.observe(ref);
        return observer;
        });
        return () => observers.forEach(obs => obs && obs.disconnect());
    }, []);

    const stepColors = ['#f5a623', '#4a90d9', '#7dc242'];

    const stepIcons = [
        (color) => (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="8" y="4" width="34" height="44" rx="6" fill={color} />
            <rect x="12" y="8" width="26" height="36" rx="4" fill="white" opacity="0.25" />
            <circle cx="25" cy="26" r="7" fill="white" opacity="0.9" />
            <rect x="16" y="14" width="14" height="2.5" rx="1.25" fill="white" opacity="0.7" />
            <rect x="16" y="19" width="10" height="2" rx="1" fill="white" opacity="0.5" />
            <rect x="8" y="4" width="34" height="44" rx="6" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="38" cy="10" r="6" fill="#4a90d9" />
            <circle cx="38" cy="10" r="3" fill="white" />
        </svg>
        ),
        (color) => (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="6" y="6" width="34" height="42" rx="6" fill={color} />
            <rect x="10" y="10" width="26" height="34" rx="3" fill="white" opacity="0.2" />
            <rect x="19" y="20" width="14" height="4" rx="2" fill="white" opacity="0.95" />
            <rect x="21" y="16" width="4" height="12" rx="2" fill="white" opacity="0.95" />
            <rect x="10" y="36" width="16" height="2.5" rx="1.25" fill="white" opacity="0.5" />
            <rect x="10" y="40" width="11" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="14" y="2" width="34" height="42" rx="6" fill={color} opacity="0.5" />
            <rect x="6" y="6" width="34" height="42" rx="6" fill={color} />
            <rect x="19" y="20" width="14" height="4" rx="2" fill="white" opacity="0.95" />
            <rect x="21" y="16" width="4" height="12" rx="2" fill="white" opacity="0.95" />
        </svg>
        ),
        (color) => (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M14 28 C14 18 42 18 42 28" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
            <rect x="9" y="28" width="10" height="14" rx="5" fill={color} />
            <rect x="37" y="28" width="10" height="14" rx="5" fill={color} />
            <rect x="10" y="30" width="8" height="10" rx="4" fill="white" opacity="0.3" />
            <rect x="38" y="30" width="8" height="10" rx="4" fill="white" opacity="0.3" />
        </svg>
        ),
    ];

    return (
        <section
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
            background: 'linear-gradient(180deg, #5aa8e0 0%, #7bbde8 20%, #a8d8f0 50%, #c8e8f5 75%, #ddf0f7 100%)',
            marginTop: 0,
            borderTop: 'none',
        }}
        >
        <style>{`
            @keyframes floatSt1 {
            0%,100% { transform: translateY(0) translateX(0); }
            45%     { transform: translateY(-14px) translateX(8px); }
            }
            @keyframes floatSt2 {
            0%,100% { transform: translateY(0) translateX(0); }
            50%     { transform: translateY(-10px) translateX(-7px); }
            }
            @keyframes stepReveal {
            from { opacity: 0; transform: translateY(36px) scale(0.97); filter: blur(5px); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0);   }
            }
            @keyframes dotPop {
            from { transform: scale(0); opacity: 0; }
            to   { transform: scale(1); opacity: 1; }
            }
            @keyframes iconFloat {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(-6px); }
            }
            .step-card-inner {
            transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
            }
            .step-card-inner:hover {
            transform: translateY(-4px) scale(1.015);
            box-shadow: 0 20px 56px rgba(26,39,68,0.14),
                        inset 0 1px 0 rgba(255,255,255,0.95) !important;
            }
            .step-cta-btn {
            border-radius: 999px;
            padding: 8px 20px;
            background: transparent;
            border: 1.5px solid rgba(26,39,68,0.25);
            color: #1a2744;
            font-family: "Georgia", serif;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            }
            .step-cta-btn:hover {
            background: #1a2744;
            color: white;
            border-color: #1a2744;
            }

            /* ── MOBILE ── */
            @media (max-width: 767px) {
            /* Sidebar oculta — título aparece no header mobile acima */
            .steps-sidebar       { display: none !important; }
            .steps-header-mobile { display: block !important; }

            /* Timeline ocupa tudo centralizada */
            .steps-timeline { width: 100% !important; }
            .step-card-wrap { max-width: 100% !important; }

            /* Card compacto */
            .step-card-inner {
                padding: 16px 14px 14px !important;
                border-radius: 16px !important;
            }

            /* Ícone menor */
            .step-icon-box {
                width: 56px !important;
                height: 56px !important;
                border-radius: 14px !important;
                margin-bottom: 10px !important;
            }
            .step-icon-box svg {
                width: 34px !important;
                height: 34px !important;
            }

            /* Título menor — anula o clamp */
            .step-title {
                font-size: 1rem !important;
                margin-bottom: 6px !important;
            }

            /* Descrição menor */
            .step-desc {
                font-size: 0.77rem !important;
                margin-bottom: 12px !important;
                max-width: 100% !important;
            }

            /* Highlight oculto */
            .step-highlight { display: none !important; }

            /* Botão menor */
            .step-cta-btn {
                padding: 7px 16px !important;
                font-size: 0.71rem !important;
            }

            /* Conectores menores */
            .step-dot-line  { height: 22px !important; }
            .step-connector { height: 24px !important; }
            }
        `}</style>

        {/* Nuvens */}
        <div className="absolute top-[5%] left-[-50px] w-52 md:w-72 opacity-85 pointer-events-none select-none"
            style={{ animation: 'floatSt1 10s ease-in-out infinite' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="absolute top-[35%] right-[-40px] w-44 md:w-64 opacity-75 pointer-events-none select-none hidden md:block"
            style={{ animation: 'floatSt2 12s ease-in-out infinite' }}>
            <img src="/clouds/cloud2.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div className="absolute bottom-[5%] left-[2%] w-36 opacity-65 pointer-events-none select-none hidden lg:block"
            style={{ animation: 'floatSt1 8s ease-in-out infinite 1.5s' }}>
            <img src="/clouds/cloud1.png" alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12">

            {/* Cabeçalho apenas mobile */}
            <div className="steps-header-mobile" style={{ display: 'none', textAlign: 'center', marginBottom: 24 }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.63rem', fontWeight: 700, color: '#2a3d5e', marginBottom: 10 }}>
                O Processo
            </p>
            <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '1.4rem', fontWeight: 700, color: '#1a2744', lineHeight: 1.2, marginBottom: 8 }}>
                Criar, visualizar e publicar.
            </h2>
            <p style={{ color: '#3a5070', fontSize: '0.78rem', lineHeight: 1.6, fontFamily: '"Georgia", serif', maxWidth: 260, margin: '0 auto' }}>
                Preencha, veja o resultado e escolha um plano.
            </p>
            </div>

            {/* Layout */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

            {/* Sidebar — só desktop */}
            <div className="steps-sidebar md:w-64 lg:w-80 flex-shrink-0 md:sticky md:top-32">
                <p style={{ textTransform: 'uppercase', letterSpacing: '0.22em', fontSize: '0.65rem', fontWeight: 700, color: '#2a3d5e', marginBottom: '14px' }}>
                O Processo
                </p>
                <h2 style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.18, marginBottom: '14px' }}>
                Criar, visualizar e publicar.
                </h2>
                <p style={{ color: '#3a5070', fontSize: '0.88rem', lineHeight: 1.68, fontFamily: '"Georgia", serif' }}>
                Preencha, veja o resultado e escolha um plano.
                Simples, rápido e feito com respeito.
                </p>
            </div>

            {/* Timeline */}
            <div className="steps-timeline flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {steps.map((step, index) => {
                const isVisible = visibleSteps.includes(index);
                const isLast = index === steps.length - 1;
                const color = stepColors[index];

                return (
                    <div
                    key={index}
                    className="step-card-wrap"
                    style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                    {/* Dot */}
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)',
                        border: '1.5px solid rgba(26,39,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(26,39,68,0.1)',
                        fontFamily: '"Georgia", serif',
                        fontSize: '0.72rem', fontWeight: 700, color: '#1a2744',
                        opacity: isVisible ? 1 : 0,
                        animation: isVisible ? 'dotPop 0.4s cubic-bezier(.22,1,.36,1) both' : 'none',
                        zIndex: 2, flexShrink: 0,
                    }}>
                        {index + 1}
                    </div>

                    {/* Linha dot → card */}
                    <div className="step-dot-line" style={{
                        width: 1,
                        height: isVisible ? 40 : 0,
                        background: 'rgba(255,255,255,0.6)',
                        transition: 'height 0.4s ease 0.15s',
                        flexShrink: 0,
                    }} />

                    {/* Card */}
                    <div
                        ref={el => { stepRefs.current[index] = el; }}
                        className="step-card-inner"
                        style={{
                        width: '100%',
                        borderRadius: '20px',
                        padding: '28px 24px 22px',
                        background: 'rgba(255,255,255,0.72)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.88)',
                        boxShadow: '0 8px 32px rgba(26,39,68,0.09), inset 0 1px 0 rgba(255,255,255,0.95)',
                        textAlign: 'center',
                        opacity: isVisible ? 1 : 0,
                        animation: isVisible
                            ? `stepReveal 0.65s cubic-bezier(.22,1,.36,1) ${index * 0.18}s both`
                            : 'none',
                        }}
                    >
                        {/* Ícone */}
                        <div
                        className="step-icon-box"
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 88, height: 88, borderRadius: '22px',
                            background: color + '18',
                            marginBottom: 16,
                            animation: isVisible ? `iconFloat 3s ease-in-out infinite ${index * 0.5}s` : 'none',
                        }}
                        >
                        {stepIcons[index](color)}
                        </div>

                        {/* Label */}
                        <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color, fontWeight: 700, textTransform: 'uppercase', fontFamily: '"Georgia", serif', marginBottom: 6 }}>
                        {'STEP ' + step.number}
                        </p>

                        {/* Título */}
                        <h3 className="step-title" style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(1.3rem, 2.5vw, 1.65rem)', fontWeight: 700, color: '#1a2744', lineHeight: 1.2, marginBottom: 10 }}>
                        {step.title}
                        </h3>

                        {/* Descrição */}
                        <p className="step-desc" style={{ color: '#3a5070', fontSize: '0.84rem', lineHeight: 1.7, fontFamily: '"Georgia", serif', maxWidth: 260, margin: '0 auto 18px' }}>
                        {step.description}
                        </p>

                        {/* Highlight */}
                        {step.highlight && (
                        <div className="step-highlight" style={{ marginBottom: 16 }}>
                            <span style={{
                            padding: '4px 14px', borderRadius: '999px',
                            background: color + '18', border: '1px solid ' + color + '40',
                            color: '#3a5070', fontSize: '0.68rem', fontWeight: 700,
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            fontFamily: '"Georgia", serif',
                            }}>
                            {step.highlight}
                            </span>
                        </div>
                        )}

                        {/* CTA */}
                        <Link to={step.ctaLink || '/create-memorial'}>
                        <button className="step-cta-btn">
                            {step.cta || 'Começar agora'}
                        </button>
                        </Link>
                    </div>

                    {/* Conector entre cards */}
                    {!isLast && (
                        <div className="step-connector" style={{
                        width: 1,
                        height: isVisible ? 56 : 0,
                        background: 'rgba(255,255,255,0.6)',
                        transition: 'height 0.5s ease 0.3s',
                        flexShrink: 0,
                        }} />
                    )}
                    </div>
                );
                })}
            </div>
            </div>
        </div>
        </section>
    );
}

export default StepsSection;