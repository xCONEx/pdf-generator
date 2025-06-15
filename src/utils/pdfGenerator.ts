
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

    // Método padrão com nova estética
    const pdf = new jsPDF();
    const pageWidth = 210;
    const margin = 15;
    let yPosition = 35;

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
    
    // Configurar fonte padrão
    pdf.setFont('helvetica');

    // Cabeçalho principal - azul com logo/nome da empresa
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Nome da empresa no cabeçalho
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(budgetData.companyInfo.name.toUpperCase(), margin, 15);

    // Título ORÇAMENTO
    pdf.setFontSize(24);
    pdf.text('ORÇAMENTO', margin, 28);

    // Data e número no canto direito
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const currentDate = new Date().toLocaleDateString('pt-BR');
    pdf.setFontSize(10);
    pdf.text(`Data: ${currentDate}`, pageWidth - 60, 15);
    pdf.text(`Nº: ${budgetNumber}`, pageWidth - 60, 22);

    // Função para criar seções com fundo azul claro
    const createSection = (title: string, y: number) => {
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.1);
      pdf.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
      
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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
    pdf.text(`Empresa: ${budgetData.companyInfo.name}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.companyInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.companyInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.companyInfo.address) {
      const addressLines = pdf.splitTextToSize(`Endereço: ${budgetData.companyInfo.address}`, pageWidth - 2 * margin - 6);
      pdf.text(addressLines.slice(0, 2), margin + 3, yPosition);
      yPosition += 6 * Math.min(addressLines.length, 2);
    }
    yPosition += 10;

    // Dados do Cliente
    yPosition = createSection('DADOS DO CLIENTE', yPosition);
    pdf.text(`Cliente: ${budgetData.clientInfo.name}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${budgetData.clientInfo.email}`, margin + 3, yPosition);
    yPosition += 6;
    pdf.text(`Telefone: ${budgetData.clientInfo.phone}`, margin + 3, yPosition);
    yPosition += 6;
    if (budgetData.clientInfo.address) {
      const addressLines = pdf.splitTextToSize(`Endereço: ${budgetData.clientInfo.address}`, pageWidth - 2 * margin - 6);
      pdf.text(addressLines.slice(0, 2), margin + 3, yPosition);
      yPosition += 6 * Math.min(addressLines.length, 2);
    }
    yPosition += 10;

    // Nossa Proposta para Você
    yPosition = createSection('NOSSA PROPOSTA PARA VOCÊ', yPosition);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Prezado(a) ${budgetData.clientInfo.name},`, margin + 3, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    const proposalText = [
      'É com grande satisfação que apresentamos nossa proposta personalizada para suas',
      'necessidades. Nossa empresa se destaca pela qualidade excepcional, atendimento diferenciado e',
      'compromisso com a excelência em cada projeto que realizamos.',
      '',
      'Confiamos que nossa proposta atenderá perfeitamente às suas expectativas, oferecendo a melhor',
      'relação custo-benefício do mercado.'
    ];
    
    proposalText.forEach(line => {
      pdf.text(line, margin + 3, yPosition);
      yPosition += 5;
    });
    yPosition += 8;

    // Detalhamento dos Serviços
    yPosition = createSection('DETALHAMENTO DOS SERVIÇOS', yPosition);

    // Cabeçalho da tabela
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('DESCRIÇÃO', margin + 3, yPosition + 3);
    pdf.text('QTD', margin + 120, yPosition + 3);
    pdf.text('PREÇO UNIT.', margin + 140, yPosition + 3);
    pdf.text('TOTAL', margin + 170, yPosition + 3);
    yPosition += 12;

    // Itens
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      if (index % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
      }
      
      const description = item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description;
      pdf.text(description, margin + 3, yPosition + 3);
      pdf.text(item.quantity.toString(), margin + 125, yPosition + 3);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 142, yPosition + 3);
      pdf.text(`R$ ${item.total.toFixed(2)}`, margin + 172, yPosition + 3);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 15;

    // Box dos totais (similar à imagem)
    const discount = subtotal * (budgetData.discount || 0) / 100;
    const total = subtotal - discount;

    // Subtotal
    pdf.setFillColor(245, 245, 245);
    pdf.rect(pageWidth - 80, yPosition - 5, 65, 12, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(pageWidth - 80, yPosition - 5, 65, 12);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Subtotal:', pageWidth - 75, yPosition + 1);
    pdf.text(`R$ ${subtotal.toFixed(2)}`, pageWidth - 35, yPosition + 1);
    yPosition += 20;

    // Total Final em destaque
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2], 0.1);
    pdf.rect(pageWidth - 80, yPosition - 8, 65, 18, 'F');
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(2);
    pdf.rect(pageWidth - 80, yPosition - 8, 65, 18);
    
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('TOTAL FINAL:', pageWidth - 75, yPosition - 1);
    pdf.text(`R$ ${total.toFixed(2)}`, pageWidth - 35, yPosition + 5);

    // Verificar se precisa de nova página
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 30;
      
      // Repetir cabeçalho na nova página
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(budgetData.companyInfo.name.toUpperCase(), margin, 15);
      pdf.setFontSize(24);
      pdf.text('ORÇAMENTO', margin, 28);
      pdf.setFontSize(10);
      pdf.text(`Data: ${currentDate}`, pageWidth - 60, 15);
      pdf.text(`Nº: ${budgetNumber}`, pageWidth - 60, 22);
      yPosition = 45;
    } else {
      yPosition += 30;
    }

    // Condições Especiais
    yPosition = createSection('CONDIÇÕES ESPECIAIS', yPosition);
    if (budgetData.specialConditions) {
      const conditions = pdf.splitTextToSize(budgetData.specialConditions, pageWidth - 2 * margin - 6);
      pdf.text(conditions.slice(0, 4), margin + 3, yPosition);
      yPosition += 6 * Math.min(conditions.length, 4);
    } else {
      pdf.text('Pagamento em até 30 dias após aprovação do orçamento.', margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Observações
    yPosition = createSection('OBSERVAÇÕES', yPosition);
    if (budgetData.observations) {
      const observations = pdf.splitTextToSize(budgetData.observations, pageWidth - 2 * margin - 6);
      pdf.text(observations.slice(0, 3), margin + 3, yPosition);
      yPosition += 6 * Math.min(observations.length, 3);
    } else {
      pdf.text('Estamos à disposição para esclarecimentos adicionais.', margin + 3, yPosition);
      yPosition += 6;
    }
    yPosition += 15;

    // CTA final - azul com destaque
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('PRONTO PARA COMEÇAR?', margin + 5, yPosition + 10);
    pdf.setFontSize(10);
    pdf.text(`Este orçamento tem validade de ${budgetData.validityDays || 30} dias. Entre em contato conosco para confirmar o pedido!`, margin + 5, yPosition + 18);

    // Salvar
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${budgetNumber}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
