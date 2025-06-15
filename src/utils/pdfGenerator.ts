
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

    // Método simplificado garantindo funcionalidade
    const pdf = new jsPDF();
    
    // Cores fixas que funcionam 100%
    const WORKING_COLORS = {
      blue: { r: 59, g: 130, b: 246 },
      green: { r: 16, g: 185, b: 129 },
      orange: { r: 245, g: 158, b: 11 },
      purple: { r: 139, g: 92, b: 246 },
      red: { r: 239, g: 68, b: 68 }
    };

    // Selecionar cor baseada no tema ou usar azul como padrão
    let selectedColor = WORKING_COLORS.blue;
    if (budgetData.colorTheme && WORKING_COLORS[budgetData.colorTheme as keyof typeof WORKING_COLORS]) {
      selectedColor = WORKING_COLORS[budgetData.colorTheme as keyof typeof WORKING_COLORS];
    }

    console.log('Cor selecionada:', budgetData.colorTheme, selectedColor);

    const pageWidth = 210;
    const margin = 20;
    let yPosition = 30;

    // Cabeçalho com cor selecionada
    pdf.setFillColor(selectedColor.r, selectedColor.g, selectedColor.b);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    // Título em branco
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO PROFISSIONAL', margin, 18);

    // Data e número
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.setFontSize(10);
    pdf.text(`Data: ${currentDate} | Nº: ${budgetNumber}`, pageWidth - 80, 12);

    yPosition = 40;

    // Função para criar seções coloridas
    const addSection = (title: string, yPos: number) => {
      // Fundo colorido claro
      pdf.setFillColor(selectedColor.r + 30, selectedColor.g + 30, selectedColor.b + 30);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
      
      // Título em cor escura
      pdf.setTextColor(selectedColor.r - 50, selectedColor.g - 50, selectedColor.b - 50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 3, yPos + 2);
      
      // Resetar cor do texto
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      return yPos + 15;
    };

    // Seção Empresa
    yPosition = addSection('DADOS DA EMPRESA', yPosition);
    pdf.text(`${budgetData.companyInfo.name}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.companyInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.companyInfo.address) {
      pdf.text(`Endereço: ${budgetData.companyInfo.address}`, margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 8;

    // Seção Cliente
    yPosition = addSection('DADOS DO CLIENTE', yPosition);
    pdf.text(`${budgetData.clientInfo.name}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.clientInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.clientInfo.address) {
      pdf.text(`Endereço: ${budgetData.clientInfo.address}`, margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 8;

    // Seção Itens
    yPosition = addSection('ITENS DO ORÇAMENTO', yPosition);

    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Qtd', margin + 3, yPosition + 2);
    pdf.text('Descrição', margin + 25, yPosition + 2);
    pdf.text('Preço Unit.', margin + 110, yPosition + 2);
    pdf.text('Total', margin + 150, yPosition + 2);
    yPosition += 12;

    // Itens
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Alternar cor de fundo
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
      }
      
      const description = item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description;
      
      pdf.text(item.quantity.toString(), margin + 3, yPosition + 2);
      pdf.text(description, margin + 25, yPosition + 2);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 110, yPosition + 2);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 150, yPosition + 2);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 15;

    // Totais com destaque
    const boxY = yPosition;
    const boxHeight = budgetData.discount > 0 ? 35 : 25;
    
    // Caixa com borda colorida
    pdf.setDrawColor(selectedColor.r, selectedColor.g, selectedColor.b);
    pdf.setLineWidth(2);
    pdf.rect(margin + 90, boxY, pageWidth - margin - 90 - 20, boxHeight);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    
    // Subtotal
    pdf.text('Subtotal:', margin + 95, boxY + 10);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 140, boxY + 10);

    // Desconto (se houver)
    if (budgetData.discount > 0) {
      const descontoValor = subtotal * budgetData.discount / 100;
      pdf.text(`Desconto (${budgetData.discount}%):`, margin + 95, boxY + 20);
      pdf.text(`-R$ ${descontoValor.toFixed(2)}`, margin + 140, boxY + 20);
    }

    // Total final destacado
    const totalFinal = subtotal - (subtotal * budgetData.discount / 100);
    pdf.setTextColor(selectedColor.r, selectedColor.g, selectedColor.b);
    pdf.setFontSize(16);
    const totalY = budgetData.discount > 0 ? boxY + 30 : boxY + 20;
    pdf.text('TOTAL:', margin + 95, totalY);
    pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 140, totalY);
    
    yPosition += boxHeight + 20;

    // Informações finais
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    pdf.text(`Validade do orçamento: ${budgetData.validityDays} dias`, margin, yPosition);
    yPosition += 8;
    
    if (budgetData.specialConditions) {
      const conditions = budgetData.specialConditions.substring(0, 80);
      pdf.text(`Condições: ${conditions}`, margin, yPosition);
      yPosition += 8;
    }
    
    if (budgetData.observations) {
      const obs = budgetData.observations.substring(0, 80);
      pdf.text(`Observações: ${obs}`, margin, yPosition);
      yPosition += 8;
    }

    // CTA final com cor
    yPosition += 10;
    pdf.setFillColor(selectedColor.r, selectedColor.g, selectedColor.b);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('ACEITA NOSSO ORÇAMENTO?', margin + 5, yPosition + 8);
    pdf.setFontSize(10);
    pdf.text('Entre em contato conosco para finalizar!', margin + 5, yPosition + 15);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${budgetNumber}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso com cores funcionais!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
