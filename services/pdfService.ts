import { jsPDF } from "jspdf";
import { Niche } from "../types";

export const generatePDF = (title: string, niches: Niche[]) => {
  const doc = new jsPDF();
  const marginLeft = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - (marginLeft * 2); // Margem esquerda e direita de 20mm
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;

  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, fontSize: number, color: [number, number, number], indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const availableWidth = maxLineWidth - indent;
    const lines = doc.splitTextToSize(text, availableWidth);
    doc.text(lines, x + indent, y);
    
    return lines.length * (fontSize * 0.5); // Retorna a altura ocupada (aprox)
  };

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  const titleLines = doc.splitTextToSize(`Relatório NicheScope: ${title}`, maxLineWidth);
  doc.text(titleLines, marginLeft, yPos);
  yPos += (titleLines.length * 8) + 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft, yPos);
  yPos += 15;

  // Loop through niches
  niches.forEach((niche, index) => {
    // Estimate block height roughly to preempt page break
    checkPageBreak(80);

    // Niche Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204); // Blue
    const headerText = `${index + 1}. ${niche.name}`;
    const headerHeight = addWrappedText(headerText, marginLeft, yPos, 14, [0, 102, 204]);
    yPos += headerHeight + 4;

    // Description
    doc.setFont("helvetica", "normal");
    const descHeight = addWrappedText(niche.description, marginLeft, yPos, 11, [60, 60, 60]);
    yPos += descHeight + 6;

    // Scores Line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Demanda: ${niche.demandScore}%  |  Oferta: ${niche.supplyScore}%  |  Oportunidade: ${niche.opportunityScore}%`, marginLeft, yPos);
    yPos += 8;

    // Analysis Details
    doc.setFont("helvetica", "normal");
    const qualityText = `• Qualidade Oferta: ${niche.supplyInsights?.qualityAssessment || 'N/A'}`;
    const qHeight = addWrappedText(qualityText, marginLeft, yPos, 9, [80, 80, 80], 5);
    yPos += qHeight + 2;

    const compText = `• Concorrência: ${niche.supplyInsights?.competitorCount || 'N/A'}`;
    const cHeight = addWrappedText(compText, marginLeft, yPos, 9, [80, 80, 80], 5);
    yPos += cHeight + 2;

    const diffText = `• Dificuldade: ${niche.supplyInsights?.entryDifficulty || 'N/A'}`;
    const dHeight = addWrappedText(diffText, marginLeft, yPos, 9, [80, 80, 80], 5);
    yPos += dHeight + 6;

    // Keywords
    doc.setFont("helvetica", "italic");
    const topKeywords = niche.keywords.slice(0, 5).map(k => k.term).join(", ");
    const kwText = `Top Keywords: ${topKeywords}`;
    const kwHeight = addWrappedText(kwText, marginLeft, yPos, 9, [100, 100, 100]);
    yPos += kwHeight + 8;

    // Products (Missing Products)
    if (niche.products && niche.products.length > 0) {
      checkPageBreak(30); // Ensure header doesn't get orphaned
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(147, 51, 234); // Purple-ish
      doc.text("Produtos em Falta (Oportunidades):", marginLeft, yPos);
      yPos += 6;

      niche.products.forEach((prod) => {
        checkPageBreak(20);
        
        // Product Title
        doc.setFont("helvetica", "bold");
        const prodTitle = `• [${prod.type}] ${prod.title}`;
        const ptHeight = addWrappedText(prodTitle, marginLeft, yPos, 9, [60, 60, 60], 5);
        yPos += ptHeight + 2;

        // Product Description
        doc.setFont("helvetica", "normal");
        const pdHeight = addWrappedText(prod.description, marginLeft, yPos, 9, [100, 100, 100], 10);
        yPos += pdHeight + 4;
      });
      yPos += 4;
    }
    
    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, yPos - 2, marginLeft + maxLineWidth, yPos - 2);
    yPos += 8;
  });

  doc.save(`NicheScope_Relatorio_${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};