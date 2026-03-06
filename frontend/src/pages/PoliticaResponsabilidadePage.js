import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstComponents';

export default function PoliticaResponsabilidadePage() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag="Política"
        title="Política de Responsabilidade"
        subtitle="Conheça nossos compromissos com você, com os memoriais criados e com a conduta ética da nossa plataforma."
      />

      <ContentSection>

        <H2>1. Nosso compromisso</H2>
        <P>
          A Remember QRCode assume plena responsabilidade pela qualidade dos serviços oferecidos, pela segurança das informações armazenadas e pelo respeito ao cliente em todas as etapas da jornada — desde a criação do memorial até a entrega do produto físico.
        </P>

        <Divider />
        <H2>2. Responsabilidade sobre o conteúdo dos memoriais</H2>
        <P>
          O conteúdo inserido nos memoriais — textos, fotos, áudios e demais informações — é de exclusiva responsabilidade do usuário que o criou. A Remember QRCode não produz, edita nem valida o conteúdo publicado pelos clientes.
        </P>
        <P>Ao utilizar a plataforma, o usuário declara que:</P>
        <Ul>
          <Li>Possui os direitos sobre as imagens e informações inseridas.</Li>
          <Li>O conteúdo não viola direitos de terceiros, leis vigentes ou normas de conduta.</Li>
          <Li>As informações são verídicas e referem-se a pessoa real.</Li>
        </Ul>
        <P>
          A Remember QRCode reserva-se o direito de remover, sem aviso prévio, qualquer memorial que contenha conteúdo ofensivo, ilegal ou que viole os Termos e Condições da plataforma.
        </P>

        <Divider />
        <H2>3. Responsabilidade sobre o produto físico</H2>
        <P>
          A Remember QRCode é responsável pela produção e envio das placas físicas dentro do prazo estabelecido (7 a 15 dias úteis após a confirmação do pagamento). Em caso de defeito de fabricação ou dano no transporte, nos comprometemos a realizar a substituição do produto sem custo adicional ao cliente.
        </P>
        <P>Não nos responsabilizamos por:</P>
        <Ul>
          <Li>Atrasos causados por transportadoras ou fatores externos.</Li>
          <Li>Danos ocasionados por uso inadequado ou instalação incorreta da placa.</Li>
          <Li>Endereço de entrega incorreto informado pelo cliente.</Li>
        </Ul>

        <Divider />
        <H2>4. Responsabilidade sobre o serviço digital</H2>
        <P>
          Nos comprometemos a manter os memoriais publicados disponíveis de forma contínua. Em casos de manutenção programada ou ocorrências técnicas, comunicaremos os clientes com antecedência sempre que possível.
        </P>
        <P>
          A plataforma não se responsabiliza por indisponibilidades causadas por falhas de terceiros (provedores de internet, servidores externos, etc.).
        </P>

        <Divider />
        <H2>5. Conduta ética</H2>
        <P>
          A Remember QRCode não utiliza as informações dos memoriais para fins comerciais, publicitários ou de análise de dados pessoais. Todas as informações são tratadas com sigilo, respeito e em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </P>

        <Divider />
        <H2>6. Canal de comunicação</H2>
        <P>
          Em caso de dúvidas, reclamações ou solicitações relacionadas a esta política, entre em contato com nossa equipe pelo WhatsApp ou e-mail disponíveis no rodapé do site. Respondemos em até 2 dias úteis.
        </P>

      </ContentSection>
    </div>
  );
}
