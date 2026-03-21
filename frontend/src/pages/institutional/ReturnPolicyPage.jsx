import { PageHero, ContentSection, H2, P, Li, Ul, Divider, sharedStyles } from './InstitutionalComponents';

export default function ReturnPolicyPage() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #c8e8f5 0%, #a8d8f0 18%, #7bbde8 32%, #b8e0f5 55%, #eef8fb 100%)', minHeight: '100vh', fontFamily: '"Georgia", serif' }}>
      <style>{sharedStyles}</style>

      <PageHero
        tag="Trocas e Devoluções"
        title="Política de Troca, Devolução e Reembolso"
        subtitle="Transparência total sobre seus direitos e nossos procedimentos em casos de cancelamento, defeito ou insatisfação."
      />

      <ContentSection>

        <H2>1. Direito de arrependimento</H2>
        <P>
          Conforme o Código de Defesa do Consumidor (Art. 49), o cliente tem o direito de cancelar a compra em até <strong>7 dias corridos</strong> a partir da data de confirmação do pagamento, sem necessidade de justificativa.
        </P>
        <P>
          O cancelamento dentro deste prazo garante o reembolso integral do valor pago, desde que o produto físico (placa) não tenha sido entregue ao cliente.
        </P>

        <Divider />
        <H2>2. Como solicitar o cancelamento</H2>
        <P>Para solicitar o cancelamento dentro do prazo legal, entre em contato pelos canais oficiais:</P>
        <Ul>
          <Li>WhatsApp: +55 22 99208-0811</Li>
          <Li>E-mail: rememberqrcode@gmail.com</Li>
        </Ul>
        <P>
          Informe o número do pedido, o e-mail cadastrado e o motivo do cancelamento. Nossa equipe confirmará o recebimento da solicitação em até 1 dia útil.
        </P>

        <Divider />
        <H2>3. Prazo de reembolso</H2>
        <P>
          Após a confirmação do cancelamento, o reembolso será processado em até <strong>10 dias úteis</strong>, pela mesma forma de pagamento utilizada na compra:
        </P>
        <Ul>
          <Li><strong>Cartão de crédito:</strong> estorno na fatura em até 2 ciclos de cobrança (conforme a operadora).</Li>
          <Li><strong>PIX ou boleto:</strong> transferência para a conta indicada pelo cliente em até 5 dias úteis.</Li>
        </Ul>

        <Divider />
        <H2>4. Troca por defeito de fabricação</H2>
        <P>
          Caso a placa física chegue com defeito visível, dano causado pelo transporte ou divergência em relação ao memorial aprovado, o cliente deverá entrar em contato em até <strong>7 dias após o recebimento</strong>, informando:
        </P>
        <Ul>
          <Li>Número do pedido.</Li>
          <Li>Foto ou vídeo do defeito.</Li>
          <Li>Descrição do problema.</Li>
        </Ul>
        <P>
          Após a análise, realizaremos a produção e envio de uma nova placa sem nenhum custo adicional ao cliente.
        </P>

        <Divider />
        <H2>5. Casos não cobertos pela política de troca</H2>
        <P>Não realizamos trocas ou reembolsos nos seguintes casos:</P>
        <Ul>
          <Li>Danos causados por uso inadequado ou instalação incorreta da placa.</Li>
          <Li>Arrependimento após a entrega do produto físico.</Li>
          <Li>Erros nas informações do memorial inseridas pelo próprio cliente (conferência é de responsabilidade do cliente antes da aprovação).</Li>
          <Li>Cancelamentos solicitados após o prazo legal de 7 dias.</Li>
        </Ul>

        <Divider />
        <H2>6. Plano Digital — cancelamento</H2>
        <P>
          Para o Plano Digital, o cancelamento com reembolso é aceito dentro do prazo de 7 dias corridos, desde que o link do memorial não tenha sido amplamente divulgado ou utilizado publicamente de forma irreversível.
        </P>

        <Divider />
        <H2>7. Dúvidas</H2>
        <P>
          Nossa equipe está disponível para esclarecer qualquer dúvida relacionada a esta política. Entre em contato pelo WhatsApp ou e-mail disponíveis no rodapé do site.
        </P>

      </ContentSection>
    </div>
  );
}