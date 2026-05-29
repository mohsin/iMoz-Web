#!/usr/bin/env python3
"""
Tempestronics Workshop Brochure Generator
Generates a password-protected PDF brochure from JSON input via stdin.
Usage: echo '<json>' | python3 generate_brochure.py <output_path>
"""

import sys
import json
import os
from datetime import date, datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import pikepdf

# Register Helvetica Neue faces from macOS TTC (matches original Pages source fonts).
# Falls back to built-in Helvetica on Linux/Netlify.
_HN_TTC = '/System/Library/Fonts/HelveticaNeue.ttc'
_HN_AVAILABLE = False
if os.path.exists(_HN_TTC):
    _HN_MAP = {'HNRegular': 0, 'HNBold': 1, 'HNUltraLight': 5, 'HNLight': 7, 'HNMedium': 10}
    for _name, _idx in _HN_MAP.items():
        pdfmetrics.registerFont(TTFont(_name, _HN_TTC, subfontIndex=_idx))
    _HN_AVAILABLE = True

HN_ULTRALIGHT = 'HNUltraLight' if _HN_AVAILABLE else 'Helvetica'
HN_LIGHT      = 'HNLight'      if _HN_AVAILABLE else 'Helvetica'
HN_MEDIUM     = 'HNMedium'     if _HN_AVAILABLE else 'Helvetica-Bold'
HN_BOLD       = 'HNBold'       if _HN_AVAILABLE else 'Helvetica-Bold'
HN_REGULAR    = 'HNRegular'    if _HN_AVAILABLE else 'Helvetica'

# Register a font that supports ₹ (U+20B9). Try candidates in order.
_RUPEE_FONT_CANDIDATES = [
    '/usr/local/texlive/2022/texmf-dist/fonts/truetype/google/noto/NotoSans-Regular.ttf',
    '/usr/local/texlive/2021/texmf-dist/fonts/truetype/google/noto/NotoSans-Regular.ttf',
    '/usr/local/share/fonts/NotoSans-Regular.ttf',
    '/Library/Fonts/NotoSans-Regular.ttf',
]
UNICODE_FONT = HN_LIGHT
for _candidate in _RUPEE_FONT_CANDIDATES:
    if os.path.exists(_candidate):
        pdfmetrics.registerFont(TTFont('NotoSans', _candidate))
        UNICODE_FONT = 'NotoSans'
        break

# ---------------------------------------------------------------------------
# Colours (extracted from original brochures)
# ---------------------------------------------------------------------------
BLUE_STEEL   = colors.HexColor('#3A6E8F')   # table headers, TOC header
BLUE_ACCENT  = colors.HexColor('#2E74A0')   # subheadings, link text
OLIVE_GREEN  = colors.HexColor('#7B9452')   # Proposed To/By, Pricing headers
GREY_LIGHT   = colors.HexColor('#F5F5F5')   # alternate table rows
GREY_DIVIDER = colors.HexColor('#CCCCCC')   # dotted divider approximation
BLACK        = colors.black
WHITE        = colors.white

# ---------------------------------------------------------------------------
# Page geometry
# ---------------------------------------------------------------------------
PAGE_W, PAGE_H = A4          # 595.27 x 841.89 pts
LEFT_M   = 2.0 * cm
RIGHT_M  = 2.0 * cm
TOP_M    = 1.5 * cm
BOTTOM_M = 2.2 * cm

LOGO_ICON_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'brochure', 'logo-icon.png')
LOGO_FULL_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'brochure', 'logo-full.png')

# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------
def make_styles():
    s = {}

    s['body'] = ParagraphStyle(
        'body',
        fontName='Times-Roman',
        fontSize=10,
        leading=15,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )
    s['body_indent'] = ParagraphStyle(
        'body_indent',
        parent=s['body'],
        firstLineIndent=18,
    )
    s['body_about'] = ParagraphStyle(
        'body_about',
        fontName=HN_LIGHT,
        fontSize=12,
        leading=20,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    )
    s['heading'] = ParagraphStyle(
        'heading',
        fontName=HN_ULTRALIGHT,
        fontSize=22,
        leading=26,
        textColor=BLACK,
        spaceBefore=10,
        spaceAfter=14,
    )
    s['subheading'] = ParagraphStyle(
        'subheading',
        fontName=HN_MEDIUM,
        fontSize=11,
        textColor=BLUE_ACCENT,
        spaceBefore=10,
        spaceAfter=4,
    )
    s['label'] = ParagraphStyle(
        'label',
        fontName=HN_MEDIUM,
        fontSize=10,
        textColor=BLACK,
        alignment=TA_CENTER,
    )
    s['value'] = ParagraphStyle(
        'value',
        fontName='Times-Roman',
        fontSize=10,
        textColor=BLACK,
        alignment=TA_CENTER,
    )
    s['meta_key'] = ParagraphStyle(
        'meta_key',
        fontName=HN_MEDIUM,
        fontSize=10,
        textColor=BLUE_ACCENT,
    )
    s['meta_val'] = ParagraphStyle(
        'meta_val',
        fontName='Times-Roman',
        fontSize=10,
    )
    s['cover_title'] = ParagraphStyle(
        'cover_title',
        fontName=HN_ULTRALIGHT,
        fontSize=29,
        leading=35,
        textColor=BLACK,
        spaceAfter=20,
    )
    s['cover_college'] = ParagraphStyle(
        'cover_college',
        fontName=HN_ULTRALIGHT,
        fontSize=34,
        leading=42,
        textColor=BLACK,
    )
    s['footer_conf'] = ParagraphStyle(
        'footer_conf',
        fontName=HN_REGULAR,
        fontSize=8,
        textColor=BLACK,
        alignment=TA_RIGHT,
        spaceAfter=1,
    )
    s['footer_note'] = ParagraphStyle(
        'footer_note',
        fontName='Times-Roman',
        fontSize=8,
        textColor=BLACK,
        alignment=TA_CENTER,
    )
    s['toc_center'] = ParagraphStyle(
        'toc_center',
        fontName='Times-Roman',
        fontSize=10,
        alignment=TA_CENTER,
    )
    s['bullet'] = ParagraphStyle(
        'bullet',
        fontName='Times-Roman',
        fontSize=10,
        leading=15,
        leftIndent=14,
        bulletIndent=0,
        spaceBefore=2,
        spaceAfter=2,
        alignment=TA_JUSTIFY,
    )
    s['pricing_spec'] = ParagraphStyle(
        'pricing_spec',
        fontName=HN_MEDIUM,
        fontSize=14,
        textColor=BLUE_ACCENT,
        alignment=TA_CENTER,
    )
    s['pricing_val'] = ParagraphStyle(
        'pricing_val',
        fontName=UNICODE_FONT,
        fontSize=20,
        leading=20,
        textColor=BLACK,
        alignment=TA_CENTER,
    )
    s['other_item'] = ParagraphStyle(
        'other_item',
        fontName=HN_BOLD,
        fontSize=11,
        textColor=BLUE_ACCENT,
        leftIndent=10,
        spaceBefore=3,
    )
    return s


