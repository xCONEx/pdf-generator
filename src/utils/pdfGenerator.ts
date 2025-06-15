
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

    // Método padrão garantido
    const pdf = new jsPDF();
    
    // Cores que funcionam 100%
    const workingColors = {
      blue: [59, 130, 246],
      green: [16, 185, 129],
      orange: [245, 158, 11],
      purple: [139, 92, 246],
      red: [239, 68, 68]
    } as const;

    // Selecionar cor ou usar azul padrão
    const selectedTheme = budgetData.colorTheme as keyof typeof workingColors;
    const color = workingColors[selectedTheme] || workingColors.blue;

    console.log('Usando cor:', selectedTheme, color);

    const pageWidth = 210;
    const margin = 20;
    let yPosition = 30;

    // Cabeçalho com cor
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO PROFISSIONAL', margin, 18);

    // Data e número
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.setFontSize(10);
    pdf.text(`Data: ${currentDate} | Nº: ${budgetNumber}`, pageWidth - 80, 18);

    yPosition = 40;

    // Função auxiliar para seções
    const addColoredSection = (title: string, yPos: number) => {
      // Fundo colorido
      pdf.setFillColor(color[0] + 40, color[1] + 40, color[2] + 40);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
      
      // Título
      pdf.setTextColor(color[0] - 40, color[1] - 40, color[2] - 40);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 3, yPos + 2);
      
      // Reset
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      return yPos + 12;
    };

    // Seção Empresa
    yPosition = addColoredSection('DADOS DA EMPRESA', yPosition);
    pdf.text(`${budgetData.companyInfo.name}`, margin + 3, yPosition);
    yPosition += 5;
    pdf.text(`Email: ${budgetData.companyInfo.email}`, margin + 3, yPosition);
    yPosition += 5;
    pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin + 3, yPosition);
    yPosition += 5;
    if (budgetData.companyInfo.address) {
      pdf.text(`Endereço: ${budgetData.companyInfo.address}`, margin + 3, yPosition);
      yPosition += 5;
    }
    yPosition += 8;

    // Seção Cliente
    yPosition = addColoredSection('DADOS DO CLIENTE', yPosition);
    pdf.text(`${budgetData.clientInfo.name}`, margin + 3, yPosition);
    yPosition += 5;
    pdf.text(`Email: ${budgetData.clientInfo.email}`, margin + 3, yPosition);
    yPosition += 5;
    pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin + 3, yPosition);
    yPosition += 5;
    if (budgetData.clientInfo.address) {
      pdf.text(`Endereço: ${budgetData.clientInfo.address}`, margin + 3, yPosition);
      yPosition += 5;
    }
    yPosition += 8;

    // Seção Itens
    yPosition = addColoredSection('ITENS DO ORÇAMENTO', yPosition);

    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Qtd', margin + 3, yPosition + 2);
    pdf.text('Descrição', margin + 25, yPosition + 2);
    pdf.text('Preço Unit.', margin + 110, yPosition + 2);
    pdf.text('Total', margin + 150, yPosition + 2);
    yPosition += 10;

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
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 6, 'F');
      }
      
      const description = item.description.length > 35 ? item.description.substring(0, 35) + '...' : item.description;
      
      pdf.text(item.quantity.toString(), margin + 3, yPosition + 2);
      pdf.text(description, margin + 25, yPosition + 2);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 110, yPosition + 2);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 150, yPosition + 2);
      
      subtotal += item.total;
      yPosition += 6;
    });

    yPosition += 10;

    // Totais
    const discount = subtotal * budgetData.discount / 100;
    const total = subtotal - discount;

    // Caixa de totais
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(1);
    pdf.rect(margin + 90, yPosition, 80, 25);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    pdf.text('Subtotal:', margin + 95, yPosition + 8);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 140, yPosition + 8);

    if (budgetData.discount > 0) {
      pdf.text(`Desconto (${budgetData.discount}%):`, margin + 95, yPosition + 14);
      pdf.text(`-R$ ${discount.toFixed(2)}`, margin + 140, yPosition + 14);
    }

    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFontSize(12);
    pdf.text('TOTAL:', margin + 95, yPosition + 20);
    pdf.text(`R$ ${total.toFixed(2)}`, margin + 140, yPosition + 20);
    
    yPosition += 35;

    // Informações finais
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    pdf.text(`Validade: ${budgetData.validityDays} dias`, margin, yPosition);
    yPosition += 6;
    
    if (budgetData.specialConditions) {
      const conditions = budgetData.specialConditions.substring(0, 70);
      pdf.text(`Condições: ${conditions}`, margin, yPosition);
      yPosition += 6;
    }
    
    if (budgetData.observations) {
      const obs = budgetData.observations.substring(0, 70);
      pdf.text(`Observações: ${obs}`, margin, yPosition);
      yPosition += 6;
    }

    // CTA final
    yPosition += 5;
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('ACEITA NOSSO ORÇAMENTO?', margin + 5, yPosition + 6);
    pdf.setFontSize(8);
    pdf.text('Entre em contato conosco para finalizar!', margin + 5, yPosition + 11);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${budgetNumber}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
