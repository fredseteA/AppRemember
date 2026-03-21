import asyncio
import logging
import resend
from datetime import datetime, timezone
from core.config import ADMIN_EMAIL, SENDER_EMAIL

logger = logging.getLogger(__name__)


async def send_admin_notification_email(subject: str, html_content: str):
    try:
        params = {"from": SENDER_EMAIL, "to": [ADMIN_EMAIL], "subject": subject, "html": html_content}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ E-mail enviado para {ADMIN_EMAIL}. ID: {result.get('id')}")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao enviar e-mail: {str(e)}")
        return False


async def send_supporter_sale_email(partner_data: dict, payment_data: dict, calc: dict):
    try:
        from services.commission_service import DISCOUNT_PERCENTAGE
        order_id = payment_data.get("id", "")[:8]
        html = f"""
        <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#3b82f6;">Nova venda com seu código!</h2>
            <p>Olá, <strong>{partner_data.get('name')}</strong>!</p>
            <p>Uma venda foi realizada usando seu código <strong>{partner_data.get('supporter_code')}</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Pedido</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;">#{order_id}</td></tr>
                <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Valor Original</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;">R$ {calc['original_amount']:.2f}</td></tr>
                <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Desconto Aplicado</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;color:#16a34a;">- R$ {calc['discount_amount']:.2f} ({int(DISCOUNT_PERCENTAGE)}%)</td></tr>
                <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;border-bottom:1px solid #ddd;">Valor Final</td>
                    <td style="padding:10px;background:#fff;border-bottom:1px solid #ddd;font-weight:bold;">R$ {calc['final_amount']:.2f}</td></tr>
                <tr><td style="padding:10px;background:#f8f9fa;font-weight:bold;">Sua Comissão</td>
                    <td style="padding:10px;background:#fff;color:#f59e0b;font-size:18px;font-weight:bold;">R$ {calc['commission_amount']:.2f}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <p style="font-size:12px;color:#888;text-align:center;">© {datetime.now().year} Remember QRCode</p>
        </body></html>
        """
        params = {
            "from": SENDER_EMAIL,
            "to": [partner_data.get("email")],
            "subject": "Nova venda com seu código — Remember QRCode",
            "html": html
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ Email enviado ao apoiador {partner_data.get('email')}. ID: {result.get('id')}")
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email ao apoiador: {str(e)}")


async def send_payment_notification_email(payment_data: dict, memorial_data: dict):
    try:
        plan_type = payment_data.get('plan_type', '')
        is_plaque_order = plan_type in ['plaque', 'complete', 'qrcode_plaque']
        responsible = memorial_data.get('responsible', {})
        person_data = memorial_data.get('person_data', {})
        amount = payment_data.get('amount', 0)
        formatted_amount = f"R$ {amount:.2f}".replace('.', ',')
        payment_date = payment_data.get('updated_at') or payment_data.get('created_at')
        if isinstance(payment_date, str):
            try:
                payment_date = datetime.fromisoformat(payment_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                payment_date = datetime.now(timezone.utc)
        formatted_date = payment_date.strftime('%d/%m/%Y às %H:%M')
        plan_names = {'digital': 'Plano Digital', 'plaque': 'Plano Placa QR Code', 'qrcode_plaque': 'Plano Placa QR Code', 'complete': 'Plano Completo com Placa'}
        plan_name = plan_names.get(plan_type, plan_type)
        plaque_alert = ""
        if is_plaque_order:
            plaque_alert = """<div style="background-color:#dc2626;color:white;padding:20px;text-align:center;margin-bottom:20px;border-radius:8px;">
                <h2 style="margin:0;font-size:24px;">SOLICITAÇÃO DE PLACA QRCODE</h2>
                <p style="margin:10px 0 0 0;font-size:16px;">Este pedido inclui uma placa física!</p></div>"""
        html_content = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            {plaque_alert}
            <h1 style="color:#5B8FB9;">Novo Pagamento Aprovado</h1>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">Comprador</td><td style="padding:12px;">{responsible.get('name','N/A')}</td></tr>
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">E-mail</td><td style="padding:12px;">{payment_data.get('user_email','N/A')}</td></tr>
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">Homenageado</td><td style="padding:12px;">{person_data.get('full_name','N/A')}</td></tr>
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">Plano</td><td style="padding:12px;">{plan_name}</td></tr>
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">Valor</td><td style="padding:12px;color:#16a34a;font-size:18px;font-weight:bold;">{formatted_amount}</td></tr>
                <tr><td style="padding:12px;background:#e8f4f8;font-weight:bold;">Data</td><td style="padding:12px;">{formatted_date}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <p style="font-size:12px;color:#888;text-align:center;">© {datetime.now().year} Remember QRCode</p>
        </body></html>"""
        subject = "SOLICITAÇÃO DE PLACA QRCODE - Novo Pagamento" if is_plaque_order else "Novo Pagamento Aprovado - Remember QRCode"
        return await send_admin_notification_email(subject, html_content)
    except Exception as e:
        logger.error(f"❌ Erro ao enviar e-mail de notificação: {str(e)}")
        return False


async def send_order_status_email(
    order_data: dict,
    memorial_data: dict,
    new_status: str,
    tracking_code: str = None,
    delivery_type: str = "correios"
):
    try:
        responsible = memorial_data.get('responsible', {}) if memorial_data else {}
        person_data = memorial_data.get('person_data', {}) if memorial_data else {}
        customer_email = order_data.get('user_email') or responsible.get('email')
        if not customer_email:
            return False

        customer_name = responsible.get('name', 'Cliente')
        person_name   = person_data.get('full_name', 'seu ente querido')
        order_id      = order_data.get('id', '')[:8]
        amount        = order_data.get('amount', 0)
        formatted_amount = f"R$ {amount:.2f}".replace('.', ',')

        status_key = f'shipped_{delivery_type}' if new_status == 'shipped' else new_status

        subjects = {
            'paid':             '✅ Compra confirmada — Remember QRCode',
            'in_production':    '🔧 Produção iniciada — Remember QRCode',
            'produced':         '📦 Produto finalizado — Remember QRCode',
            'shipped_correios': '🚚 Pedido enviado — Remember QRCode',
            'shipped_local':    '🛵 Saiu para entrega — Remember QRCode',
            'cancelled':        '❌ Pedido cancelado — Remember QRCode',
        }

        bodies = {
            'paid': f"<h2 style='color:#16a34a;'>Compra confirmada!</h2><p>Olá, <strong>{customer_name}</strong>! Sua compra do memorial de <strong>{person_name}</strong> foi confirmada.</p><p><strong>Valor:</strong> {formatted_amount} | <strong>Pedido:</strong> #{order_id}</p><p>Em até <strong>24 horas</strong> iniciaremos a produção.</p>",
            'in_production': f"<h2 style='color:#8b5cf6;'>Produção iniciada!</h2><p>Olá, <strong>{customer_name}</strong>! A produção da placa de <strong>{person_name}</strong> foi iniciada.</p><p>Prazo estimado: <strong>2 a 3 dias úteis</strong>.</p>",
            'produced': f"<h2 style='color:#3b82f6;'>Produto finalizado!</h2><p>Olá, <strong>{customer_name}</strong>! A placa de <strong>{person_name}</strong> está pronta e será despachada em breve.</p>",
            'shipped_correios': f"<h2 style='color:#f59e0b;'>Pedido enviado!</h2><p>Olá, <strong>{customer_name}</strong>! Rastreio: <strong style='font-size:18px;font-family:monospace;'>{tracking_code}</strong></p><p>Acompanhe em <a href='https://rastreamento.correios.com.br'>correios.com.br</a></p>",
            'shipped_local': f"<h2 style='color:#f59e0b;'>Saiu para entrega!</h2><p>Olá, <strong>{customer_name}</strong>! A placa de <strong>{person_name}</strong> saiu para entrega local.</p>",
            'cancelled': f"<h2 style='color:#ef4444;'>Pedido cancelado</h2><p>Olá, <strong>{customer_name}</strong>! Seu pedido <strong>#{order_id}</strong> foi cancelado. Reembolso em até <strong>7 dias úteis</strong>.</p>",
        }

        if status_key not in subjects:
            return False

        html_content = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
            {bodies[status_key]}
            <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
            <p style="font-size:12px;color:#888;text-align:center;">© {datetime.now().year} Remember QRCode</p>
        </body></html>"""

        params = {"from": SENDER_EMAIL, "to": [customer_email], "subject": subjects[status_key], "html": html_content}
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"✅ Email '{status_key}' enviado para {customer_email}. ID: {result.get('id')}")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao enviar email de status '{new_status}': {str(e)}")
        return False