# ---------------------------------------------------------------------------
# Header / Footer canvas callback
# ---------------------------------------------------------------------------
class HeaderFooter:
    def __init__(self, is_cover=False, page_label=None, cover_college=None):
        self.is_cover = is_cover
        self.page_label = page_label
        self.cover_college = cover_college

    def __call__(self, canvas_obj, doc):
        canvas_obj.saveState()
        w = PAGE_W

        if self.is_cover and self.cover_college:
            # Draw college name anchored just above the footer, wrapping upward for long names
            y_bottom = BOTTOM_M + 1.0 * cm
            avail_w = PAGE_W - LEFT_M - RIGHT_M
            p = Paragraph(self.cover_college, ParagraphStyle(
                'cc', fontName=HN_ULTRALIGHT, fontSize=34, leading=42, textColor=BLACK))
            _, h = p.wrapOn(canvas_obj, avail_w, PAGE_H)
            p.drawOn(canvas_obj, LEFT_M, y_bottom)

        if not self.is_cover:
            # Page label top-left
            if self.page_label:
                canvas_obj.setFont('Helvetica', 8)
                canvas_obj.setFillColor(BLACK)
                canvas_obj.drawString(LEFT_M, PAGE_H - 1.3 * cm, self.page_label)

        # Header rule — single line
        y_rule = PAGE_H - 1.5 * cm
        canvas_obj.setStrokeColor(BLUE_STEEL)
        canvas_obj.setLineWidth(1.5)
        canvas_obj.line(LEFT_M, y_rule, w - RIGHT_M, y_rule)

        # TEMPESTRONICS wordmark
        canvas_obj.setFont(HN_BOLD, 9)
        canvas_obj.setFillColor(BLUE_STEEL)
        canvas_obj.drawString(LEFT_M, y_rule - 12, 'TEMPESTRONICS')

        # Logo icon top-right
        icon_path = os.path.abspath(LOGO_ICON_PATH)
        if os.path.exists(icon_path):
            icon_size = 3.2 * 0.8 * cm  # 20% smaller
            canvas_obj.drawImage(
                icon_path,
                w - RIGHT_M - icon_size,
                y_rule - icon_size * 1.1 - 2,  # 10% lower
                width=icon_size,
                height=icon_size,
                preserveAspectRatio=True,
                mask='auto',
            )

        # Footer — anchor from bottom up so all three elements stay on-page
        y_note    = BOTTOM_M - 0.5 * cm   # bottom-most: the disclaimer note
        y_rule    = y_note + 10            # rule sits above the note
        y_conf    = y_rule + 5
        canvas_obj.setFont('Times-Roman', 8)
        canvas_obj.setFillColor(BLACK)
        note = 'Not to be circulated or reproduced without appropriate authorization'
        canvas_obj.drawCentredString(w / 2, y_note, note)
        canvas_obj.setStrokeColor(BLACK)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.line(LEFT_M, y_rule, w - RIGHT_M, y_rule)
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawRightString(w - RIGHT_M, y_conf, 'CONFIDENTIAL DOCUMENT')

        canvas_obj.restoreState()


# ---------------------------------------------------------------------------
# Helper flowables
# ---------------------------------------------------------------------------
def section_heading(text, styles):
    return Paragraph(text.upper(), styles['heading'])


def h_rule(color=GREY_DIVIDER, thickness=0.5):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)


