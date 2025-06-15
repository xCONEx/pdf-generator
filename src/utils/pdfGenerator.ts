
import jsPDF from 'jspdf';
import { BudgetData } from '@/types/budget';
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
    
    // Cores RGB que funcionam 100%
    const colors = {
      blue: [41, 128, 185],
      green: [39, 174, 96],
      orange: [230, 126, 34],
      purple: [142, 68, 173],
      red: [231, 76, 60]
    } as const;

    const selectedColor = colors[budgetData.colorTheme as keyof typeof colors] || colors.blue;

    console.log('Gerando PDF com cor:', budgetData.colorTheme, selectedColor);

    const pageWidth = 210;
    const margin = 15;
    let yPosition = 25;

    // Configurar fonte padrão
    pdf.setFont('helvetica');

    // Cabeçalho
    pdf.setFillColor(selectedColor[0], selectedColor[1], selectedColor[2]);
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

    // Reset cor do texto
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    // Função para criar seções
    const createSection = (title: string, y: number) => {
      pdf.setFillColor(selectedColor[0], selectedColor[1], selectedColor[2]);
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
      const address = budgetData.companyInfo.address.length > 60 ? 
        budgetData.companyInfo.address.substring(0, 60) + '...' : 
        budgetData.companyInfo.address;
      pdf.text(`Endereco: ${address}`, margin + 3, yPosition);
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
      const address = budgetData.clientInfo.address.length > 60 ? 
        budgetData.clientInfo.address.substring(0, 60) + '...' : 
        budgetData.clientInfo.address;
      pdf.text(`Endereco: ${address}`, margin + 3, yPosition);
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
    pdf.text('Qtd', margin + 3, yPosition + 3);
    pdf.text('Descricao', margin + 20, yPosition + 3);
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
      
      const description = item.description.length > 40 ? 
        item.description.substring(0, 40) + '...' : 
        item.description;
      
      pdf.text(item.quantity.toString(), margin + 3, yPosition + 3);
      pdf.text(description, margin + 20, yPosition + 3);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 120, yPosition + 3);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 160, yPosition + 3);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 10;

    // Totais
    const discount = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - discount;

    // Caixa de totais
    pdf.setDrawColor(selectedColor[0], selectedColor[1], selectedColor[2]);
    pdf.setLineWidth(2);
    pdf.rect(margin + 100, yPosition, 80, 30);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    
    pdf.text('Subtotal:', margin + 105, yPosition + 10);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 145, yPosition + 10);

    if (budgetData.discount > 0) {
      pdf.text(`Desconto (${budgetData.discount}%):`, margin + 105, yPosition + 17);
      pdf.text(`-R$ ${discount.toFixed(2)}`, margin + 145, yPosition + 17);
    }

    pdf.setTextColor(selectedColor[0], selectedColor[1], selectedColor[2]);
    pdf.setFontSize(14);
    pdf.text('TOTAL:', margin + 105, yPosition + 25);
    pdf.text(`R$ ${total.toFixed(2)}`, margin + 145, yPosition + 25);
    
    yPosition += 40;

    // Informações adicionais
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    pdf.text(`Validade: ${budgetData.validityDays || 30} dias`, margin, yPosition);
    yPosition += 8;
    
    if (budgetData.specialConditions) {
      const conditions = budgetData.specialConditions.length > 80 ? 
        budgetData.specialConditions.substring(0, 80) + '...' : 
        budgetData.specialConditions;
      pdf.text(`Condicoes: ${conditions}`, margin, yPosition);
      yPosition += 8;
    }
    
    if (budgetData.observations) {
      const obs = budgetData.observations.length > 80 ? 
        budgetData.observations.substring(0, 80) + '...' : 
        budgetData.observations;
      pdf.text(`Observacoes: ${obs}`, margin, yPosition);
      yPosition += 8;
    }

    // CTA final
    yPosition += 10;
    pdf.setFillColor(selectedColor[0], selectedColor[1], selectedColor[2]);
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
