import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstComponents';

export default function PoliticaPrivacidadePage() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag="Privacidade"
        title="Política de Privacidade"
        subtitle="Saiba como coletamos, usamos e protegemos suas informações pessoais na Remember QRCode."
      />

      <ContentSection>

        <H2>1. Quais dados coletamos</H2>
        <P>Ao utilizar nossa plataforma, podemos coletar as seguintes informações:</P>
        <Ul>
          <Li><strong>Dados de cadastro:</strong> nome, e-mail e senha (criptografada).</Li>
          <Li><strong>Dados do memorial:</strong> nome, foto, biografia, datas e demais informações inseridas voluntariamente pelo usuário.</Li>
          <Li><strong>Dados de pagamento:</strong> processados integralmente por gateways certificados (não armazenamos dados de cartão).</Li>
          <Li><strong>Dados de entrega:</strong> endereço fornecido para envio da placa física.</Li>
          <Li><strong>Dados de navegação:</strong> cookies e dados técnicos de acesso (IP, navegador, dispositivo), utilizados exclusivamente para melhoria da plataforma.</Li>
        </Ul>

        <Divider />
        <H2>2. Como utilizamos seus dados</H2>
        <P>Os dados coletados são utilizados exclusivamente para:</P>
        <Ul>
          <Li>Criar e gerenciar sua conta e os memoriais associados.</Li>
          <Li>Processar pagamentos e emitir confirmações de compra.</Li>
          <Li>Enviar atualizações sobre o pedido por e-mail (produção, despacho, entrega).</Li>
          <Li>Prestar suporte ao cliente quando solicitado.</Li>
          <Li>Melhorar continuamente a experiência na plataforma.</Li>
        </Ul>
        <P>
          <strong>Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros</strong> para fins comerciais ou publicitários.
        </P>

        <Divider />
        <H2>3. Armazenamento e segurança</H2>
        <P>
          Todos os dados são armazenados em servidores seguros com criptografia. Adotamos medidas técnicas e administrativas adequadas para proteger suas informações contra acesso não autorizado, perda ou vazamento.
        </P>
        <P>
          As senhas dos usuários são armazenadas com hash criptográfico e nunca podem ser acessadas diretamente por nenhum colaborador da empresa.
        </P>

        <Divider />
        <H2>4. Compartilhamento de dados</H2>
        <P>Seus dados podem ser compartilhados apenas nas seguintes situações:</P>
        <Ul>
          <Li><strong>Transportadoras:</strong> nome e endereço de entrega, exclusivamente para entrega da placa física.</Li>
          <Li><strong>Gateway de pagamento:</strong> dados necessários para processamento da transação.</Li>
          <Li><strong>Obrigações legais:</strong> quando exigido por lei ou autoridade competente.</Li>
        </Ul>

        <Divider />
        <H2>5. Seus direitos (LGPD)</H2>
        <P>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</P>
        <Ul>
          <Li>Confirmar a existência de tratamento de seus dados.</Li>
          <Li>Acessar os dados que temos sobre você.</Li>
          <Li>Corrigir dados incompletos ou desatualizados.</Li>
          <Li>Solicitar a exclusão de seus dados pessoais.</Li>
          <Li>Revogar o consentimento dado anteriormente.</Li>
        </Ul>
        <P>
          Para exercer qualquer um desses direitos, entre em contato com nossa equipe pelo e-mail ou WhatsApp disponíveis no rodapé do site.
        </P>

        <Divider />
        <H2>6. Cookies</H2>
        <P>
          Utilizamos cookies estritamente necessários para o funcionamento da plataforma e cookies analíticos para entender como os usuários navegam no site. Você pode desativar os cookies no seu navegador, porém isso pode afetar algumas funcionalidades.
        </P>

        <Divider />
        <H2>7. Retenção de dados</H2>
        <P>
          Os dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, os dados pessoais são removidos em até 30 dias, exceto aqueles exigidos por obrigações legais ou fiscais.
        </P>

        <Divider />
        <H2>8. Atualizações desta política</H2>
        <P>
          Esta política pode ser atualizada periodicamente. Em caso de alterações relevantes, notificaremos os usuários cadastrados por e-mail. A data da última atualização estará sempre indicada no final desta página.
        </P>
        <P style={{ color: '#7a9bb5', fontSize: '0.82rem' }}>Última atualização: junho de 2025.</P>

      </ContentSection>
    </div>
  );
}
