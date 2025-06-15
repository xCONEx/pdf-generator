
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

    // Método de geração padrão com cores funcionais
    const pdf = new jsPDF();
    
    // Selecionar tema corretamente
    const selectedTheme = budgetData.colorTheme || 'blue';
    const theme = COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    
    console.log('Tema selecionado para PDF padrão:', selectedTheme, theme);

    // Função para converter hex para RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ];
      }
      return [59, 130, 246]; // fallback azul
    };

    const primaryColor = hexToRgb(theme.primary);
    const accentColor = hexToRgb(theme.accent);

    console.log('Cores RGB aplicadas:', { primary: primaryColor, accent: accentColor });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Cabeçalho com cor primária
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${budgetData.companyInfo.name} - ORÇAMENTO`, margin, 18);

    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.setFontSize(10);
    pdf.text(`Data: ${currentDate}`, pageWidth - margin - 40, 12);
    pdf.text(`Nº: ${budgetNumber}`, pageWidth - margin - 40, 18);

    yPosition = 40;

    // Função para seções com cores
    const addSection = (title: string, yPos: number) => {
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.rect(margin, yPos - 5, contentWidth, 12, 'F');
      
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 2, yPos + 3);
      
      pdf.setTextColor(0, 0, 0);
    };

    // Dados da empresa
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
      pdf.text(line, margin + 2, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Dados do cliente
    addSection('DADOS DO CLIENTE', yPosition);
    yPosition += 15;

    const clientData = [
      `Cliente: ${budgetData.clientInfo.name}`,
      `Email: ${budgetData.clientInfo.email}`,
      `Telefone: ${budgetData.clientInfo.phone}`,
      `Endereço: ${budgetData.clientInfo.address}`
    ];

    clientData.forEach(line => {
      pdf.text(line, margin + 2, yPosition);
      yPosition += 5;
    });
    yPosition += 15;

    // Tabela de itens
    addSection('DETALHAMENTO DOS SERVIÇOS', yPosition);
    yPosition += 15;

    // Cabeçalho da tabela com cor de fundo
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    const col1 = margin + 2;
    const col2 = margin + 90;
    const col3 = margin + 115;
    const col4 = margin + 145;
    
    pdf.text('DESCRIÇÃO', col1, yPosition);
    pdf.text('QTD', col2, yPosition);
    pdf.text('PREÇO UNIT.', col3, yPosition);
    pdf.text('TOTAL', col4, yPosition);
    yPosition += 8;

    // Itens
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
      }
      
      const description = item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description;
      pdf.text(description, col1, yPosition);
      pdf.text(item.quantity.toString(), col2, yPosition);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, col3, yPosition);
      pdf.text(`R$ ${item.total.toFixed(2)}`, col4, yPosition);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 10;

    // Totais com cor primária
    pdf.setFillColor(248, 249, 250);
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(2);
    pdf.rect(margin + 80, yPosition, contentWidth - 80, 35, 'FD');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    
    pdf.text('Subtotal:', margin + 85, yPosition + 8);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 130, yPosition + 8);

    if (budgetData.discount > 0) {
      pdf.text(`Desconto (${budgetData.discount}%):`, margin + 85, yPosition + 16);
      pdf.text(`-R$ ${(subtotal * budgetData.discount / 100).toFixed(2)}`, margin + 130, yPosition + 16);
    }

    const totalFinal = subtotal - (subtotal * budgetData.discount / 100);
    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('TOTAL FINAL:', margin + 85, yPosition + 28);
    pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 130, yPosition + 28);
    
    yPosition += 45;

    // CTA com cor primária
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(margin, yPosition - 5, contentWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRONTO PARA COMEÇAR?', margin + 5, yPosition + 8);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const ctaText = `Este orçamento tem validade de ${budgetData.validityDays} dias. Entre em contato conosco!`;
    pdf.text(ctaText, margin + 5, yPosition + 18);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
    pdf.save(fileName);

    console.log('PDF padrão gerado com cores aplicadas!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
