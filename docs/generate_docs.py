import html
import re
import shutil
import subprocess
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "TDD_CompanyA.md"
HTML_PATH = ROOT / "docs" / "TDD_CompanyA.html"
DOCX_PATH = ROOT / "docs" / "TDD_CompanyA.docx"
PDF_PATH = ROOT / "docs" / "TDD_CompanyA.pdf"


def parse_markdown(markdown):
    lines = markdown.splitlines()
    blocks = []
    index = 0

    while index < len(lines):
        line = lines[index].strip()
        if not line:
            index += 1
            continue

        if line.startswith("```"):
            index += 1
            code_lines = []
            while index < len(lines) and not lines[index].strip().startswith("```"):
                code_lines.append(lines[index])
                index += 1
            blocks.append(("code", "\n".join(code_lines)))
            index += 1
            continue

        heading = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading:
            blocks.append(("heading", (len(heading.group(1)), heading.group(2))))
            index += 1
            continue

        if line.startswith("|"):
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                row = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in row):
                    rows.append(row)
                index += 1
            blocks.append(("table", rows))
            continue

        list_item = re.match(r"^(?:[-*]\s+|\d+\.\s+)(.+)$", line)
        if list_item:
            ordered = bool(re.match(r"^\d+\.\s+", line))
            items = [list_item.group(1)]
            index += 1
            while index < len(lines):
                following = lines[index].strip()
                next_item = re.match(r"^(?:[-*]\s+|\d+\.\s+)(.+)$", following)
                if not next_item or bool(re.match(r"^\d+\.\s+", following)) != ordered:
                    break
                items.append(next_item.group(1))
                index += 1
            blocks.append(("list", (ordered, items)))
            continue

        paragraph = [line]
        index += 1
        while index < len(lines):
            following = lines[index].strip()
            if (
                not following
                or following.startswith(("```", "|"))
                or re.match(r"^(#{1,6})\s+", following)
                or re.match(r"^(?:[-*]\s+|\d+\.\s+)", following)
            ):
                break
            paragraph.append(following)
            index += 1
        blocks.append(("paragraph", " ".join(paragraph)))

    return blocks


def html_inline(text):
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    return re.sub(r"`(.+?)`", r"<code>\1</code>", text)


def render_html(blocks):
    content = []
    for kind, value in blocks:
        if kind == "heading":
            level, text = value
            content.append(f"<h{level}>{html_inline(text)}</h{level}>")
        elif kind == "paragraph":
            content.append(f"<p>{html_inline(value)}</p>")
        elif kind == "list":
            ordered, items = value
            tag = "ol" if ordered else "ul"
            list_items = "".join(f"<li>{html_inline(text)}</li>" for text in items)
            content.append(f"<{tag}>{list_items}</{tag}>")
        elif kind == "code":
            content.append(f"<pre><code>{html.escape(value)}</code></pre>")
        elif kind == "table":
            rows = value
            if rows:
                header = "".join(f"<th>{html_inline(cell)}</th>" for cell in rows[0])
                body = "".join(
                    "<tr>" + "".join(f"<td>{html_inline(cell)}</td>" for cell in row) + "</tr>"
                    for row in rows[1:]
                )
                content.append(f"<table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table>")

    return """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Technical Design Document - Company A</title>
<style>
@page { size: A4; margin: 18mm 16mm; }
body { color: #24202b; font: 10.5pt/1.5 Arial, sans-serif; }
h1, h2, h3 { color: #24152f; font-family: Georgia, serif; }
h1 { border-bottom: 2px solid #d99025; padding-bottom: 5px; font-size: 22pt; }
h2 { margin-top: 20px; font-size: 16pt; }
h3 { margin-top: 15px; font-size: 12pt; }
p { margin: 7px 0; }
ul, ol { padding-left: 22px; }
li { margin: 4px 0; }
table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; }
th { background: #271a35; color: white; text-align: left; }
th, td { border: 1px solid #d6d0dc; padding: 6px; vertical-align: top; }
code, pre { background: #f3f0f5; font-family: Consolas, monospace; }
code { padding: 1px 3px; }
pre { padding: 9px; white-space: pre-wrap; }
</style>
</head>
<body>
""" + "\n".join(content) + """
</body>
</html>
"""


def add_docx_inline(paragraph, text):
    pattern = re.compile(r"(\*\*.+?\*\*|`.+?`)")
    for part in pattern.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            paragraph.add_run(part[2:-2]).bold = True
        elif part.startswith("`") and part.endswith("`"):
            run = paragraph.add_run(part[1:-1])
            run.font.name = "Consolas"
            run.font.size = Pt(9)
        else:
            paragraph.add_run(part)


def render_docx(blocks):
    document = Document()
    for section in document.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    normal = document.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10)

    for kind, value in blocks:
        if kind == "heading":
            level, text = value
            heading = document.add_heading("", level=min(level, 3))
            add_docx_inline(heading, text)
            for run in heading.runs:
                run.font.color.rgb = RGBColor(51, 30, 66)
        elif kind == "paragraph":
            paragraph = document.add_paragraph()
            add_docx_inline(paragraph, value)
        elif kind == "list":
            ordered, items = value
            style = "List Number" if ordered else "List Bullet"
            for text in items:
                paragraph = document.add_paragraph(style=style)
                add_docx_inline(paragraph, text)
        elif kind == "code":
            paragraph = document.add_paragraph()
            run = paragraph.add_run(value)
            run.font.name = "Consolas"
            run.font.size = Pt(9)
        elif kind == "table" and value:
            table = document.add_table(rows=1, cols=len(value[0]))
            table.style = "Table Grid"
            for row_index, cells in enumerate(value):
                row = table.rows[0] if row_index == 0 else table.add_row()
                for cell, text in zip(row.cells, cells):
                    cell.text = text
                    if row_index == 0:
                        shading = OxmlElement("w:shd")
                        shading.set(qn("w:fill"), "271A35")
                        cell._tc.get_or_add_tcPr().append(shading)
                        for run in cell.paragraphs[0].runs:
                            run.bold = True
                            run.font.color.rgb = RGBColor(255, 255, 255)
            document.add_paragraph()

    document.save(DOCX_PATH)


def main():
    blocks = parse_markdown(SOURCE.read_text(encoding="utf-8"))
    HTML_PATH.write_text(render_html(blocks), encoding="utf-8")
    render_docx(blocks)
    subprocess.run(
        [
            "google-chrome",
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--print-to-pdf-no-header",
            f"--print-to-pdf={PDF_PATH}",
            HTML_PATH.resolve().as_uri(),
        ],
        check=True,
    )
    shutil.copy2(DOCX_PATH, ROOT / DOCX_PATH.name)
    shutil.copy2(PDF_PATH, ROOT / PDF_PATH.name)
    print(f"Generated {PDF_PATH} and {DOCX_PATH}")


if __name__ == "__main__":
    main()
