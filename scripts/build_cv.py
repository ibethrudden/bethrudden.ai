"""Build the downloadable full CV from the public web CV.

Requires reportlab and lxml. Run from any directory; output stays at the site root.
"""
from pathlib import Path
from html import escape
from lxml import html
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak, KeepTogether

ROOT=Path(__file__).resolve().parents[1]
doc=html.fromstring((ROOT/'cv.html').read_text())
main=doc.xpath('//div[@class="main"]')[0]
sections={}
for node in main:
    if not isinstance(node.tag,str): continue
    if node.get('class')=='section-title':
        heading=' '.join(node.itertext()).strip()
        sections[heading]=[]
    else:
        sections[heading].append(node)

styles={
    'name':ParagraphStyle('Name',fontName='Helvetica-Bold',fontSize=25,leading=28,spaceAfter=6),
    'deck':ParagraphStyle('Deck',fontName='Helvetica',fontSize=10.5,leading=14,spaceAfter=4),
    'contact':ParagraphStyle('Contact',fontName='Helvetica',fontSize=9,leading=12,textColor=colors.HexColor('#555555'),spaceAfter=13),
    'heading':ParagraphStyle('Heading',fontName='Helvetica-Bold',fontSize=11.3,leading=14,spaceBefore=8,spaceAfter=4,keepWithNext=True),
    'body':ParagraphStyle('Body',fontName='Helvetica',fontSize=10.2,leading=13.5,spaceAfter=5),
    'bullet':ParagraphStyle('Bullet',fontName='Helvetica',fontSize=10.2,leading=13.5,spaceAfter=6,leftIndent=12,firstLineIndent=0,bulletIndent=0),
    'compact':ParagraphStyle('Compact',fontName='Helvetica',fontSize=10,leading=12.5,spaceAfter=3),
}

def clean(s):
    return s.translate(str.maketrans({'\u2013':'-','\u2014':' - ','\u2011':'-','\u2019':"'",'\u2018':"'",'\u201c':'"','\u201d':'"','\u00a0':' '}))

def inline(node):
    out=escape(clean(node.text or ''))
    for c in node:
        if not isinstance(c.tag,str): continue
        body=inline(c)
        if c.tag in ['strong','b']: out+='<b>'+body+'</b>'
        elif c.tag in ['em','i']: out+='<i>'+body+'</i>'
        elif c.tag=='a': out+='<a href="'+escape(c.get('href',''),quote=True)+'" color="#234E70">'+body+'</a>'
        elif c.tag=='br': out+='<br/>'
        else: out+=body
        out+=escape(clean(c.tail or ''))
    return out.strip()

def add_section(story,name):
    story.append(Paragraph(escape(name),styles['heading']))
    for node in sections[name]:
        cls=node.get('class','')
        if node.tag=='ul':
            for item in node:
                story.append(Paragraph(inline(item),styles['bullet'],bulletText='•'))
        elif cls=='featured-moment':
            fields=[inline(x) for x in node if isinstance(x.tag,str)]
            story.append(Paragraph(' | '.join(fields),styles['compact']))
        elif cls=='patent-group':
            for child in node:
                if isinstance(child.tag,str): story.append(Paragraph(inline(child),styles['compact']))
        else:
            para=Paragraph(inline(node),styles['body' if name in ['Executive Profile','Professional Experience'] else 'compact'])
            if name=='Professional Experience' and len(node.xpath('./strong')) and len(' '.join(node.itertext()).split())<16: para.keepWithNext=True
            story.append(para)

groups=[
 ['Executive Profile','The work in five outcomes','Professional Experience'],
 ['Board & Advisory','Patents, Publications & Open Technical Assets','Education & Credentials','IBM Appointments','Professional Certifications','Books'],
 ['Writing & Expert Contributions','Selected Podcasts & Interviews'],
 ['Awards & Recognition','Policy & Public Accountability','Selected Keynotes & Public Leadership','Upcoming Speaking']
]
assert set(sum(groups,[]))==set(sections),(set(sections)-set(sum(groups,[])))
story=[Paragraph('Beth Rudden',styles['name']),Paragraph('Business and technology executive<br/>Founder and CEO, Bast AI | IBM Distinguished Engineer | Board trustee',styles['deck']),Paragraph('Denver, Colorado | <a href="https://bethrudden.ai">bethrudden.ai</a> | <a href="mailto:beth@bast.ai">beth@bast.ai</a> | <a href="https://linkedin.com/in/brudden">LinkedIn</a>',styles['contact'])]
for i,group in enumerate(groups):
    if i: story.append(PageBreak())
    for name in group: add_section(story,name)

def footer(c,d):
    c.saveState(); c.setFont('Helvetica',8); c.setFillColor(colors.HexColor('#666666'))
    c.drawString(43,25,'Beth Rudden | Full CV')
    c.drawRightString(569,25,str(d.page))
    if d.page>1:
        c.setFont('Helvetica',8.5);c.drawString(43,766,'Beth Rudden | Business and technology leadership')
    c.restoreState()

target=ROOT/'Beth-Rudden-CV.pdf'
SimpleDocTemplate(str(target),pagesize=LETTER,leftMargin=43,rightMargin=43,topMargin=42,bottomMargin=42,title='Beth Rudden Full CV',author='Beth Rudden',subject='Business leadership, teams, and systems that help people').build(story,onFirstPage=footer,onLaterPages=footer)
print(target)