def green_table(header_text, rows, styles):
    """Olive-green header table as seen in Proposed To/By and Pricing sections."""
    header_row = [Paragraph(f'<b>{header_text}</b>',
                             ParagraphStyle('gh', fontName=HN_BOLD, fontSize=13,
                                            textColor=WHITE))]
    data = [[header_row[0], '']]
    for label, value in rows:
        data.append([
            Paragraph(label, ParagraphStyle('gl', fontName=HN_BOLD, fontSize=10)),
            Paragraph(value, ParagraphStyle('gv', fontName='Times-Roman', fontSize=10)),
        ])

    col_w = (PAGE_W - LEFT_M - RIGHT_M)
    col1 = col_w * 0.32
    col2 = col_w * 0.68

    style = TableStyle([
        # Header row
        ('SPAN',        (0, 0), (1, 0)),
        ('BACKGROUND',  (0, 0), (1, 0), OLIVE_GREEN),
        ('TEXTCOLOR',   (0, 0), (1, 0), WHITE),
        ('TOPPADDING',  (0, 0), (1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (1, 0), 10),
        ('LEFTPADDING', (0, 0), (1, 0), 12),
        # Data rows
        ('BACKGROUND',  (0, 1), (-1, -1), colors.HexColor('#F8F8EF')),
        ('VALIGN',      (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING',  (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ('LEFTPADDING', (0, 1), (-1, -1), 12),
        ('LINEBELOW',   (0, 1), (-1, -2), 0.5, GREY_DIVIDER),
        ('LINEBEFORE',  (1, 1), (1, -1), 0.5, GREY_DIVIDER),
        ('BOX',         (0, 0), (-1, -1), 0.5, GREY_DIVIDER),
    ])
    return Table(data, colWidths=[col1, col2], style=style, hAlign='LEFT')


def blue_table_with_header(header_cols, rows, col_widths, styles):
    """Steel-blue header table — used for TOC and Topics Covered."""
    header = [Paragraph(f'<b>{h}</b>',
                        ParagraphStyle('bh', fontName=HN_BOLD, fontSize=10,
                                       textColor=WHITE, alignment=TA_CENTER if i > 0 else TA_LEFT))
              for i, h in enumerate(header_cols)]
    data = [header]
    for i, row in enumerate(rows):
        data.append([
            Paragraph(str(cell), ParagraphStyle(
                'br', fontName='Times-Roman', fontSize=10,
                alignment=TA_CENTER if j > 0 else TA_LEFT
            )) for j, cell in enumerate(row)
        ])

    ts = TableStyle([
        ('BACKGROUND',    (0, 0), (-1, 0), BLUE_STEEL),
        ('TEXTCOLOR',     (0, 0), (-1, 0), WHITE),
        ('TOPPADDING',    (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING',   (0, 0), (-1, -1), 12),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 12),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND',    (0, 1), (-1, -1), GREY_LIGHT),
        ('LINEBELOW',     (0, 1), (-1, -2), 0.5, GREY_DIVIDER),
        ('BOX',           (0, 0), (-1, -1), 0.5, GREY_DIVIDER),
    ])
    # Alternate row backgrounds
    for i in range(1, len(data)):
        if i % 2 == 0:
            ts.add('BACKGROUND', (0, i), (-1, i), WHITE)

    return Table(data, colWidths=col_widths, style=ts, hAlign='LEFT')


# ---------------------------------------------------------------------------
# Per-page builders
# ---------------------------------------------------------------------------
def build_cover(data, styles):
    """Page 1 — Cover."""
    story = []
    story.append(Spacer(1, 0.5 * cm))

    # Title
    story.append(Paragraph(data['workshop_title'], styles['cover_title']))
    story.append(Spacer(1, 0.3 * cm))

    # Logo left, version right — tops aligned in the same row
    col_w = PAGE_W - LEFT_M - RIGHT_M
    logo_path = os.path.abspath(LOGO_FULL_PATH)
    logo_cell = ''
    if os.path.exists(logo_path):
        img = Image(logo_path, width=7 * cm)
        img.drawHeight = 7 * cm * (img.imageHeight / img.imageWidth)
        logo_cell = img
    logo_ver_tbl = Table([[
        logo_cell,
        Paragraph(f'Version {data["version"]}',
                  ParagraphStyle('ver', fontName='Times-Roman', fontSize=10, alignment=TA_RIGHT)),
    ]], colWidths=[col_w * 0.7, col_w * 0.3])
    logo_ver_tbl.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
    story.append(logo_ver_tbl)
    return story


def build_summary(data, styles):
    """Page 2 — Summary."""
    story = []
    story.append(section_heading('Summary', styles))
    story.append(Spacer(1, 0.4 * cm))

    validity = f"{data.get('pricing', {}).get('validity_days', 30)} days from date of release"
    meta_rows = [
        ('Description',      data['workshop_title']),
        ('Classification',   'Confidential Document'),
        ('Current Version',  f'Version {data["version"]}'),
        ('Validity',         f'One month from date of release'),
    ]
    col_w = (PAGE_W - LEFT_M - RIGHT_M)
    meta_data = [[
        Paragraph(k, styles['meta_key']),
        Paragraph(':', styles['meta_key']),
        Paragraph(v, styles['meta_val']),
    ] for k, v in meta_rows]
    meta_tbl = Table(meta_data, colWidths=[col_w * 0.28, col_w * 0.04, col_w * 0.68])
    meta_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 0.8 * cm))

    # Proposed To
    address_lines = ', '.join(filter(None, [
        data.get('institution_department', ''),
        data.get('institution_address', ''),
        data.get('institution_city', ''),
        data.get('institution_state', ''),
        data.get('institution_pincode', ''),
    ]))
    story.append(green_table('PROPOSED TO', [
        ('Address of the\norganization', address_lines or 'Address of organization'),
        ('Training Course',              data.get('training_course_desc', data['workshop_title'])),
    ], styles))
    story.append(Spacer(1, 0.6 * cm))

    # Proposed By
    story.append(green_table('PROPOSED BY', [
        ('Name',     data.get('proposer_name', '')),
        ('Email ID', data.get('proposer_email', '')),
        ('Contact',  data.get('proposer_phone', '')),
        ('Website',  data.get('proposer_website', '')),
    ], styles))
    return story


def build_toc(data, styles):
    """Page 3 — Table of Contents."""
    story = []
    story.append(section_heading('Table of Contents', styles))
    story.append(Spacer(1, 0.4 * cm))

    toc_rows = [
        ('1', 'Summary',             '2'),
        ('2', 'About Tempestronics', '4'),
        ('3', 'Topics Covered',      '5'),
        ('4', data.get('hackathon_name', 'Hackathon') + ' Event', '6'),
        ('5', 'Requisites',          '7'),
        ('6', 'Goodies',             '7'),
        ('7', 'Purpose',             '8'),
        ('8', 'Pricing Details',     '9'),
        ('9', 'Other Workshops',     '10'),
    ]
    col_w = PAGE_W - LEFT_M - RIGHT_M
    story.append(blue_table_with_header(
        ['Section', 'Description', 'Page No.'],
        toc_rows,
        [col_w * 0.15, col_w * 0.70, col_w * 0.15],
        styles,
    ))
    return story


def build_about(styles):
    """Page 4 — About Tempestronics."""
    story = []
    story.append(section_heading('About Tempestronics', styles))
    story.append(Spacer(1, 0.5 * cm))

    paras = [
        ('', (
            'Tempestronics is a Bengaluru-based software consultancy founded in 2014 by Saifur '
            'Rahman Mohsin, a full-stack engineer with over a decade of production experience. '
            'With 50+ delivered projects for startups, agencies, and enterprise clients across '
            'India, the US, Australia, the UK, Singapore, and beyond, the company has built a '
            'track record of end-to-end product delivery — from architecture and API design '
            'through to cloud deployment and post-launch support.'
        )),
        ('Development', (
            'We build custom software for web (Vue/Nuxt, React, Laravel), native Android and '
            'iOS, and AI-powered platforms. Our work spans SaaS products, e-commerce systems, '
            'LangGraph-based conversational agents, voice apps for Alexa and Google Home, and '
            'cloud infrastructure on AWS. Projects are delivered end to end by a single engineer '
            '— architecture, implementation, deployment, and post-launch support — giving clients '
            'direct access and full continuity throughout.'
        )),
        ('Education & Training', (
            'The training arm of Tempestronics runs hands-on technical workshops for engineering '
            'students and IT professionals. Sessions are built around live demonstrations and '
            'real-world tooling rather than theory alone — the same approach used by our founder '
            'when speaking at Google DevFest, AWS Community Day, and Google\'s Web Community '
            'Leaders Summit. Workshops are available in Web Development, Android, iOS, '
            'Cross-Platform Mobile, Ethical Hacking, and Agentic AI Development.'
        )),
    ]
    for bold, text in paras:
        if bold:
            story.append(Spacer(1, 0.45 * cm))
            story.append(Paragraph(f'<font name="{HN_MEDIUM}">{bold}</font> — {text}', styles['body_about']))
        else:
            story.append(Paragraph(text, styles['body_about']))
    return story


def build_topics(data, styles):
    """Page 5 — Topics Covered."""
    story = []
    story.append(section_heading('Topics Covered', styles))
    story.append(Spacer(1, 0.4 * cm))

    col_w = PAGE_W - LEFT_M - RIGHT_M
    rows = [(str(i + 1), t['name'], t['duration']) for i, t in enumerate(data['topics'])]
    story.append(blue_table_with_header(
        ['S. No.', 'Topic', 'Time'],
        rows,
        [col_w * 0.12, col_w * 0.68, col_w * 0.20],
        styles,
    ))
    return story


def build_hackathon(data, styles):
    """Page 6 — Hackathon event description."""
    name = data.get('hackathon_name', 'Hackathon')
    story = []
    story.append(section_heading(name, styles))

    story.append(Paragraph(f'Introduction to {name}', styles['subheading']))
    story.append(Paragraph(data.get('hackathon_intro', (
        f'The {name} is a hands-on competitive event held at the end of the workshop. '
        f'Participants form teams and build a working project from scratch, starting with an '
        f'idea-forming round, moving through an architectural phase, and finishing with a live '
        f'demonstration and evaluation. This event gives students practical exposure to real-world '
        f'development workflows, teamwork, and problem-solving under time constraints.'
    )), styles['body']))

    story.append(Paragraph('Requirements', styles['subheading']))
    story.append(Paragraph(data.get('hackathon_requirements', (
        'At least one laptop for every 3–5 students. A working WiFi connection in the workshop '
        'room is strongly preferred. Students will be taught everything they need during the '
        'training session to participate effectively in the event.'
    )), styles['body']))
    return story


def build_requisites(data, styles):
    """Page 7 — Requisites + Goodies."""
    story = []
    story.append(section_heading('Requisites', styles))

    story.append(Paragraph('For conducting the workshop', styles['subheading']))
    for item in [
        'A hall that may accommodate all the students with a stage.',
        'Projector and screen that can be connected to by a laptop.',
        'A minimum of 100 students.',
        'Wireless Microphone (At least 1)',
        'Students may bring their laptops along if they wish to try out the techniques taught in the workshop. (Power supply for these laptops must be provided)',
        'Notepads and pens to take notes throughout the workshop.',
        'Unrestricted LAN / WiFi connection for the instructor laptop.',
        'Student volunteers (Up to 2 would suffice)',
    ]:
        story.append(Paragraph(item, styles['bullet'], bulletText='•'))

    story.append(Paragraph(f'For conducting the {data.get("hackathon_name", "hackathon")}', styles['subheading']))
    story.append(Paragraph(
        f'The {data.get("hackathon_name", "hackathon")} event may or may not be available '
        'depending on the requirements being met.', styles['body']))
    for item in [
        'At least one laptop for every 3 or 5 students (Teams would be formed).',
        'In case of laptops, a working WiFi connection in the room where workshop is to be conducted would be preferred.',
    ]:
        story.append(Paragraph(item, styles['bullet'], bulletText='•'))

    story.append(Paragraph('For students who attend the workshop', styles['subheading']))
    for item in data.get('student_prerequisites', [
        'They must have some basic programming knowledge.',
        'They must be comfortable with making applications.',
    ]):
        story.append(Paragraph(item, styles['bullet'], bulletText='•'))

    story.append(Spacer(1, 0.6 * cm))
    story.append(section_heading('Goodies', styles))
    story.append(Paragraph(
        'In addition to the certificates that we provide, we also provide the following to take back:',
        styles['body']))
    for item in [
        'Links and references for further study.',
        'Occasionally, we provide prizes to students who answer questions, interact well or get the highest score in the hackathon event.',
    ]:
        story.append(Paragraph(item, styles['bullet'], bulletText='•'))
    return story


def build_purpose(data, styles):
    """Page 8 — Purpose."""
    story = []
    story.append(section_heading('Purpose', styles))
    story.append(Spacer(1, 0.4 * cm))
    for para in data.get('purpose_paragraphs', [
        ('', (
            'We at Tempestronics consider it essential to educate students on not only the theory '
            'and academic side of technical subjects but also give real life experience by '
            'demonstrating and teaching the students to build on their own designs and ideas. '
            'Our workshops are designed to bridge the gap between academic learning and industry '
            'practice, giving participants hands-on experience with tools and techniques that are '
            'used in the real world every day.'
        )),
        ('', (
            'With such great demand for skilled professionals in the technology sector, it is '
            'vital that students and working professionals continuously upskill themselves. '
            'Our hands-on training programmes provide practical exposure that goes well beyond '
            'what is typically covered in standard academic curricula.'
        )),
        ('', (
            'We at Tempestronics consider it essential to educate students on not only the '
            'theory and academic side of this platform but also give real life experience by '
            'demonstrating and teaching the students to build on their own designs and ideas '
            'and weave it into a useable application that can be used by a lot of people.'
        )),
    ]):
        bold, text = para
        if bold:
            story.append(Paragraph(f'<b>{bold}</b> — {text}', styles['body']))
        else:
            story.append(Paragraph(text, styles['body_indent']))
    return story


def build_pricing(data, styles):
    """Page 9 — Pricing Details."""
    story = []
    story.append(section_heading('Pricing Details', styles))
    story.append(Spacer(1, 0.4 * cm))

    pricing = data.get('pricing', {})
    student_price = pricing.get('student', 500)
    professional_price = pricing.get('professional', 1000)
    min_students = pricing.get('minimum_students', 100)

    # Pricing table with olive-green header
    header = [
        Paragraph('<b>Specification</b>', ParagraphStyle('ph', fontName=HN_BOLD, fontSize=11,
                                                          textColor=WHITE, alignment=TA_CENTER)),
        Paragraph('<b>Per Participant Cost</b>', ParagraphStyle('ph2', fontName=HN_BOLD, fontSize=11,
                                                                 textColor=WHITE, alignment=TA_CENTER)),
    ]
    price_data = [
        header,
        [
            Paragraph('Student', styles['pricing_spec']),
            Paragraph(f'₹ {student_price:,}', styles['pricing_val']),
        ],
        [
            Paragraph('Professional', styles['pricing_spec']),
            Paragraph(f'₹ {professional_price:,}', styles['pricing_val']),
        ],
    ]
    col_w = PAGE_W - LEFT_M - RIGHT_M
    price_tbl = Table(price_data, colWidths=[col_w * 0.45, col_w * 0.55])
    price_tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, 0), OLIVE_GREEN),
        ('BACKGROUND',    (0, 1), (-1, -1), colors.HexColor('#F8F8EF')),
        ('TOPPADDING',    (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW',     (0, 1), (-1, 1), 0.5, GREY_DIVIDER),
        ('LINEBEFORE',    (1, 1), (1, -1), 0.5, GREY_DIVIDER),
        ('BOX',           (0, 0), (-1, -1), 0.5, GREY_DIVIDER),
    ]))
    story.append(price_tbl)
    story.append(Spacer(1, 0.8 * cm))

    story.append(Paragraph(
        f'A guaranteed minimum of at least <b>{min_students} students</b> is necessary for '
        'workshop. On confirmation, an online form will be setup for registrations and the link '
        'will be shared along with an access code. This helps us to prepare the certificates as '
        'well as provide access to our resources.', styles['body']))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        'Each participant is entitled with an <b>authorised Tempestronics certificate</b> and '
        'also gains <b>access to the online resources</b>.', styles['body']))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Paragraph(
        '<b>Goodies</b> will be provided to prize winners based on the availability.', styles['body']))
    return story


