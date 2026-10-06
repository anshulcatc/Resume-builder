import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../types/resume';

export async function exportResumeToDocx(resume: ResumeData): Promise<void> {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
    insideVertical: { style: BorderStyle.SINGLE, size: 6, color: '222222' },
  };

  const sectionsContent: (Paragraph | Table)[] = [];

  // Top Candidate Name & Degree
  sectionsContent.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: resume.header.fullName,
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
        new TextRun({
          text: ` | ${resume.header.cohortOrDegree}`,
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    })
  );

  // Process all visible sections
  for (const section of resume.sections) {
    if (!section.visible) continue;

    const rows: TableRow[] = [];

    // 1. Section Header Row
    const headerTitleRuns: TextRun[] = [
      new TextRun({
        text: section.title.toUpperCase(),
        bold: true,
        size: 19, // ~9.5pt
        font: 'Times New Roman',
      }),
    ];

    if (section.badgeText) {
      headerTitleRuns.push(
        new TextRun({
          text: `                                                                                          ${section.badgeText}`,
          bold: true,
          size: 19,
          font: 'Times New Roman',
        })
      );
    }

    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: section.type === 'education' ? 4 : 3,
            shading: {
              fill: 'EEEEEE',
              type: ShadingType.CLEAR,
            },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: headerTitleRuns,
              }),
            ],
          }),
        ],
      })
    );

    // 2. Section Entries
    if (section.type === 'education') {
      const eduWidths = section.educationColWidths || resume.settings.educationColWidths || [12, 60, 14, 14];
      // 4-column layout
      for (const entry of section.entries) {
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: eduWidths[0], type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.degree || '',
                        bold: true,
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: eduWidths[1], type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.institution || '',
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: eduWidths[2], type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: entry.score || '',
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: eduWidths[3], type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: entry.dateOrYear || '',
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }
    } else if (section.type === 'internships') {
      const leftRatio = section.columnRatioPercent || resume.settings.leftColWidth || 14;
      const rightRatio = 100 - leftRatio;

      for (const entry of section.entries) {
        // Internship full-width header row: Organization (left) | Role (center) | Duration (right)
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnSpan: 2,
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.organization || '',
                        bold: true,
                        size: 19,
                        font: 'Times New Roman',
                      }),
                      new TextRun({
                        text: `\t\t${entry.roleOrTitle || ''}\t\t`,
                        bold: true,
                        size: 19,
                        font: 'Times New Roman',
                      }),
                      new TextRun({
                        text: entry.dateOrYear || '',
                        bold: true,
                        size: 19,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );

        // Subtitle & Bullets row: Left (14%), Right (86%)
        const bulletParagraphs = entry.bullets.map((b) =>
          new Paragraph({
            spacing: { before: 20, after: 20 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: b.text,
                size: 18,
                font: 'Times New Roman',
              }),
            ],
          })
        );

        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: leftRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: entry.subtitle || 'Roles and\nResponsibilities',
                        size: 17,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: rightRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: bulletParagraphs.length > 0 ? bulletParagraphs : [new Paragraph('')],
              }),
            ],
          })
        );
      }
    } else if (section.type === 'other_interests') {
      const leftRatio = section.columnRatioPercent || resume.settings.leftColWidth || 14;
      const rightRatio = 100 - leftRatio;
      for (const entry of section.entries) {
        const text = (entry.inlineItems || []).map((i) => `●  ${i}`).join('        ');
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: leftRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.category || 'Hobbies',
                        bold: true,
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: rightRatio, type: WidthType.PERCENTAGE },
                columnSpan: 2,
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text,
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }
    } else {
      // General Sections: Category (left), Bullets (middle), Year (right)
      const leftRatio = section.columnRatioPercent || resume.settings.leftColWidth || 15;
      const dateRatio = section.dateColWidthPercent || resume.settings.dateColWidth || 12;
      const bulletsRatio = 100 - leftRatio - dateRatio;
      for (const entry of section.entries) {
        const bulletParagraphs = entry.bullets.map((b) =>
          new Paragraph({
            spacing: { before: 20, after: 20 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: b.text,
                size: 18,
                font: 'Times New Roman',
              }),
            ],
          })
        );

        rows.push(
          new TableRow({
            children: [
              new TableCell({
                width: { size: leftRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.category || entry.organization || '',
                        bold: true,
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: bulletsRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: bulletParagraphs.length > 0 ? bulletParagraphs : [new Paragraph('')],
              }),
              new TableCell({
                width: { size: dateRatio, type: WidthType.PERCENTAGE },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: entry.dateOrYear || '',
                        size: 18,
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }
    }

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorder,
      rows,
    });

    sectionsContent.push(table);

    // Spacing between tables
    sectionsContent.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [],
      })
    );
  }

  // Footer Contact Bar
  const footerContactText = `Address: ${resume.header.address}     Contact: ${resume.header.phone}     E-mail: ${resume.header.email}`;
  const footerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: footerContactText,
                    size: 16,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  sectionsContent.push(footerTable);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.4),
              bottom: convertInchesToTwip(0.4),
              left: convertInchesToTwip(0.45),
              right: convertInchesToTwip(0.45),
            },
          },
        },
        children: sectionsContent,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = resume.header.fullName.replace(/\s+/g, '_') || 'Resume';
  saveAs(blob, `${cleanName}_CV.docx`);
}
