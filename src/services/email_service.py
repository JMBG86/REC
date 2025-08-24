import imaplib
import email
import re
import json
from datetime import datetime
from email.header import decode_header
from src.models.rent_a_car import EmailTrigger
from src.models.vehicle import Vehicle
from src.models.user import db

class EmailService:
    def __init__(self, email_address, password, imap_server='imap.gmail.com', imap_port=993):
        self.email_address = email_address
        self.password = password
        self.imap_server = imap_server
        self.imap_port = imap_port
        self.mail = None
    
    def connect(self):
        """Conectar ao servidor IMAP"""
        try:
            self.mail = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            self.mail.login(self.email_address, self.password)
            return True
        except Exception as e:
            print(f"Erro ao conectar ao servidor de email: {str(e)}")
            return False
    
    def disconnect(self):
        """Desconectar do servidor IMAP"""
        if self.mail:
            try:
                self.mail.logout()
            except:
                pass
    
    def fetch_unread_emails(self, folder="INBOX"):
        """Buscar emails não lidos da caixa de entrada"""
        if not self.mail:
            if not self.connect():
                return []
        
        try:
            self.mail.select(folder)
            status, messages = self.mail.search(None, '(UNSEEN)')
            email_ids = messages[0].split()
            
            emails = []
            for e_id in email_ids:
                status, data = self.mail.fetch(e_id, '(RFC822)')
                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)
                
                # Processar o email
                subject = self.decode_email_header(msg['Subject'])
                from_addr = self.decode_email_header(msg['From'])
                date_str = self.decode_email_header(msg['Date'])
                
                # Extrair o corpo do email
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        
                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            body = part.get_payload(decode=True).decode()
                            break
                else:
                    body = msg.get_payload(decode=True).decode()
                
                emails.append({
                    'id': e_id,
                    'subject': subject,
                    'from': from_addr,
                    'date': date_str,
                    'body': body
                })
                
                # Marcar como lido
                self.mail.store(e_id, '+FLAGS', '\\Seen')
            
            return emails
        except Exception as e:
            print(f"Erro ao buscar emails: {str(e)}")
            return []
    
    def decode_email_header(self, header):
        """Decodificar cabeçalhos de email"""
        if header is None:
            return ""
        
        decoded_header = decode_header(header)
        header_parts = []
        for part, encoding in decoded_header:
            if isinstance(part, bytes):
                if encoding:
                    part = part.decode(encoding)
                else:
                    part = part.decode('utf-8', errors='ignore')
            header_parts.append(str(part))
        
        return " ".join(header_parts)
    
    def extract_vehicle_data(self, email_body):
        """Extrair dados do veículo do corpo do email"""
        data = {}
        
        # Padrões de expressão regular para extrair informações
        patterns = {
            'matricula': r'Matrícula[:\s]+(\w+-\w+-\w+|\w+\s\w+\s\w+|\w+\-\w+\-\w+)',
            'marca': r'Marca[:\s]+(\w+)',
            'modelo': r'Modelo[:\s]+([\w\s]+)',
            'vin': r'VIN[:\s]+(\w+)',
            'data_desaparecimento': r'Data[\s\w]*desaparecimento[:\s]+(\d{2}[/\-]\d{2}[/\-]\d{4})',
            'cliente_nome': r'Nome[\s\w]*cliente[:\s]+([\w\s]+)',
            'cliente_contacto': r'Contacto[:\s]+(\+?\d+|\d+[\s\-]\d+)',
            'loja_aluguer': r'Loja[:\s]+([\w\s]+)'
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, email_body, re.IGNORECASE)
            if match:
                data[key] = match.group(1).strip()
        
        return data
    
    def process_emails(self):
        """Processar emails não lidos e criar registros no banco de dados"""
        emails = self.fetch_unread_emails()
        processed_count = 0
        
        for email_data in emails:
            # Verificar se o email já foi processado
            existing = EmailTrigger.query.filter_by(
                email_from=email_data['from'],
                email_subject=email_data['subject']
            ).first()
            
            if existing and existing.processed:
                continue
            
            # Extrair dados do veículo
            extracted_data = self.extract_vehicle_data(email_data['body'])
            
            # Criar ou atualizar o registro de EmailTrigger
            if not existing:
                email_trigger = EmailTrigger(
                    email_from=email_data['from'],
                    email_subject=email_data['subject'],
                    email_body=email_data['body'],
                    extracted_data=extracted_data
                )
                db.session.add(email_trigger)
            else:
                existing.email_body = email_data['body']
                existing.extracted_data = extracted_data
            
            db.session.commit()
            processed_count += 1
        
        return processed_count
    
    def create_vehicle_from_email(self, email_trigger_id):
        """Criar um veículo a partir dos dados extraídos do email"""
        email_trigger = EmailTrigger.query.get(email_trigger_id)
        
        if not email_trigger or not email_trigger.extracted_data:
            return None, "Dados insuficientes para criar veículo"
        
        data = email_trigger.extracted_data
        
        # Verificar campos obrigatórios
        if 'matricula' not in data or 'marca' not in data or 'modelo' not in data:
            email_trigger.error_message = "Campos obrigatórios ausentes"
            db.session.commit()
            return None, "Campos obrigatórios ausentes (matrícula, marca, modelo)"
        
        # Verificar se o veículo já existe
        existing_vehicle = Vehicle.query.filter_by(matricula=data['matricula']).first()
        if existing_vehicle:
            email_trigger.vehicle_id = existing_vehicle.id
            email_trigger.processed = True
            email_trigger.processed_at = datetime.utcnow()
            email_trigger.error_message = "Veículo já existe"
            db.session.commit()
            return existing_vehicle, "Veículo já existe"
        
        # Processar data de desaparecimento
        data_desaparecimento = None
        if 'data_desaparecimento' in data:
            try:
                # Tentar diferentes formatos de data
                for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
                    try:
                        data_desaparecimento = datetime.strptime(data['data_desaparecimento'], fmt)
                        break
                    except ValueError:
                        continue
            except Exception:
                pass
        
        # Criar novo veículo
        vehicle = Vehicle(
            matricula=data['matricula'],
            marca=data['marca'],
            modelo=data['modelo'],
            vin=data.get('vin'),
            status='em_tratamento',
            data_desaparecimento=data_desaparecimento,
            loja_aluguer=data.get('loja_aluguer'),
            cliente_nome=data.get('cliente_nome'),
            cliente_contacto=data.get('cliente_contacto')
        )
        
        db.session.add(vehicle)
        db.session.flush()  # Para obter o ID do veículo
        
        # Atualizar o EmailTrigger
        email_trigger.vehicle_id = vehicle.id
        email_trigger.processed = True
        email_trigger.processed_at = datetime.utcnow()
        
        db.session.commit()
        return vehicle, "Veículo criado com sucesso"