def build_other_workshops(all_workshops, current_slug, styles):
    """Page 10 — Other Workshops (auto-generated from services.yml data)."""
    story = []
    story.append(section_heading('Other Workshops', styles))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        'We offer several workshops under our education sector. For now we offer:',
        styles['body']))
    story.append(Spacer(1, 0.4 * cm))

    col_w = PAGE_W - LEFT_M - RIGHT_M
    # Technical workshops header
    tech_header = Table([[
        Paragraph('TECHNICAL', ParagraphStyle(
            'wh', fontName=HN_BOLD, fontSize=12,
            textColor=WHITE, alignment=TA_CENTER))
    ]], colWidths=[col_w])
    tech_header.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), BLUE_STEEL),
        ('TOPPADDING',    (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tech_header)
    story.append(Spacer(1, 0.3 * cm))

    for ws in all_workshops:
        if ws['slug'] != current_slug:
            story.append(Paragraph(ws['title'], styles['other_item'], bulletText='•'))

    story.append(Spacer(1, 0.5 * cm))
    # Non-technical placeholder
    non_tech_header = Table([[
        Paragraph('NON - TECHNICAL', ParagraphStyle(
            'wh2', fontName=HN_BOLD, fontSize=12,
            textColor=WHITE, alignment=TA_CENTER))
    ]], colWidths=[col_w])
    non_tech_header.setStyle(TableStyle([
        ('BACKGROUND',    (0, 0), (-1, -1), BLUE_STEEL),
        ('TOPPADDING',    (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(non_tech_header)
    story.append(Spacer(1, 0.3 * cm))
    for item in ['Beat Boxing', 'Rubik\'s Cube Solving']:
        story.append(Paragraph(item, styles['other_item'], bulletText='•'))

    return story


# ---------------------------------------------------------------------------
# Main generator
# ---------------------------------------------------------------------------
def generate(data: dict, output_path: str, password: str):
    tmp_path = output_path + '.tmp.pdf'

    # Per-page header/footer callbacks
    page_callbacks = {
        1:  HeaderFooter(is_cover=True, cover_college=data.get('institution_name', '')),
        2:  HeaderFooter(page_label='Page 2'),
        3:  HeaderFooter(page_label='Page 3'),
        4:  HeaderFooter(page_label='Page 4'),
        5:  HeaderFooter(page_label='Page 5'),
        6:  HeaderFooter(page_label='Page 6'),
        7:  HeaderFooter(page_label='Page 7'),
        8:  HeaderFooter(page_label='Page 8'),
        9:  HeaderFooter(page_label='Page 9'),
        10: HeaderFooter(page_label='Page 10'),
    }

    current_page = [1]

    def on_page(canvas_obj, doc):
        cb = page_callbacks.get(current_page[0], HeaderFooter(page_label=f'Page {current_page[0]}'))
        cb(canvas_obj, doc)
        current_page[0] += 1

    doc = SimpleDocTemplate(
        tmp_path,
        pagesize=A4,
        leftMargin=LEFT_M,
        rightMargin=RIGHT_M,
        topMargin=TOP_M + 3.2 * 0.8 * 1.1 * cm,  # flush with logo bottom
        bottomMargin=BOTTOM_M + 0.6 * cm,
        title=data['workshop_title'],
        author='Tempestronics',
        subject='Workshop Brochure — Confidential',
    )

    styles = make_styles()
    all_workshops = data.get('all_workshops', [])

    story = []

    # Page 1 — Cover
    story += build_cover(data, styles)
    story.append(PageBreak())

    # Page 2 — Summary
    story += build_summary(data, styles)
    story.append(PageBreak())

    # Page 3 — TOC
    story += build_toc(data, styles)
    story.append(PageBreak())

    # Page 4 — About
    story += build_about(styles)
    story.append(PageBreak())

    # Page 5 — Topics
    story += build_topics(data, styles)
    story.append(PageBreak())

    # Page 6 — Hackathon
    story += build_hackathon(data, styles)
    story.append(PageBreak())

    # Page 7 — Requisites + Goodies
    story += build_requisites(data, styles)
    story.append(PageBreak())

    # Page 8 — Purpose
    story += build_purpose(data, styles)
    story.append(PageBreak())

    # Page 9 — Pricing
    story += build_pricing(data, styles)
    story.append(PageBreak())

    # Page 10 — Other Workshops
    story += build_other_workshops(all_workshops, data.get('workshop_slug', ''), styles)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

    with pikepdf.open(tmp_path) as pdf:
        if password:
            pdf.save(
                output_path,
                encryption=pikepdf.Encryption(
                    owner=password + '_owner',
                    user=password,
                    R=6,
                    allow=pikepdf.Permissions(
                        print_highres=False,
                        print_lowres=False,
                        extract=False,
                        modify_annotation=False,
                        modify_form=False,
                        modify_other=False,
                        modify_assembly=False,
                    ),
                ),
            )
        else:
            pdf.save(output_path)
    os.remove(tmp_path)
    print(f'Generated: {output_path}', file=sys.stderr)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 generate_brochure.py <output_path>', file=sys.stderr)
        sys.exit(1)

    output_path = sys.argv[1]
    raw = sys.stdin.read()
    data = json.loads(raw)
    password = data.get('password', f'tempestronics{date.today().year}')
    generate(data, output_path, password)
    print(output_path)
