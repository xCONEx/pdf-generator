
import jsPDF from 'jspdf';
import { BudgetData } from '@/types/budget';

export const generatePDF = async (budgetData: BudgetData) => {
  const pdf = new jsPDF();
  
  // Configurações básicas
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 30;

  // Função para verificar quebra de página
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - 20) {
      pdf.addPage();
      yPosition = 30;
      addHeader();
      return true;
    }
    return false;
  };

  // Cabeçalho
  const addHeader = () => {
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO', margin, 18);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.text(`Data: ${currentDate}`, pageWidth - margin - 40, 12);
    pdf.text(`Nº: ${budgetNumber}`, pageWidth - margin - 40, 18);
  };

  // Função para adicionar seção
  const addSection = (title: string, yPos: number) => {
    pdf.setFillColor(240, 248, 255);
    pdf.rect(margin, yPos - 5, contentWidth, 12, 'F');
    
    pdf.setTextColor(59, 130, 246);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 2, yPos + 3);
    
    pdf.setTextColor(0, 0, 0);
  };

  // Inicializar primeira página
  addHeader();
  yPosition = 40;

  // Dados da empresa
  checkPageBreak(25);
  addSection('DADOS DA EMPRESA', yPosition);
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const companyData = [
    `Empresa: ${budgetData.companyInfo.name}`,
    `Email: ${budgetData.companyInfo.email}`,
    `Telefone: ${budgetData.companyInfo.phone}`,
    `Endereço: ${budgetData.companyInfo.address}`
  ];

  companyData.forEach(line => {
    checkPageBreak(6);
    pdf.text(line, margin + 2, yPosition);
    yPosition += 5;
  });
  yPosition += 10;

  // Dados do cliente
  checkPageBreak(25);
  addSection('DADOS DO CLIENTE', yPosition);
  yPosition += 15;

  const clientData = [
    `Cliente: ${budgetData.clientInfo.name}`,
    `Email: ${budgetData.clientInfo.email}`,
    `Telefone: ${budgetData.clientInfo.phone}`,
    `Endereço: ${budgetData.clientInfo.address}`
  ];

  clientData.forEach(line => {
    checkPageBreak(6);
    pdf.text(line, margin + 2, yPosition);
    yPosition += 5;
  });
  yPosition += 15;

  // Itens
  checkPageBreak(30);
  addSection('ITENS DO ORÇAMENTO', yPosition);
  yPosition += 15;

  // Cabeçalho da tabela
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  pdf.text('DESCRIÇÃO', margin + 2, yPosition);
  pdf.text('QTD', margin + 90, yPosition);
  pdf.text('PREÇO UNIT.', margin + 115, yPosition);
  pdf.text('TOTAL', margin + 145, yPosition);
  yPosition += 8;

  // Itens
  pdf.setFont('helvetica', 'normal');
  let subtotal = 0;
  
  budgetData.items.forEach((item, index) => {
    checkPageBreak(12);
    
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
    }
    
    const description = item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description;
    pdf.text(description, margin + 2, yPosition);
    pdf.text(item.quantity.toString(), margin + 90, yPosition);
    pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 115, yPosition);
    pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 145, yPosition);
    
    subtotal += item.total;
    yPosition += 8;
  });

  yPosition += 10;

  // Totais
  checkPageBreak(40);
  
  pdf.setFillColor(248, 249, 250);
  pdf.rect(margin + 80, yPosition, contentWidth - 80, 35, 'F');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  
  pdf.text('Subtotal:', margin + 85, yPosition + 8);
  pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 130, yPosition + 8);

  if (budgetData.discount > 0) {
    pdf.text(`Desconto (${budgetData.discount}%):`, margin + 85, yPosition + 16);
    pdf.text(`-R$ ${(subtotal * budgetData.discount / 100).toFixed(2)}`, margin + 130, yPosition + 16);
  }

  const totalFinal = subtotal - (subtotal * budgetData.discount / 100);
  pdf.setFontSize(14);
  pdf.setTextColor(59, 130, 246);
  pdf.text('TOTAL FINAL:', margin + 85, yPosition + 28);
  pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 130, yPosition + 28);
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 45;

  // Condições especiais
  if (budgetData.specialConditions) {
    checkPageBreak(30);
    addSection('CONDIÇÕES ESPECIAIS', yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const conditionsLines = pdf.splitTextToSize(budgetData.specialConditions, contentWidth - 4);
    pdf.text(conditionsLines, margin + 2, yPosition);
    yPosition += conditionsLines.length * 5 + 15;
  }

  // Observações
  if (budgetData.observations) {
    checkPageBreak(30);
    addSection('OBSERVAÇÕES', yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const observationsLines = pdf.splitTextToSize(budgetData.observations, contentWidth - 4);
    pdf.text(observationsLines, margin + 2, yPosition);
    yPosition += observationsLines.length * 5 + 20;
  }

  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const validUntil = new Date(Date.now() + budgetData.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
  pdf.text(`Orçamento gerado em ${currentDate} - Válido até ${validUntil}`, margin, pageHeight - 10);

  // Salvar o PDF
  const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
  pdf.save(fileName);
};
