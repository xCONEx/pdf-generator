

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

    // Método padrão com cores do tema selecionado
    const pdf = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    let yPosition = 25;

    // Usar a cor do tema selecionado
    const selectedTheme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [41, 128, 185]; // Azul padrão
    };
    
    const primaryColor = hexToRgb(selectedTheme.primary);
    
    // Configurar fonte padrão
    pdf.setFont('helvetica');

    // Cabeçalho com cor do tema
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORÇAMENTO PROFISSIONAL', margin, 20);

    // Número e data
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const currentDate = new Date().toLocaleDateString('pt-BR');
    pdf.setFontSize(10);
    pdf.text(`Nº: ${budgetNumber} | Data: ${currentDate}`, pageWidth - 70, 20);

    yPosition = 40;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    // Função para criar seções
    const createSection = (title: string, y: number) => {
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 3, y + 3);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      return y + 15;
    };

    // Dados da Empresa
    yPosition = createSection('DADOS DA EMPRESA', yPosition);
    pdf.text(budgetData.companyInfo.name, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.companyInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.companyInfo.address) {
      pdf.text(`Endereco: ${budgetData.companyInfo.address}`, margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 8;

    // Dados do Cliente
    yPosition = createSection('DADOS DO CLIENTE', yPosition);
    pdf.text(budgetData.clientInfo.name, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.clientInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.clientInfo.address) {
      pdf.text(`Endereco: ${budgetData.clientInfo.address}`, margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 8;

    // Itens do Orçamento
    yPosition = createSection('ITENS DO ORCAMENTO', yPosition);

    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Item', margin + 3, yPosition + 3);
    pdf.text('Descricao', margin + 20, yPosition + 3);
    pdf.text('Qtd', margin + 100, yPosition + 3);
    pdf.text('Preco Unit.', margin + 120, yPosition + 3);
    pdf.text('Total', margin + 160, yPosition + 3);
    yPosition += 12;

    // Itens
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      if (yPosition > 260) {
        pdf.addPage();
        yPosition = 30;
      }
      
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
      }
      
      pdf.text((index + 1).toString(), margin + 3, yPosition + 3);
      
      // Truncar descrição se muito longa
      const description = item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description;
      pdf.text(description, margin + 20, yPosition + 3);
      
      pdf.text(item.quantity.toString(), margin + 100, yPosition + 3);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 120, yPosition + 3);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 160, yPosition + 3);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 10;

    // Totais
    const discount = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - discount;

    // Posicionar totais à direita
    const totalsX = pageWidth - 90;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    
    pdf.text('Subtotal:', totalsX, yPosition);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, totalsX + 40, yPosition);
    yPosition += 8;

    if (budgetData.discount > 0) {
      pdf.text(`Desconto (${budgetData.discount}%):`, totalsX, yPosition);
      pdf.text(`-R$ ${discount.toFixed(2)}`, totalsX + 40, yPosition);
      yPosition += 8;
    }

    // Total final destacado
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFontSize(14);
    pdf.text('TOTAL:', totalsX, yPosition);
    pdf.text(`R$ ${total.toFixed(2)}`, totalsX + 40, yPosition);
    
    yPosition += 20;

    // Informações adicionais
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    pdf.text(`Validade: ${budgetData.validityDays || 30} dias`, margin, yPosition);
    yPosition += 8;
    
    if (budgetData.specialConditions) {
      // Quebrar texto longo em múltiplas linhas
      const conditions = pdf.splitTextToSize(budgetData.specialConditions, pageWidth - 2 * margin);
      pdf.text('Condicoes:', margin, yPosition);
      yPosition += 6;
      pdf.text(conditions.slice(0, 3), margin, yPosition); // Máximo 3 linhas
      yPosition += 6 * Math.min(conditions.length, 3);
    }
    
    if (budgetData.observations) {
      // Quebrar texto longo em múltiplas linhas
      const observations = pdf.splitTextToSize(budgetData.observations, pageWidth - 2 * margin);
      pdf.text('Observacoes:', margin, yPosition);
      yPosition += 6;
      pdf.text(observations.slice(0, 3), margin, yPosition); // Máximo 3 linhas
      yPosition += 6 * Math.min(observations.length, 3);
    }

    // CTA final
    yPosition += 10;
    if (yPosition > 260) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('ACEITA NOSSO ORCAMENTO?', margin + 5, yPosition + 8);
    pdf.setFontSize(10);
    pdf.text('Entre em contato conosco para finalizar!', margin + 5, yPosition + 15);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${budgetNumber}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

