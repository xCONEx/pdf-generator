import jsPDF from 'jspdf';
import { BudgetData, COLOR_THEMES } from '@/types/budget';
import { generateSecurePDF } from './secureGenerator';

export const generatePDF = async (budgetData: BudgetData) => {
  try {
    // Verificar se tem dados mínimos necessários
    if (!budgetData.companyInfo.name || !budgetData.clientInfo.name) {
      throw new Error('Dados da empresa e cliente são obrigatórios');
    }

    // Tentar gerar PDF seguro primeiro (se o usuário tiver acesso)
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
      // Se falhar, continua com o método padrão
    }

    // Método de geração padrão
    const pdf = new jsPDF();
    
    // Simplificar seleção de cores - usar sempre o tema padrão ou selecionado
    const selectedTheme = budgetData.colorTheme || 'blue';
    const theme = COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.blue;
    
    console.log('Tema selecionado:', selectedTheme, theme);

    // Cores RGB fixas baseadas no tema
    const primaryColor = theme.primary === '#3B82F6' ? [59, 130, 246] : 
                        theme.primary === '#10B981' ? [16, 185, 129] :
                        theme.primary === '#F59E0B' ? [245, 158, 11] :
                        theme.primary === '#8B5CF6' ? [139, 92, 246] :
                        theme.primary === '#EF4444' ? [239, 68, 68] : [59, 130, 246];

    const accentColor = theme.accent === '#DBEAFE' ? [219, 234, 254] :
                       theme.accent === '#D1FAE5' ? [209, 250, 229] :
                       theme.accent === '#FEF3C7' ? [254, 243, 199] :
                       theme.accent === '#EDE9FE' ? [237, 233, 254] :
                       theme.accent === '#FEE2E2' ? [254, 226, 226] : [219, 234, 254];

    console.log('Cores RGB:', { primary: primaryColor, accent: accentColor });

    // Configurações para A4
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 30;
    let currentPage = 1;

    // Função para verificar se precisa de nova página
    const checkPageBreak = (spaceNeeded: number) => {
      if (yPosition + spaceNeeded > pageHeight - 20) {
        pdf.addPage();
        currentPage++;
        yPosition = 30;
        addPageHeader();
        return true;
      }
      return false;
    };

    // Função para adicionar cabeçalho em cada página
    const addPageHeader = () => {
      // Cabeçalho com cor primária
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      
      // Nome da empresa e título
      pdf.text(`${budgetData.companyInfo.name || 'EMPRESA'} - ORÇAMENTO`, margin, 18);

      // Data e número do orçamento
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('pt-BR');
      const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      pdf.text(`Data: ${currentDate}`, pageWidth - margin - 40, 12);
      pdf.text(`Nº: ${budgetNumber}`, pageWidth - margin - 40, 18);
      
      if (currentPage > 1) {
        pdf.text(`Página ${currentPage}`, pageWidth - margin - 20, pageHeight - 10);
      }
    };

    // Função para adicionar seção com fundo colorido
    const addSection = (title: string, yPos: number) => {
      // Usar cor de accent
      pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.rect(margin, yPos - 5, contentWidth, 12, 'F');
      
      // Título com cor primária
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 2, yPos + 3);
      
      // Resetar para cor de texto padrão
      pdf.setTextColor(0, 0, 0);
    };

    // Função para adicionar texto com quebra de linha automática
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.35);
    };

    // Inicializar primeira página
    addPageHeader();
    yPosition = 40;

    // Seção de dados da empresa
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

    // Seção de dados do cliente
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

    // Texto otimizado para vendas
    checkPageBreak(40);
    addSection('NOSSA PROPOSTA PARA VOCÊ', yPosition);
    yPosition += 15;

    const salesText = `Prezado(a) ${budgetData.clientInfo.name},

É com grande satisfação que apresentamos nossa proposta personalizada para suas necessidades. Nossa empresa se destaca pela qualidade excepcional, atendimento diferenciado e compromisso com a excelência em cada projeto que realizamos.

Confiamos que nossa proposta atenderá perfeitamente às suas expectativas, oferecendo a melhor relação custo-benefício do mercado.`;

    const salesTextHeight = addWrappedText(salesText, margin + 2, yPosition, contentWidth - 4);
    yPosition += salesTextHeight + 15;

    // Tabela de itens
    checkPageBreak(30);
    addSection('DETALHAMENTO DOS SERVIÇOS', yPosition);
    yPosition += 15;

    // Cabeçalho da tabela
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin, yPosition - 5, contentWidth, 10);
    
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

    // Itens da tabela
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    budgetData.items.forEach((item, index) => {
      checkPageBreak(12);
      
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
      }
      
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(margin, yPosition - 4, contentWidth, 8);
      
      const description = item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description;
      pdf.text(description, col1, yPosition);
      pdf.text(item.quantity.toString(), col2, yPosition);
      pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, col3, yPosition);
      pdf.text(`R$ ${item.total.toFixed(2)}`, col4, yPosition);
      
      subtotal += item.total;
      yPosition += 8;
    });

    yPosition += 10;

    // Totais em caixa destacada com cor primária
    checkPageBreak(40);
    
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
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 45;

    // Condições especiais
    if (budgetData.specialConditions) {
      checkPageBreak(30);
      addSection('CONDIÇÕES ESPECIAIS', yPosition);
      yPosition += 15;
      const conditionsHeight = addWrappedText(budgetData.specialConditions, margin + 2, yPosition, contentWidth - 4);
      yPosition += conditionsHeight + 15;
    }

    // Observações
    if (budgetData.observations) {
      checkPageBreak(30);
      addSection('OBSERVAÇÕES', yPosition);
      yPosition += 15;
      const observationsHeight = addWrappedText(budgetData.observations, margin + 2, yPosition, contentWidth - 4);
      yPosition += observationsHeight + 20;
    }

    // Chamada para ação com cor primária
    checkPageBreak(40);
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(margin, yPosition - 5, contentWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRONTO PARA COMEÇAR?', margin + 5, yPosition + 8);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const ctaText = `Este orçamento tem validade de ${budgetData.validityDays} dias. Entre em contato conosco para confirmar o pedido!`;
    addWrappedText(ctaText, margin + 5, yPosition + 18, contentWidth - 10);
    
    pdf.setTextColor(0, 0, 0);
    yPosition += 45;

    // Rodapé
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const validUntil = new Date(Date.now() + budgetData.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
    pdf.text(`Orçamento gerado em ${currentDate} - Válido até ${validUntil}`, margin, pageHeight - 10);

    // Salvar o PDF
    const fileName = `Orcamento_${budgetData.clientInfo.name.replace(/\s+/g, '_')}_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}.pdf`;
    pdf.save(fileName);

    console.log('PDF gerado com sucesso!');

  } catch (error) {
    console.error('Erro detalhado na geração de PDF:', error);
    throw new Error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
