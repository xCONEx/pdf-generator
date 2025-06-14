import jsPDF from 'jspdf';
import { BudgetData, COLOR_THEMES } from '@/types/budget';

export const generatePDF = async (budgetData: BudgetData) => {
  const pdf = new jsPDF();
  const theme = COLOR_THEMES[budgetData.colorTheme as keyof typeof COLOR_THEMES];
  
  // Configurações para A4
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
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
    // Cabeçalho com cor do tema
    pdf.setFillColor(
      parseInt(theme.primary.slice(1, 3), 16),
      parseInt(theme.primary.slice(3, 5), 16),
      parseInt(theme.primary.slice(5, 7), 16)
    );
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    
    // Logo ou nome da empresa
    if (budgetData.companyInfo.logoUrl) {
      try {
        // Dimensões limitadas para a logo sem redimensionar forçadamente
        const logoMaxWidth = 30;
        const logoMaxHeight = 15;
        pdf.addImage(budgetData.companyInfo.logoUrl, 'JPEG', margin, 5, logoMaxWidth, logoMaxHeight);
        pdf.text('ORÇAMENTO', margin + 35, 18);
      } catch {
        pdf.text(`${budgetData.companyInfo.name} - ORÇAMENTO`, margin, 18);
      }
    } else {
      pdf.text(`${budgetData.companyInfo.name || 'EMPRESA'} - ORÇAMENTO`, margin, 18);
    }

    // Data e número do orçamento
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const budgetNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    pdf.text(`Data: ${currentDate}`, pageWidth - margin - 40, 12);
    pdf.text(`Nº: ${budgetNumber}`, pageWidth - margin - 40, 18);
    
    // Número da página
    if (currentPage > 1) {
      pdf.text(`Página ${currentPage}`, pageWidth - margin - 20, pageHeight - 10);
    }
  };

  // Função para adicionar seção com fundo colorido
  const addSection = (title: string, yPos: number) => {
    pdf.setFillColor(
      parseInt(theme.primary.slice(1, 3), 16),
      parseInt(theme.primary.slice(3, 5), 16),
      parseInt(theme.primary.slice(5, 7), 16)
    );
    pdf.setFillColor(240, 248, 255); // Azul muito claro
    pdf.rect(margin, yPos - 5, contentWidth, 12, 'F');
    
    pdf.setTextColor(
      parseInt(theme.primary.slice(1, 3), 16),
      parseInt(theme.primary.slice(3, 5), 16),
      parseInt(theme.primary.slice(5, 7), 16)
    );
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 2, yPos + 3);
    
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

  // Seção de dados do cliente (mesmo tamanho que empresa)
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

Confiamos que nossa proposta atenderá perfeitamente às suas expectativas, oferecendo a melhor relação custo-benefício do mercado. Estamos prontos para transformar sua visão em realidade com todo o profissionalismo que você merece.`;

  const salesTextHeight = addWrappedText(salesText, margin + 2, yPosition, contentWidth - 4);
  yPosition += salesTextHeight + 15;

  // Tabela de itens
  checkPageBreak(30);
  addSection('DETALHAMENTO DOS SERVIÇOS', yPosition);
  yPosition += 15;

  // Cabeçalho da tabela
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, yPosition - 5, contentWidth, 10, 'F');
  
  // Bordas da tabela
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(margin, yPosition - 5, contentWidth, 10);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  // Colunas da tabela ajustadas
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
    
    // Linha alternada
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition - 4, contentWidth, 8, 'F');
    }
    
    // Bordas da linha
    pdf.setDrawColor(220, 220, 220);
    pdf.rect(margin, yPosition - 4, contentWidth, 8);
    
    // Conteúdo da linha
    const description = item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description;
    pdf.text(description, col1, yPosition);
    pdf.text(item.quantity.toString(), col2, yPosition);
    pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, col3, yPosition);
    // Alinhamento ajustado para o valor total não sair da caixa
    pdf.text(`R$ ${item.total.toFixed(2)}`, col4, yPosition);
    
    subtotal += item.total;
    yPosition += 8;
  });

  yPosition += 10;

  // Totais em caixa destacada
  checkPageBreak(40);
  
  // Caixa de totais
  pdf.setFillColor(248, 249, 250);
  pdf.setDrawColor(
    parseInt(theme.primary.slice(1, 3), 16),
    parseInt(theme.primary.slice(3, 5), 16),
    parseInt(theme.primary.slice(5, 7), 16)
  );
  pdf.rect(margin + 80, yPosition, contentWidth - 80, 35, 'FD');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  // Cor do texto corrigida para ser visível
  pdf.setTextColor(0, 0, 0);
  
  // Subtotal
  pdf.text('Subtotal:', margin + 85, yPosition + 8);
  pdf.text(`R$ ${subtotal.toFixed(2)}`, margin + 130, yPosition + 8);

  // Desconto
  if (budgetData.discount > 0) {
    pdf.text(`Desconto (${budgetData.discount}%):`, margin + 85, yPosition + 16);
    pdf.text(`-R$ ${(subtotal * budgetData.discount / 100).toFixed(2)}`, margin + 130, yPosition + 16);
  }

  // Total final
  const totalFinal = subtotal - (subtotal * budgetData.discount / 100);
  pdf.setFontSize(14);
  pdf.setTextColor(
    parseInt(theme.primary.slice(1, 3), 16),
    parseInt(theme.primary.slice(3, 5), 16),
    parseInt(theme.primary.slice(5, 7), 16)
  );
  pdf.text('TOTAL FINAL:', margin + 85, yPosition + 28);
  pdf.text(`R$ ${totalFinal.toFixed(2)}`, margin + 130, yPosition + 28);
  
  pdf.setTextColor(0, 0, 0);
  yPosition += 45;

  // Condições especiais
  checkPageBreak(30);
  addSection('CONDIÇÕES ESPECIAIS', yPosition);
  yPosition += 15;

  const conditionsHeight = addWrappedText(budgetData.specialConditions, margin + 2, yPosition, contentWidth - 4);
  yPosition += conditionsHeight + 15;

  // Observações
  checkPageBreak(30);
  addSection('OBSERVAÇÕES', yPosition);
  yPosition += 15;

  const observationsHeight = addWrappedText(budgetData.observations, margin + 2, yPosition, contentWidth - 4);
  yPosition += observationsHeight + 20;

  // Chamada para ação
  checkPageBreak(40);
  pdf.setFillColor(
    parseInt(theme.primary.slice(1, 3), 16),
    parseInt(theme.primary.slice(3, 5), 16),
    parseInt(theme.primary.slice(5, 7), 16)
  );
  pdf.rect(margin, yPosition - 5, contentWidth, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRONTO PARA COMEÇAR?', margin + 5, yPosition + 8);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const ctaText = `Este orçamento tem validade de ${budgetData.validityDays} dias. Entre em contato conosco para confirmar o pedido!`;
  const ctaHeight = addWrappedText(ctaText, margin + 5, yPosition + 18, contentWidth - 10);
  
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
};
