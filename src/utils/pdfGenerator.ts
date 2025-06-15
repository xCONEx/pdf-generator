
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

    // Método de geração padrão com layout funcional
    const pdf = new jsPDF();
    
    // Selecionar tema de cor
    let selectedTheme = budgetData.colorTheme || 'blue';
    console.log('Tema do orçamento:', selectedTheme);
    
    // Verificar se existe no COLOR_THEMES
    if (!COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES]) {
      selectedTheme = 'blue';
    }
    
    const theme = COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES];
    console.log('Tema aplicado:', theme);

    // Função para converter hex para RGB (0-255)
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        return [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ];
      }
      return [59, 130, 246]; // azul padrão
    };

    const primaryColor = hexToRgb(theme.primary);
    const accentColor = hexToRgb(theme.accent);

    console.log('Cores RGB:', { primary: primaryColor, accent: accentColor });

    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Cabeçalho com cor primária
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO', margin, 18);

    // Informações do cabeçalho
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.setFontSize(10);
    pdf.text(`Data: ${currentDate} | Nº: ${budgetNumber}`, pageWidth - 80, 12);

    yPosition = 40;

    // Função para criar seção com fundo colorido
    const addColoredSection = (title: string, yPos: number) => {
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
      
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 2, yPos + 2);
      
      pdf.setTextColor(0, 0, 0);
      return yPos + 12;
    };

    // Seção Empresa
    yPosition = addColoredSection('EMPRESA:', yPosition);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(budgetData.companyInfo.name, margin + 2, yPosition);
    yPosition += 5;
    pdf.text(budgetData.companyInfo.email, margin + 2, yPosition);
    yPosition += 5;
    pdf.text(budgetData.companyInfo.phone, margin + 2, yPosition);
    yPosition += 10;

    // Seção Cliente
    yPosition = addColoredSection('CLIENTE:', yPosition);
    
    pdf.text(budgetData.clientInfo.name, margin + 2, yPosition);
    yPosition += 5;
    pdf.text(budgetData.clientInfo.email, margin + 2, yPosition);
    yPosition += 5;
    pdf.text(budgetData.clientInfo.phone, margin + 2, yPosition);
    yPosition += 15;

    // Seção Itens
    yPosition = addColoredSection('ITENS DO ORÇAMENTO:', yPosition);

    // Cabeçalho da tabela
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 2, contentWidth, 8, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Qtd', margin + 2, yPosition + 3);
    pdf.text('Descrição', margin + 20, yPosition + 3);
    pdf.text('Preço Unit.', margin + 110, yPosition + 3);
    pdf.text('Total', margin + 150, yPosition + 3);
    yPosition += 10;

    // Itens
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      if (yPosition > 250) { // Nova página se necessário
        pdf.addPage();
        yPosition = 30;
      }
      
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 2, contentWidth, 7, 'F');
      }
      
      const description = item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description;
      pdf.text(item.quantity.toString(), margin + 2, yPosition + 2);
      pdf.text(description, margin + 20, yPosition + 2);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 110, yPosition + 2);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 150, yPosition + 2);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 10;

    // Box de totais com cor
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(1);
    pdf.rect(margin + 80, yPosition, contentWidth - 80, 30);
    
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
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('TOTAL FINAL:', margin + 85, yPosition + 24);
    pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 130, yPosition + 24);
    
    yPosition += 40;

    // Informações adicionais
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Validade: ${budgetData.validityDays} dias`, margin, yPosition);
    yPosition += 8;
    
    if (budgetData.specialConditions) {
      const conditions = budgetData.specialConditions.substring(0, 100);
      pdf.text(conditions, margin, yPosition);
      yPosition += 8;
    }
    
    if (budgetData.observations) {
      const obs = budgetData.observations.substring(0, 100);
      pdf.text(obs, margin, yPosition);
    }

    // Salvar PDF
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com layout funcional e cores aplicadas!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
