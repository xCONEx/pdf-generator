
import jsPDF from 'jspdf';
import { BudgetData, COLOR_THEMES } from '@/types/budget';
import { generateSecurePDF } from './secureGenerator';

export const generatePDF = async (budgetData: BudgetData) => {
  try {
    if (!budgetData.companyInfo.name || !budgetData.clientInfo.name) {
      throw new Error('Dados da empresa e cliente são obrigatórios');
    }

    // Tentar gerar PDF seguro primeiro
    try {
      const securePdfBlob = await generateSecurePDF(budgetData);
      const url = URL.createObjectURL(securePdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    } catch (secureError) {
      console.log('Geração segura falhou, usando método padrão:', secureError);
    }

    // Método padrão simples
    const pdf = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    let yPosition = 20;

    // Usar a cor do tema selecionado
    const selectedTheme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [41, 128, 185];
    };
    
    const primaryColor = hexToRgb(selectedTheme.primary);
    
    // Cabeçalho
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO', margin, 20);

    // Dados da Empresa
    yPosition = 45;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DADOS DA EMPRESA', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Empresa: ${budgetData.companyInfo.name}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.companyInfo.email}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin, yPosition);
    yPosition += 6;
    if (budgetData.companyInfo.address) {
      pdf.text(`Endereço: ${budgetData.companyInfo.address}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Dados do Cliente
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DADOS DO CLIENTE', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Cliente: ${budgetData.clientInfo.name}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.clientInfo.email}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin, yPosition);
    yPosition += 6;
    if (budgetData.clientInfo.address) {
      pdf.text(`Endereço: ${budgetData.clientInfo.address}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Itens
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITENS DO ORÇAMENTO', margin, yPosition);
    yPosition += 10;

    // Cabeçalho da tabela
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIÇÃO', margin, yPosition);
    pdf.text('QTD', margin + 110, yPosition);
    pdf.text('PREÇO UNIT.', margin + 130, yPosition);
    pdf.text('TOTAL', margin + 165, yPosition);
    yPosition += 8;

    // Itens
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const description = item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description;
      pdf.text(description, margin, yPosition);
      pdf.text(item.quantity.toString(), margin + 115, yPosition);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 132, yPosition);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 167, yPosition);
      
      subtotal += item.total;
      yPosition += 6;
    });

    yPosition += 10;

    // Totais
    const discount = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - discount;

    pdf.setFont('helvetica', 'normal');
    pdf.text(`Subtotal: R$ ${subtotal.toFixed(2)}`, margin + 120, yPosition);
    yPosition += 8;

    if (budgetData.discount > 0) {
      pdf.text(`Desconto ${budgetData.discount}%: -R$ ${discount.toFixed(2)}`, margin + 120, yPosition);
      yPosition += 8;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`TOTAL: R$ ${total.toFixed(2)}`, margin + 120, yPosition);
    yPosition += 15;

    // Condições
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONDIÇÕES ESPECIAIS', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (budgetData.specialConditions) {
      const conditions = pdf.splitTextToSize(budgetData.specialConditions, pageWidth - 2 * margin);
      pdf.text(conditions, margin, yPosition);
      yPosition += conditions.length * 5;
    }
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (budgetData.observations) {
      const observations = pdf.splitTextToSize(budgetData.observations, pageWidth - 2 * margin);
      pdf.text(observations, margin, yPosition);
      yPosition += observations.length * 5;
    }
    yPosition += 10;

    pdf.text(`Validade: ${budgetData.validityDays || 30} dias`, margin, yPosition);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
