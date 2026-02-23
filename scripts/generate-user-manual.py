#!/usr/bin/env python3
"""
Script para gerar o Manual do Usuário do AgendaPro em PDF.
Inclui imagens da pasta profflow-images/ como exemplos visuais.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, ListFlowable, ListItem, Frame
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage

# ─── CONFIG ──────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(BASE_DIR, "profflow-images")
OUTPUT_PATH = os.path.join(BASE_DIR, "docs", "Manual_do_Usuario_AgendaPro.pdf")

# Cores do tema
PRIMARY = HexColor("#6366f1")       # Indigo
PRIMARY_DARK = HexColor("#4f46e5")
SECONDARY = HexColor("#8b5cf6")     # Violet
ACCENT = HexColor("#06b6d4")        # Cyan
BG_LIGHT = HexColor("#f8fafc")
BG_CARD = HexColor("#f1f5f9")
TEXT_DARK = HexColor("#1e293b")
TEXT_MUTED = HexColor("#64748b")
SUCCESS = HexColor("#22c55e")
WARNING = HexColor("#f59e0b")
DANGER = HexColor("#ef4444")
BORDER = HexColor("#e2e8f0")

# ─── CUSTOM FLOWABLES ───────────────────────────────────────────────────────

class RoundedBox(Flowable):
    """Box arredondada com cor de fundo para destaques."""
    def __init__(self, content, width, bg_color=BG_CARD, border_color=BORDER,
                 padding=10, radius=8):
        Flowable.__init__(self)
        self.content = content
        self.box_width = width
        self.bg_color = bg_color
        self.border_color = border_color
        self.padding = padding
        self.radius = radius
        # Pre-calculate height
        w, h = content.wrap(width - 2 * padding, 10000)
        self.box_height = h + 2 * padding

    def wrap(self, availWidth, availHeight):
        return self.box_width, self.box_height

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.bg_color)
        self.canv.setStrokeColor(self.border_color)
        self.canv.setLineWidth(0.5)
        self.canv.roundRect(
            0, 0, self.box_width, self.box_height,
            self.radius, fill=1, stroke=1
        )
        self.canv.restoreState()
        self.content.drawOn(
            self.canv,
            self.padding,
            self.box_height - self.padding - self.content.wrap(
                self.box_width - 2 * self.padding, 10000
            )[1]
        )


class ColoredLine(Flowable):
    """Linha horizontal colorida."""
    def __init__(self, width, height=2, color=PRIMARY):
        Flowable.__init__(self)
        self.line_width = width
        self.line_height = height
        self.color = color

    def wrap(self, availWidth, availHeight):
        return self.line_width, self.line_height + 4

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.color)
        self.canv.rect(0, 2, self.line_width, self.line_height, fill=1, stroke=0)
        self.canv.restoreState()


# ─── STYLES ──────────────────────────────────────────────────────────────────

styles = getSampleStyleSheet()

# Title page
styles.add(ParagraphStyle(
    'CoverTitle',
    parent=styles['Title'],
    fontSize=36,
    textColor=PRIMARY_DARK,
    spaceAfter=6,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold',
    leading=42,
))

styles.add(ParagraphStyle(
    'CoverSubtitle',
    parent=styles['Normal'],
    fontSize=16,
    textColor=TEXT_MUTED,
    alignment=TA_CENTER,
    fontName='Helvetica',
    spaceAfter=20,
    leading=22,
))

# Chapter / Section headers
styles.add(ParagraphStyle(
    'ChapterTitle',
    parent=styles['Heading1'],
    fontSize=24,
    textColor=PRIMARY_DARK,
    spaceBefore=30,
    spaceAfter=12,
    fontName='Helvetica-Bold',
    leading=30,
    borderWidth=0,
    borderPadding=0,
))

styles.add(ParagraphStyle(
    'SectionTitle',
    parent=styles['Heading2'],
    fontSize=18,
    textColor=TEXT_DARK,
    spaceBefore=20,
    spaceAfter=8,
    fontName='Helvetica-Bold',
    leading=24,
))

styles.add(ParagraphStyle(
    'SubSection',
    parent=styles['Heading3'],
    fontSize=14,
    textColor=PRIMARY,
    spaceBefore=14,
    spaceAfter=6,
    fontName='Helvetica-Bold',
    leading=18,
))

# Body text
styles.add(ParagraphStyle(
    'BodyText2',
    parent=styles['Normal'],
    fontSize=11,
    textColor=TEXT_DARK,
    alignment=TA_JUSTIFY,
    spaceAfter=8,
    leading=16,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    'BodyBold',
    parent=styles['Normal'],
    fontSize=11,
    textColor=TEXT_DARK,
    fontName='Helvetica-Bold',
    spaceAfter=4,
    leading=16,
))

styles.add(ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontSize=11,
    textColor=TEXT_DARK,
    leftIndent=20,
    bulletIndent=8,
    spaceAfter=4,
    leading=16,
    fontName='Helvetica',
))

styles.add(ParagraphStyle(
    'Tip',
    parent=styles['Normal'],
    fontSize=10,
    textColor=HexColor("#1e40af"),
    leftIndent=12,
    spaceAfter=8,
    leading=14,
    fontName='Helvetica-Oblique',
    backColor=HexColor("#eff6ff"),
    borderWidth=0,
    borderPadding=6,
))

styles.add(ParagraphStyle(
    'Warning',
    parent=styles['Normal'],
    fontSize=10,
    textColor=HexColor("#92400e"),
    leftIndent=12,
    spaceAfter=8,
    leading=14,
    fontName='Helvetica-Oblique',
    backColor=HexColor("#fef3c7"),
    borderWidth=0,
    borderPadding=6,
))

styles.add(ParagraphStyle(
    'Caption',
    parent=styles['Normal'],
    fontSize=9,
    textColor=TEXT_MUTED,
    alignment=TA_CENTER,
    spaceAfter=14,
    spaceBefore=4,
    fontName='Helvetica-Oblique',
    leading=12,
))

styles.add(ParagraphStyle(
    'TOCEntry',
    parent=styles['Normal'],
    fontSize=13,
    textColor=PRIMARY_DARK,
    spaceBefore=6,
    spaceAfter=6,
    leftIndent=10,
    fontName='Helvetica',
    leading=20,
))

styles.add(ParagraphStyle(
    'TOCSubEntry',
    parent=styles['Normal'],
    fontSize=11,
    textColor=TEXT_DARK,
    spaceBefore=2,
    spaceAfter=2,
    leftIndent=30,
    fontName='Helvetica',
    leading=16,
))

styles.add(ParagraphStyle(
    'Footer',
    parent=styles['Normal'],
    fontSize=8,
    textColor=TEXT_MUTED,
    alignment=TA_CENTER,
))

# ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

def get_image(filename, max_width=440, max_height=340):
    """Retorna um Image flowable redimensionado proporcionalmente."""
    path = os.path.join(IMG_DIR, filename)
    if not os.path.exists(path):
        return Paragraph(f"<i>[Imagem não encontrada: {filename}]</i>", styles['Caption'])

    img = PILImage.open(path)
    w, h = img.size

    # Scale proportionally
    ratio = min(max_width / w, max_height / h, 1.0)
    new_w = w * ratio
    new_h = h * ratio

    return Image(path, width=new_w, height=new_h)


def image_with_caption(filename, caption_text, max_width=440, max_height=340):
    """Retorna imagem + legenda como KeepTogether."""
    elements = []
    elements.append(Spacer(1, 8))
    elements.append(get_image(filename, max_width, max_height))
    elements.append(Paragraph(caption_text, styles['Caption']))
    return KeepTogether(elements)


def tip_box(text):
    """Cria uma caixa de dica."""
    return Paragraph(f"💡 <b>Dica:</b> {text}", styles['Tip'])


def warning_box(text):
    """Cria uma caixa de aviso."""
    return Paragraph(f"⚠️ <b>Atenção:</b> {text}", styles['Warning'])


def bullet_list(items):
    """Cria lista com bullets."""
    elements = []
    for item in items:
        elements.append(Paragraph(f"• {item}", styles['BulletCustom']))
    return elements


def numbered_list(items):
    """Cria lista numerada."""
    elements = []
    for i, item in enumerate(items, 1):
        elements.append(Paragraph(f"<b>{i}.</b> {item}", styles['BulletCustom']))
    return elements


def section_divider():
    """Divisor visual entre seções."""
    return ColoredLine(460, 1.5, BORDER)


# ─── PAGE TEMPLATES ──────────────────────────────────────────────────────────

def on_first_page(canvas_obj, doc):
    """Template para a primeira página (capa)."""
    canvas_obj.saveState()
    # Barra superior colorida
    canvas_obj.setFillColor(PRIMARY)
    canvas_obj.rect(0, A4[1] - 8*mm, A4[0], 8*mm, fill=1, stroke=0)
    # Barra inferior
    canvas_obj.setFillColor(PRIMARY_DARK)
    canvas_obj.rect(0, 0, A4[0], 6*mm, fill=1, stroke=0)
    canvas_obj.restoreState()


def on_later_pages(canvas_obj, doc):
    """Template para páginas subsequentes."""
    canvas_obj.saveState()
    # Header line
    canvas_obj.setStrokeColor(PRIMARY)
    canvas_obj.setLineWidth(1.5)
    canvas_obj.line(doc.leftMargin, A4[1] - 20*mm,
                    A4[0] - doc.rightMargin, A4[1] - 20*mm)
    # Header text
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.drawString(doc.leftMargin, A4[1] - 18*mm,
                          "AgendaPro — Manual do Usuário")
    # Page number
    canvas_obj.setFont('Helvetica', 9)
    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.drawRightString(A4[0] - doc.rightMargin, 15*mm,
                               f"Página {doc.page}")
    # Footer line
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(doc.leftMargin, 20*mm,
                    A4[0] - doc.rightMargin, 20*mm)
    canvas_obj.restoreState()


# ─── BUILD DOCUMENT ──────────────────────────────────────────────────────────

def build_pdf():
    """Gera o PDF completo do manual."""

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        topMargin=28*mm,
        bottomMargin=25*mm,
        leftMargin=25*mm,
        rightMargin=25*mm,
        title="Manual do Usuário - AgendaPro",
        author="AgendaPro",
        subject="Guia completo de uso do sistema AgendaPro",
    )

    story = []
    content_width = doc.width

    # ═════════════════════════════════════════════════════════════════════════
    # CAPA
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Spacer(1, 60))
    story.append(Paragraph("📅 AgendaPro", styles['CoverTitle']))
    story.append(Spacer(1, 8))
    story.append(ColoredLine(200, 3, PRIMARY))
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Manual do Usuário",
        ParagraphStyle('BigSub', parent=styles['CoverSubtitle'],
                       fontSize=22, textColor=TEXT_DARK, fontName='Helvetica-Bold')
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Sistema de Gestão de Agendas para Professores de Idiomas",
        styles['CoverSubtitle']
    ))
    story.append(Spacer(1, 50))

    # Info box na capa
    cover_info = Paragraph(
        "<b>Versão:</b> 1.0.0<br/>"
        "<b>Data:</b> Fevereiro de 2026<br/>"
        "<b>Plataforma:</b> Aplicação Web (Desktop e Mobile)<br/>"
        "<b>Tecnologias:</b> React + TypeScript + Supabase",
        ParagraphStyle('CoverInfo', parent=styles['BodyText2'],
                       alignment=TA_CENTER, textColor=TEXT_MUTED, fontSize=11)
    )
    story.append(cover_info)

    story.append(Spacer(1, 80))
    story.append(Paragraph(
        "Este manual apresenta todas as funcionalidades do AgendaPro,<br/>"
        "com instruções passo a passo e capturas de tela do sistema.",
        ParagraphStyle('CoverNote', parent=styles['BodyText2'],
                       alignment=TA_CENTER, textColor=TEXT_MUTED, fontSize=10)
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # SUMÁRIO
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("Sumário", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 16))

    toc_items = [
        ("1.", "Introdução"),
        ("2.", "Primeiros Passos"),
        ("", "2.1 Criando sua Conta"),
        ("", "2.2 Fazendo Login"),
        ("", "2.3 Navegação no Sistema"),
        ("3.", "Perfil do Usuário"),
        ("", "3.1 Visualizando seu Perfil"),
        ("", "3.2 Editando seu Perfil"),
        ("4.", "Gestão de Agendas"),
        ("", "4.1 Visualizando a Agenda"),
        ("", "4.2 Adicionando Horários"),
        ("", "4.3 Editando Horários"),
        ("5.", "Gestão de Professores (Admin)"),
        ("", "5.1 Lista de Professores"),
        ("", "5.2 Cadastrar Novo Professor"),
        ("", "5.3 Busca Avançada"),
        ("6.", "Atividade dos Professores (Admin)"),
        ("7.", "Tipos de Aula (Admin)"),
        ("", "7.1 Gerenciar Tipos de Aula"),
        ("", "7.2 Criar Novo Tipo"),
        ("8.", "Listas Especiais (Admin)"),
        ("", "8.1 Lista de Restrição"),
        ("", "8.2 Melhores Professores"),
        ("", "8.3 Adicionando à Lista"),
        ("9.", "Privacidade e LGPD"),
        ("10.", "Perguntas Frequentes"),
    ]

    for num, title in toc_items:
        if num:
            story.append(Paragraph(
                f"<b>{num}</b> {title}",
                styles['TOCEntry']
            ))
        else:
            story.append(Paragraph(title, styles['TOCSubEntry']))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 1 — INTRODUÇÃO
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("1. Introdução", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "O <b>AgendaPro</b> é um sistema web de gestão de agendas desenvolvido especialmente "
        "para escolas e centros de idiomas. Ele permite gerenciar horários de professores, "
        "acompanhar disponibilidade, cadastrar tipos de aula e manter listas especiais de "
        "forma organizada e segura.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("O que o AgendaPro oferece:", styles['BodyBold']))
    story.extend(bullet_list([
        "<b>Gestão de Agendas</b> — Controle completo de horários livres e ocupados para cada professor",
        "<b>Cadastro de Professores</b> — Dados completos incluindo nível, certificações e formação",
        "<b>Busca Avançada</b> — Encontre professores disponíveis por horário, nível e tipo de aula",
        "<b>Listas Especiais</b> — Gerencie listas de restrição e destaques de professores",
        "<b>Monitoramento de Atividade</b> — Acompanhe o uso do sistema pelos professores",
        "<b>Privacidade (LGPD)</b> — Controle total sobre seus dados pessoais",
    ]))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Tipos de Usuário", styles['SectionTitle']))
    story.append(Paragraph(
        "O sistema possui dois tipos de acesso com permissões distintas:",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4))

    # Tabela de roles
    role_data = [
        [Paragraph("<b>Funcionalidade</b>", styles['BodyBold']),
         Paragraph("<b>Administrador</b>", styles['BodyBold']),
         Paragraph("<b>Professor</b>", styles['BodyBold'])],
        ["Visualizar agenda própria", "✅", "✅"],
        ["Editar agenda própria", "✅", "✅"],
        ["Gerenciar perfil", "✅", "✅"],
        ["Privacidade e dados", "✅", "✅"],
        ["Ver todos os professores", "✅", "❌"],
        ["Cadastrar professores", "✅", "❌"],
        ["Busca avançada", "✅", "❌"],
        ["Monitorar atividade", "✅", "❌"],
        ["Gerenciar tipos de aula", "✅", "❌"],
        ["Listas especiais", "✅", "❌"],
        ["Ver agenda de outros", "✅", "❌"],
    ]

    role_table = Table(role_data, colWidths=[content_width * 0.50,
                                              content_width * 0.25,
                                              content_width * 0.25])
    role_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(role_table)
    story.append(Spacer(1, 6))
    story.append(tip_box(
        "O tipo de usuário é definido no momento do cadastro e determina "
        "quais menus e funcionalidades estarão disponíveis."
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 2 — PRIMEIROS PASSOS
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("2. Primeiros Passos", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    # 2.1 Criando conta
    story.append(Paragraph("2.1 Criando sua Conta", styles['SectionTitle']))
    story.append(Paragraph(
        "Para começar a usar o AgendaPro, você precisa criar uma conta. "
        "Siga os passos abaixo:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        "Acesse a página inicial do AgendaPro no seu navegador",
        'Clique no link <b>"Não tem uma conta? Cadastre-se"</b> na tela de login',
        "Preencha o formulário de registro com seus dados:",
    ]))
    story.extend(bullet_list([
        "<b>Nome Completo</b> — Seu nome como será exibido no sistema",
        "<b>Email</b> — Endereço de e-mail válido para acesso",
        "<b>Senha</b> — Mínimo de 6 caracteres",
        "<b>Confirmar Senha</b> — Repita a mesma senha",
        "<b>Tipo de Usuário</b> — Selecione <i>Administrador</i> ou <i>Professor</i>",
    ]))
    story.extend(numbered_list([
        'Clique em <b>"Criar Conta"</b>',
        "Você verá uma mensação de sucesso e será redirecionado para a tela de login",
    ]))
    story[len(story)-2] = Paragraph(
        "<b>4.</b> Clique em <b>\"Criar Conta\"</b>", styles['Bullet'])
    story[len(story)-1] = Paragraph(
        "<b>5.</b> Você receberá uma mensagem de sucesso e será redirecionado para a tela de login",
        styles['Bullet']
    )

    story.append(Spacer(1, 4))
    story.append(warning_box(
        "A senha deve ter no mínimo 6 caracteres e precisa ser igual nos dois campos."
    ))

    # 2.2 Login
    story.append(Spacer(1, 10))
    story.append(Paragraph("2.2 Fazendo Login", styles['SectionTitle']))
    story.append(Paragraph(
        "Com sua conta criada, faça login para acessar o sistema:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        "Na tela de login, informe seu <b>Email</b> e <b>Senha</b>",
        'Clique em <b>"Entrar"</b>',
        "Você será redirecionado automaticamente para o <b>Dashboard</b> (painel principal)",
    ]))
    story.append(Spacer(1, 4))
    story.append(tip_box(
        "Sua sessão é mantida automaticamente. Ao retornar ao sistema, "
        "você permanecerá logado até clicar em \"Sair\"."
    ))

    # 2.3 Navegação
    story.append(Spacer(1, 10))
    story.append(Paragraph("2.3 Navegação no Sistema", styles['SectionTitle']))
    story.append(Paragraph(
        "O AgendaPro possui uma interface dividida em três áreas principais:",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        "<b>Cabeçalho (Header)</b> — Barra superior com o logo, botão de tema (claro/escuro), "
        "seu avatar com nome e cargo, e o botão \"Sair\" para fazer logout",
        "<b>Menu Lateral (Sidebar)</b> — Menu à esquerda com todas as seções disponíveis "
        "para o seu tipo de usuário. No celular, o menu é acessível pelo botão flutuante no canto inferior esquerdo",
        "<b>Área Principal</b> — Conteúdo central que muda conforme o item selecionado no menu lateral",
    ]))
    story.append(Spacer(1, 6))

    # Tabela de menus
    story.append(Paragraph("Itens do Menu — Administrador:", styles['SubSection']))
    menu_data = [
        [Paragraph("<b>Menu</b>", styles['BodyBold']),
         Paragraph("<b>Descrição</b>", styles['BodyBold'])],
        ["📅 Agendas", "Visualize e gerencie as agendas dos professores"],
        ["👥 Professores", "Cadastre e gerencie professores"],
        ["🔍 Buscar Horários", "Busca avançada de professores disponíveis"],
        ["📊 Atividade", "Monitore o acesso dos professores ao sistema"],
        ["📚 Tipos de Aula", "Gerencie os tipos de aula disponíveis"],
        ["👤 Meu Perfil", "Visualize e edite seus dados pessoais"],
        ["🔒 Privacidade", "Configurações de privacidade e LGPD"],
        ["⭐ Listas Especiais", "Listas de restrição e melhores professores"],
    ]
    menu_table = Table(menu_data, colWidths=[content_width * 0.30, content_width * 0.70])
    menu_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(menu_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Itens do Menu — Professor:", styles['SubSection']))
    story.extend(bullet_list([
        "📅 <b>Minha Agenda</b> — Visualize e edite sua própria agenda",
        "👤 <b>Meu Perfil</b> — Gerencie seus dados pessoais",
        "🔒 <b>Privacidade</b> — Configurações de privacidade e LGPD",
    ]))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 3 — PERFIL DO USUÁRIO
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("3. Perfil do Usuário", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    # 3.1 Visualizando
    story.append(Paragraph("3.1 Visualizando seu Perfil", styles['SectionTitle']))
    story.append(Paragraph(
        "A seção <b>Meu Perfil</b> exibe suas informações pessoais cadastradas no sistema. "
        "Para acessá-la, clique em <b>\"Meu Perfil\"</b> no menu lateral.",
        styles['BodyText2']
    ))
    story.append(Paragraph("Informações exibidas:", styles['BodyBold']))
    story.extend(bullet_list([
        "<b>Avatar</b> — Exibe as iniciais do seu nome",
        "<b>Nome Completo</b>",
        "<b>Cargo</b> — Administrador ou Professor",
        "<b>Email</b>",
        "<b>Telefone</b>",
    ]))
    story.append(Paragraph(
        "Para professores, também são exibidos o <b>Nível</b> e se possui "
        "<b>Certificação Internacional</b>.",
        styles['BodyText2']
    ))
    story.append(image_with_caption(
        "meu-perfil.png",
        "Figura 1 — Tela \"Meu Perfil\" exibindo os dados do usuário"
    ))

    # 3.2 Editando
    story.append(Paragraph("3.2 Editando seu Perfil", styles['SectionTitle']))
    story.append(Paragraph(
        "Para editar suas informações:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        "Acesse <b>Meu Perfil</b> no menu lateral",
        'Clique no botão <b>"Editar Perfil"</b>',
        "Os campos ficarão editáveis — altere as informações desejadas",
        'Clique em <b>"Salvar"</b> para confirmar as alterações ou <b>"Cancelar"</b> para descartar',
    ]))
    story.append(image_with_caption(
        "editar-perfil.png",
        "Figura 2 — Perfil em modo de edição com campos editáveis"
    ))
    story.append(tip_box(
        "Professores podem alterar seu nível e certificação internacional diretamente pelo perfil."
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 4 — GESTÃO DE AGENDAS
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("4. Gestão de Agendas", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "A gestão de agendas é a funcionalidade central do AgendaPro. Aqui você pode "
        "visualizar, criar e gerenciar os horários de aula.",
        styles['BodyText2']
    ))

    # 4.1 Visualização
    story.append(Paragraph("4.1 Visualizando a Agenda", styles['SectionTitle']))
    story.append(Paragraph(
        "A agenda é apresentada em formato de grade semanal (Domingo a Sábado), "
        "com cada horário representado por um cartão individual:",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        '🟢 <b>Livre</b> — Horário disponível para agendamento (verde)',
        '🔵 <b>Com Aluno</b> — Horário ocupado, exibe o nome do aluno',
        '🔴 <b>Indisponível</b> — Horário bloqueado',
    ]))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Cada cartão de horário mostra o <b>intervalo de tempo</b> (ex: 08:00 - 09:00), "
        "o <b>status</b> com indicador colorido, o <b>nome do aluno</b> (quando ocupado) "
        "e a <b>data da última modificação</b>.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Para Administradores:</b> Acesse \"Agendas\" no menu e selecione um professor "
        "na lista de professores, ou clique no botão \"Agenda\" ao lado do nome do professor.<br/>"
        "<b>Para Professores:</b> Sua agenda pessoal é exibida automaticamente ao acessar "
        "\"Minha Agenda\".",
        styles['BodyText2']
    ))

    # 4.2 Adicionando horários
    story.append(Spacer(1, 6))
    story.append(Paragraph("4.2 Adicionando Horários", styles['SectionTitle']))
    story.append(Paragraph(
        "Para criar novos horários na agenda:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        'Clique no botão <b>"Adicionar Horários"</b> (ícone de +) na tela da agenda',
        "Selecione os <b>dias da semana</b> desejados clicando nos botões "
        "(é possível selecionar vários dias de uma vez, ou usar \"Selecionar todos\")",
        "Defina o <b>horário de início</b> e <b>horário de fim</b> usando os campos de hora e minuto",
        'Clique em <b>"Adicionar"</b> para incluir o intervalo de tempo na lista',
        "Repita os passos 3-4 para adicionar vários horários diferentes",
        "Escolha o <b>status inicial</b> dos horários (Livre, Com Aluno ou Indisponível)",
        "Se selecionar \"Com Aluno\", informe o <b>nome do aluno</b>",
        'Clique em <b>"Criar X Horário(s)"</b> para finalizar',
    ]))
    story.append(Spacer(1, 4))
    story.append(tip_box(
        "Você pode criar múltiplos horários de uma vez! Selecione vários dias "
        "e adicione vários intervalos de tempo. O sistema exibe um resumo com o total "
        "de horários que serão criados."
    ))

    # 4.3 Editando
    story.append(Spacer(1, 6))
    story.append(Paragraph("4.3 Editando Horários", styles['SectionTitle']))
    story.append(Paragraph(
        "Para editar um horário existente:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        "<b>Clique no cartão do horário</b> que deseja editar na grade",
        "O diálogo de edição será aberto mostrando os dados atuais",
        "Altere o <b>status</b> no menu suspenso (Livre / Com Aluno / Indisponível)",
        "Se selecionar \"Com Aluno\", preencha o <b>nome do aluno</b>",
        'Clique em <b>"Salvar Alterações"</b> para confirmar',
    ]))
    story.append(Spacer(1, 4))
    story.append(warning_box(
        'Para remover um horário permanentemente, clique em "Remover Horário" '
        '(botão vermelho) no diálogo de edição. Esta ação não pode ser desfeita.'
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 5 — GESTÃO DE PROFESSORES (ADMIN)
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("5. Gestão de Professores", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<i>Funcionalidade exclusiva para Administradores</i>",
        ParagraphStyle('AdminNote', parent=styles['BodyText2'],
                       textColor=SECONDARY, fontName='Helvetica-Oblique', fontSize=10)
    ))
    story.append(Spacer(1, 8))

    # 5.1 Lista
    story.append(Paragraph("5.1 Lista de Professores", styles['SectionTitle']))
    story.append(Paragraph(
        "Acesse <b>\"Professores\"</b> no menu lateral para ver todos os professores "
        "cadastrados no sistema. A tela exibe:",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        "<b>Barra de busca</b> — Pesquise por nome ou e-mail",
        "<b>Cartões de professor</b> — Cada professor é exibido em um cartão com:",
    ]))
    story.extend(bullet_list([
        "Avatar com iniciais do nome",
        "Nome, e-mail e telefone",
        "Badge de nível (Iniciante, Intermediário, Avançado ou Nativo) com cor diferenciada",
        "Badge \"Certificado\" quando possui certificação internacional",
        'Botão <b>"Agenda"</b> — Abre a agenda do professor',
        'Botão <b>"Detalhes"</b> — Abre o formulário de edição',
    ]))

    # 5.2 Cadastro
    story.append(Spacer(1, 6))
    story.append(Paragraph("5.2 Cadastrar Novo Professor", styles['SectionTitle']))
    story.append(Paragraph(
        "Para cadastrar um novo professor:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        'Clique em <b>"Novo Professor"</b> no canto superior direito da lista de professores',
        "Preencha o formulário que possui <b>4 abas</b>:",
    ]))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Aba 1 — Dados Básicos:</b>", styles['BodyBold']))
    story.extend(bullet_list([
        "Nome* (obrigatório)",
        "Email* (obrigatório)",
        "Telefone",
        "Nível* — Iniciante, Intermediário, Avançado ou Nativo",
        "Certificação Internacional (checkbox)",
        "Senha* e Confirmação de Senha*",
    ]))

    story.append(Paragraph("<b>Aba 2 — Formação:</b>", styles['BodyBold']))
    story.extend(bullet_list([
        "Campo de texto para descrever a formação acadêmica do professor",
    ]))

    story.append(Paragraph("<b>Aba 3 — Tipos de Aula:</b>", styles['BodyBold']))
    story.extend(bullet_list([
        "Selecione os tipos de aula que o professor ministra (badges clicáveis)",
    ]))

    story.append(Paragraph("<b>Aba 4 — Endereço:</b>", styles['BodyBold']))
    story.extend(bullet_list([
        "CEP (com preenchimento automático via ViaCEP)",
        "Rua, Número, Complemento, Bairro, Cidade, Estado",
    ]))
    story.append(Spacer(1, 4))
    story.append(tip_box(
        'Ao informar o CEP, os campos de endereço são preenchidos automaticamente!'
    ))

    # 5.3 Busca avançada
    story.append(Spacer(1, 6))
    story.append(Paragraph("5.3 Busca Avançada de Professores", styles['SectionTitle']))
    story.append(Paragraph(
        "A busca avançada permite encontrar professores com filtros combinados. "
        "Acesse <b>\"Buscar Horários\"</b> no menu lateral.",
        styles['BodyText2']
    ))
    story.append(Paragraph("Filtros disponíveis:", styles['BodyBold']))
    story.extend(bullet_list([
        "<b>Disponibilidade</b> — Dia da semana + Horário",
        "<b>Nível</b> — Iniciante, Intermediário, Avançado, Nativo",
        "<b>Certificação Internacional</b> — Filtrar por certificados",
        "<b>Desempenho</b> — Ruim, Regular, Bom, Excelente",
        "<b>Tipos de Aula</b> — Selecione um ou mais tipos",
        "<b>Formação Acadêmica</b> — Busca por texto na formação",
    ]))
    story.append(image_with_caption(
        "busca-avancada-professores.png",
        "Figura 3 — Tela de Busca Avançada com filtros de pesquisa"
    ))
    story.append(Paragraph(
        'Após configurar os filtros, clique em <b>"Buscar"</b>. Os resultados serão '
        "exibidos como cartões com as informações do professor e a quantidade de "
        'horários livres. Clique em <b>"Ver Agenda"</b> para ir diretamente à agenda do professor.',
        styles['BodyText2']
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 6 — ATIVIDADE DOS PROFESSORES (ADMIN)
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("6. Atividade dos Professores", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<i>Funcionalidade exclusiva para Administradores</i>",
        ParagraphStyle('AdminNote2', parent=styles['BodyText2'],
                       textColor=SECONDARY, fontName='Helvetica-Oblique', fontSize=10)
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "A tela de <b>Atividade dos Professores</b> permite monitorar o uso do sistema. "
        "Acesse <b>\"Atividade\"</b> no menu lateral para visualizar uma tabela com:",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        "<b>Nome e e-mail</b> do professor",
        "<b>Status de atividade</b> — indica há quanto tempo o professor acessou o sistema",
        "<b>Último acesso</b> — Data e hora do último login com tempo relativo (ex: \"há 2 horas\")",
        "<b>Última alteração na agenda</b> — Quando o professor fez a última mudança",
        '<b>Ação</b> — Botão "Ver Agenda" para acessar a agenda daquele professor',
    ]))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Status de Atividade:", styles['SubSection']))

    status_data = [
        [Paragraph("<b>Status</b>", styles['BodyBold']),
         Paragraph("<b>Cor</b>", styles['BodyBold']),
         Paragraph("<b>Significado</b>", styles['BodyBold'])],
        ["Ativo", "🟢 Verde", "Acesso nas últimas 24 horas"],
        ["Recente", "🔵 Azul", "Acesso nos últimos 3 dias"],
        ["Ausente", "⚪ Cinza", "Acesso na última semana"],
        ["Inativo", "🔴 Vermelho", "Sem acesso há mais de 1 semana"],
    ]
    status_table = Table(status_data, colWidths=[content_width * 0.20,
                                                  content_width * 0.25,
                                                  content_width * 0.55])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, BG_LIGHT]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(status_table)

    story.append(Spacer(1, 8))
    story.append(image_with_caption(
        "atividade-professores.png",
        "Figura 4 — Monitoramento de atividade dos professores"
    ))
    story.append(image_with_caption(
        "atividades-dos-professores.png",
        "Figura 5 — Detalhes da atividade com último acesso e alterações"
    ))
    story.append(tip_box(
        'Use o botão "Atualizar" para recarregar os dados de atividade em tempo real. '
        "A barra de busca permite filtrar professores por nome ou e-mail."
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 7 — TIPOS DE AULA (ADMIN)
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("7. Tipos de Aula", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<i>Funcionalidade exclusiva para Administradores</i>",
        ParagraphStyle('AdminNote3', parent=styles['BodyText2'],
                       textColor=SECONDARY, fontName='Helvetica-Oblique', fontSize=10)
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Os tipos de aula definem quais modalidades de ensino estão disponíveis "
        "no sistema (ex: Conversação, Gramática, Business English, etc.). "
        "Eles são usados no cadastro de professores e na busca avançada.",
        styles['BodyText2']
    ))

    # 7.1 Gerenciar
    story.append(Paragraph("7.1 Gerenciar Tipos de Aula", styles['SectionTitle']))
    story.append(Paragraph(
        "Acesse <b>\"Tipos de Aula\"</b> no menu lateral para ver todos os tipos cadastrados. "
        "Cada tipo exibe:",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        "<b>Nome do tipo</b> — Ex: \"Conversação\", \"Gramática\"",
        "<b>Descrição</b> — Detalhes sobre o tipo de aula",
        '<b>Botão editar</b> (ícone de lápis) — Edita o tipo',
        '<b>Botão excluir</b> (ícone de lixeira) — Remove o tipo (com confirmação)',
    ]))
    story.append(image_with_caption(
        "gerenciar-tipos-aula.png",
        "Figura 6 — Tela de gerenciamento de tipos de aula"
    ))

    # 7.2 Criar novo
    story.append(Paragraph("7.2 Criar Novo Tipo de Aula", styles['SectionTitle']))
    story.append(Paragraph(
        "Para cadastrar um novo tipo de aula:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        'Clique em <b>"Novo Tipo"</b> no canto superior direito',
        "No diálogo que aparecer, preencha o <b>Nome</b> do tipo (obrigatório)",
        "Opcionalmente, adicione uma <b>Descrição</b>",
        'Clique em <b>"Criar"</b> para salvar',
    ]))
    story.append(image_with_caption(
        "novo-tipo-aula.png",
        "Figura 7 — Diálogo para criação de novo tipo de aula"
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 8 — LISTAS ESPECIAIS (ADMIN)
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("8. Listas Especiais", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<i>Funcionalidade exclusiva para Administradores</i>",
        ParagraphStyle('AdminNote4', parent=styles['BodyText2'],
                       textColor=SECONDARY, fontName='Helvetica-Oblique', fontSize=10)
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "As <b>Listas Especiais</b> permitem categorizar professores em dois grupos "
        "importantes para a gestão da escola. Acesse <b>\"Listas Especiais\"</b> no menu lateral.",
        styles['BodyText2']
    ))
    story.append(Spacer(1, 4))    
    story.append(image_with_caption(
        "listas-especiais.png",
        "Figura 8 — Visão geral das Listas Especiais com as duas categorias"
    ))

    # 8.1 Restrição
    story.append(Paragraph("8.1 Lista de Restrição", styles['SectionTitle']))
    story.append(Paragraph(
        "A lista <b>\"Não Enviar Alunos no Momento\"</b> (ícone de escudo vermelho) "
        "identifica professores que, por algum motivo, não devem receber novos alunos "
        "temporariamente.",
        styles['BodyText2']
    ))
    story.append(Paragraph("Cada item da lista mostra:", styles['BodyBold']))
    story.extend(bullet_list([
        "Avatar e nome do professor",
        "Observação/motivo (quando informado)",
        "Data em que foi adicionado à lista",
        'Botão <b>"Remover"</b> para retirar da lista',
    ]))
    story.append(image_with_caption(
        "lista-restricao.png",
        "Figura 9 — Lista de Restrição com professores que não devem receber novos alunos"
    ))

    # 8.2 Melhores
    story.append(Paragraph("8.2 Melhores Professores", styles['SectionTitle']))
    story.append(Paragraph(
        "A lista <b>\"Melhores Professores\"</b> (ícone de estrela amarela) destaca os "
        "professores com melhor desempenho. Use-a para reconhecer e priorizar esses profissionais.",
        styles['BodyText2']
    ))
    story.append(image_with_caption(
        "lista-melhores-professores.png",
        "Figura 10 — Lista de Melhores Professores destacados no sistema"
    ))

    # 8.3 Adicionando
    story.append(Paragraph("8.3 Adicionando Professores às Listas", styles['SectionTitle']))
    story.append(Paragraph(
        "Para adicionar um professor a qualquer uma das listas:",
        styles['BodyText2']
    ))
    story.extend(numbered_list([
        'Clique no botão <b>"Adicionar"</b> no cabeçalho da lista desejada',
        "No diálogo, <b>pesquise e selecione o professor</b> na lista suspensa "
        "(professores já na lista são filtrados automaticamente)",
        "Opcionalmente, adicione uma <b>Observação/Motivo</b>",
        'Clique em <b>"Adicionar"</b> para confirmar',
    ]))
    story.append(image_with_caption(
        "adicionar-restricao.png",
        "Figura 11 — Diálogo para adicionar professor à lista de restrição"
    ))
    story.append(warning_box(
        "Para remover um professor de uma lista, clique no botão \"Remover\" ao lado do nome. "
        "A remoção é imediata."
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 9 — PRIVACIDADE E LGPD
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("9. Privacidade e LGPD", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "O AgendaPro está em conformidade com a <b>Lei Geral de Proteção de Dados (LGPD)</b>. "
        "Acesse <b>\"Privacidade\"</b> no menu lateral para gerenciar suas preferências.",
        styles['BodyText2']
    ))

    story.append(Paragraph("Consentimentos", styles['SubSection']))
    story.append(Paragraph(
        "Gerencie seus consentimentos através dos interruptores (toggles):",
        styles['BodyText2']
    ))
    story.extend(bullet_list([
        "<b>Política de Privacidade</b> — Consentimento obrigatório (não pode ser desativado)",
        "<b>Processamento de Dados</b> — Controle se seus dados podem ser processados para melhorias",
        "<b>Comunicações de Marketing</b> — Receba ou não comunicações promocionais",
    ]))

    story.append(Paragraph("Seus Dados", styles['SubSection']))
    story.extend(bullet_list([
        '<b>Exportar Dados</b> — Clique em "Exportar meus dados" para baixar um arquivo JSON '
        "com todas as suas informações pessoais armazenadas no sistema",
        '<b>Excluir Conta</b> — Na zona de perigo, clique em "Excluir minha conta" '
        "para remover permanentemente todos os seus dados. Um diálogo de confirmação "
        "listará tudo que será excluído (perfil, agendas, configurações, histórico de consentimento)",
    ]))
    story.append(Spacer(1, 4))
    story.append(warning_box(
        "A exclusão de conta é PERMANENTE e irreversível. Todos os seus dados, agendas "
        "e configurações serão removidos definitivamente."
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Contato do DPO (Data Protection Officer):</b><br/>"
        "E-mail: privacidade@agendapro.com.br<br/>"
        "Prazo de resposta: até 15 dias úteis conforme a LGPD",
        styles['BodyText2']
    ))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # CAPÍTULO 10 — PERGUNTAS FREQUENTES
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Paragraph("10. Perguntas Frequentes", styles['ChapterTitle']))
    story.append(ColoredLine(content_width, 2, PRIMARY))
    story.append(Spacer(1, 10))

    faqs = [
        (
            "Como altero minha senha?",
            "No momento, a alteração de senha pode ser feita diretamente pelo administrador "
            "do sistema. Entre em contato com o suporte para solicitar uma nova senha."
        ),
        (
            "Esqueci minha senha. O que faço?",
            "Entre em contato com o administrador do sistema para que ele possa "
            "redefinir sua senha de acesso."
        ),
        (
            "Como professor, posso ver a agenda de outros professores?",
            "Não. Professores têm acesso apenas à sua própria agenda e perfil. "
            "Somente administradores podem visualizar agendas de outros professores."
        ),
        (
            "Posso usar o sistema no celular?",
            "Sim! O AgendaPro é responsivo e funciona em dispositivos móveis. "
            "No celular, o menu lateral é acessível pelo botão flutuante no canto inferior esquerdo da tela."
        ),
        (
            "Como ativo o modo escuro?",
            "Clique no ícone de sol/lua no cabeçalho do sistema (ao lado do seu avatar). "
            "A preferência de tema é salva automaticamente."
        ),
        (
            "O que acontece se eu excluir minha conta?",
            "Todos os seus dados serão removidos permanentemente: perfil, agendas, "
            "configurações e histórico de consentimento. Esta ação não pode ser desfeita."
        ),
        (
            "Como exporto meus dados pessoais?",
            'Acesse "Privacidade" no menu lateral e clique em "Exportar meus dados". '
            "Um arquivo JSON será baixado com todas as suas informações."
        ),
        (
            "O que é a busca avançada?",
            "É uma ferramenta para administradores encontrarem professores usando múltiplos "
            "filtros: disponibilidade por dia/horário, nível, certificação, desempenho, "
            "tipo de aula e formação acadêmica."
        ),
        (
            "Como adiciono um professor à lista de Restrição?",
            'Na seção "Listas Especiais", clique em "Adicionar" na lista de restrição, '
            "selecione o professor e opcionalmente adicione um motivo."
        ),
        (
            "O que significam os status de atividade?",
            "Ativo (acesso há menos de 24h), Recente (menos de 3 dias), "
            "Ausente (menos de 1 semana), Inativo (mais de 1 semana sem acesso)."
        ),
    ]

    for question, answer in faqs:
        story.append(Paragraph(f"<b>P: {question}</b>", styles['BodyBold']))
        story.append(Paragraph(f"R: {answer}", styles['BodyText2']))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════════════════════
    # PÁGINA FINAL
    # ═════════════════════════════════════════════════════════════════════════

    story.append(Spacer(1, 100))
    story.append(Paragraph("📅 AgendaPro", styles['CoverTitle']))
    story.append(Spacer(1, 10))
    story.append(ColoredLine(200, 3, PRIMARY))
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Obrigado por usar o AgendaPro!",
        ParagraphStyle('Thanks', parent=styles['CoverSubtitle'],
                       fontSize=18, textColor=TEXT_DARK, fontName='Helvetica-Bold')
    ))
    story.append(Spacer(1, 14))
    story.append(Paragraph(
        "Este manual foi criado para ajudá-lo a aproveitar ao máximo<br/>"
        "todas as funcionalidades do sistema.",
        ParagraphStyle('FinalNote', parent=styles['CoverSubtitle'],
                       fontSize=12, textColor=TEXT_MUTED)
    ))
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        "<b>Versão do Manual:</b> 1.0.0<br/>"
        "<b>Data:</b> Fevereiro de 2026<br/>"
        "<b>Suporte:</b> privacidade@agendapro.com.br",
        ParagraphStyle('FinalInfo', parent=styles['BodyText2'],
                       alignment=TA_CENTER, textColor=TEXT_MUTED, fontSize=10)
    ))

    # ─── BUILD ──────────────────────────────────────────────────────────────

    doc.build(
        story,
        onFirstPage=on_first_page,
        onLaterPages=on_later_pages,
    )
    print(f"✅ PDF gerado com sucesso: {OUTPUT_PATH}")
    print(f"   Tamanho: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")


if __name__ == "__main__":
    build_pdf()
