
import jsPDF from 'jspdf';
import { BudgetData, COLOR_THEMES } from '@/types/budget';

export const generatePDF = async (budgetData: BudgetData) => {
  const pdf = new jsPDF();
  const theme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES];
  
  // Configurações gerais
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = 30;

  // Função para adicionar cor ao texto
  const setColor = (colorHex: string) => {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    pdf.setTextColor(r, g, b);
  };

  // Função para resetar cor
  const resetColor = () => {
    pdf.setTextColor(0, 0, 0);
  };

  // Cabeçalho com cor do tema
  pdf.setFillColor(
    parseInt(theme.primary.slice(1, 3), 16),
    parseInt(theme.primary.slice(3, 5), 16),
    parseInt(theme.primary.slice(5, 7), 16)
  );
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ORÇAMENTO', margin, 18);

  // Data e número do orçamento
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  pdf.text(`Data: ${currentDate}`, pageWidth - margin - 50, 12);
  pdf.text(`Nº: ${budgetNumber}`, pageWidth - margin - 50, 20);

  yPosition = 40;
  resetColor();

  // Informações da empresa
  setColor(theme.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DA EMPRESA', margin, yPosition);
  yPosition += 10;

  resetColor();
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Empresa: ${budgetData.companyInfo.name}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Email: ${budgetData.companyInfo.email}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Endereço: ${budgetData.companyInfo.address}`, margin, yPosition);
  yPosition += 15;

  // Informações do cliente
  setColor(theme.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO CLIENTE', margin, yPosition);
  yPosition += 10;

  resetColor();
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Cliente: ${budgetData.clientInfo.name}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Email: ${budgetData.clientInfo.email}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin, yPosition);
  yPosition += 7;
  pdf.text(`Endereço: ${budgetData.clientInfo.address}`, margin, yPosition);
  yPosition += 15;

  // Texto otimizado para vendas
  setColor(theme.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NOSSA PROPOSTA PARA VOCÊ', margin, yPosition);
  yPosition += 12;

  resetColor();
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const salesText = `Prezado(a) ${budgetData.clientInfo.name},

É com grande satisfação que apresentamos nossa proposta personalizada para suas necessidades.
Nossa empresa se destaca pela qualidade excepcional, atendimento diferenciado e compromisso
com a excelência em cada projeto que realizamos.

Confiamos que nossa proposta atenderá perfeitamente às suas expectativas, oferecendo
a melhor relação custo-benefício do mercado. Estamos prontos para transformar sua visão
em realidade com todo o profissionalismo que você merece.`;

  const lines = pdf.splitTextToSize(salesText, pageWidth - 2 * margin);
  pdf.text(lines, margin, yPosition);
  yPosition += lines.length * 4 + 10;

  // Tabela de itens
  setColor(theme.primary);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DETALHAMENTO DOS SERVIÇOS', margin, yPosition);
  yPosition += 15;

  // Cabeçalho da tabela
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition - 8, pageWidth - 2 * margin, 12, 'F');
  
  resetColor();
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIÇÃO', margin + 2, yPosition);
  pdf.text('QTD', margin + 100, yPosition);
  pdf.text('PREÇO UNIT.', margin + 125, yPosition);
  pdf.text('TOTAL', margin + 160, yPosition);
  yPosition += 8;

  // Itens
  pdf.setFont('helvetica', 'normal');
  let subtotal = 0;
  budgetData.items.forEach((item) => {
    pdf.text(item.description, margin + 2, yPosition);
    pdf.text(item.quantity.toString(), margin + 100, yPosition);
    pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 125, yPosition);
    pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 160, yPosition);
    subtotal += item.total;
    yPosition += 8;
  });

  yPosition += 5;

  // Totais
  pdf.line(margin + 120, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Subtotal:', margin + 120, yPosition);
  pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 160, yPosition);
  yPosition += 8;

  if (budgetData.discount > 0) {
    pdf.text(`Desconto (${budgetData.discount}%):`, margin + 120, yPosition);
    pdf.text(`-R$ ${(subtotal * budgetData.discount / 100).toFixed(2)}`, margin + 160, yPosition);
    yPosition += 8;
  }

  const totalFinal = subtotal - (subtotal * budgetData.discount / 100);
  setColor(theme.primary);
  pdf.setFontSize(12);
  pdf.text('TOTAL FINAL:', margin + 120, yPosition);
  pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 160, yPosition);
  yPosition += 15;

  // Condições e observações
  resetColor();
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONDIÇÕES ESPECIAIS:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const conditionsLines = pdf.splitTextToSize(budgetData.specialConditions, pageWidth - 2 * margin);
  pdf.text(conditionsLines, margin, yPosition);
  yPosition += conditionsLines.length * 4 + 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('OBSERVAÇÕES:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const observationsLines = pdf.splitTextToSize(budgetData.observations, pageWidth - 2 * margin);
  pdf.text(observationsLines, margin, yPosition);
  yPosition += observationsLines.length * 4 + 15;

  // Chamada para ação
  setColor(theme.primary);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRONTO PARA COMEÇAR?', margin, yPosition);
  yPosition += 10;

  resetColor();
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const ctaText = `Este orçamento tem validade de ${budgetData.validityDays} dias.
Entre em contato conosco para confirmar o pedido ou esclarecer qualquer dúvida.
Estamos ansiosos para trabalhar com você e superar suas expectativas!

Para aceitar esta proposta, basta entrar em contato conosco através dos dados informados acima.`;

  const ctaLines = pdf.splitTextToSize(ctaText, pageWidth - 2 * margin);
  pdf.text(ctaLines, margin, yPosition);

  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Orçamento gerado em ${currentDate} - Válido até ${new Date(Date.now() + budgetData.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`, 
    margin, pageHeight - 10);

  // Salvar o PDF
  const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${budgetNumber}.pdf`;
  pdf.save(fileName);
};
