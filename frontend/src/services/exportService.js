//frontend/src/services/exportService.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format date for reports
const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate additional summary statistics not provided by totals
// REMOVED the unused 'totals' parameter since we only need 'data'
const calculateAdditionalSummary = (data) => {
  const highestCount = data.length > 0 ? Math.max(...data.map(item => item.count || 0)) : 0;
  const lowestCount = data.length > 0 ? Math.min(...data.map(item => item.count || 0)) : 0;
  
  const statusCounts = {
    approved: data.filter(item => item.status === 'approved').length,
    pending: data.filter(item => item.status === 'pending').length,
    draft: data.filter(item => item.status === 'draft').length,
    rejected: data.filter(item => item.status === 'rejected').length,
  };
  
  return {
    highestCount,
    lowestCount,
    statusCounts,
    totalOpportunities: data.length,
  };
};

// Export as CSV
export const exportToCSV = (data, filename = 'analytics-report') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = ['Opportunity Title', 'Applications', 'Status', 'Location'];
  const rows = data.map(item => [
    item.opportunityTitle,
    item.count,
    item.status,
    item.location || 'N/A',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as PDF with professional design
export const exportToPDF = (data, totals) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // FIXED: Removed 'totals' parameter since it's not needed in this function
  const additional = calculateAdditionalSummary(data);
  
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors (GrowthStage brand colors)
  const primaryColor = [3, 91, 157]; // #035b9d
  const secondaryColor = [100, 116, 139]; // #64748b

  // Header with branding
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GrowthStage Analytics Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${getFormattedDate()}`, 20, 32);
  doc.text('Application Volume Analysis', 20, 38);

  // Summary Section
  let yPos = 60;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos - 8, pageWidth - 40, 35, 'F');
  
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 25, yPos);
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryTexts = [
    `Total Applications: ${totals.totalApplications.toLocaleString()}`,
    `Active Opportunities: ${totals.activeOpportunities}`,
    `Average per Opportunity: ${totals.averagePerOpportunity}`,
    `Highest Applications: ${additional.highestCount}`,
    `Lowest Applications: ${additional.lowestCount}`,
  ];
  
  let textX = 25;
  summaryTexts.forEach((text, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    doc.text(text, textX + (col * 70), yPos + 10 + (row * 7));
  });

  yPos += 45;

  // Status Distribution Section
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Opportunity Status Distribution', 25, yPos + 1);
  
  yPos += 15;
  
  const statusColors = {
    approved: [34, 197, 94],
    pending: [245, 158, 11],
    draft: [156, 163, 175],
    rejected: [239, 68, 68],
  };
  
  const statusData = [
    ['Approved', additional.statusCounts.approved, statusColors.approved],
    ['Pending', additional.statusCounts.pending, statusColors.pending],
    ['Draft', additional.statusCounts.draft, statusColors.draft],
    ['Rejected', additional.statusCounts.rejected, statusColors.rejected],
  ];
  
  const barWidth = (pageWidth - 80) / 4;
  statusData.forEach((status, index) => {
    const x = 25 + (index * barWidth);
    const percentage = additional.totalOpportunities > 0 
      ? (status[1] / additional.totalOpportunities) * 100 
      : 0;
    
    doc.setFillColor(status[2][0], status[2][1], status[2][2]);
    doc.rect(x, yPos, barWidth - 5, 25, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(`${status[0]}`, x + 5, yPos + 12);
    doc.text(`${status[1]} (${percentage.toFixed(0)}%)`, x + 5, yPos + 20);
  });

  yPos += 40;

  // Detailed Data Table
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Opportunity Breakdown', 25, yPos + 1);

  // Prepare table data
  const tableData = data.map(item => [
    item.opportunityTitle,
    item.count.toString(),
    item.status.charAt(0).toUpperCase() + item.status.slice(1),
    item.location || 'N/A',
  ]);

  autoTable(doc, {
    startY: yPos + 10,
    head: [['Opportunity Title', 'Applications', 'Status', 'Location']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
    // eslint-disable-next-line no-unused-vars
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `GrowthStageSA | Confidential Analytics Report | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
    },
  });

  doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export as JSON
// FIXED: Now properly using both parameters
export const exportToJSON = (data, totals) => {
  // Both data and totals are now used
  const exportData = {
    generatedAt: new Date().toISOString(),
    exportedBy: "GrowthStage Analytics",
    version: "1.0",
    summary: {
      totalApplications: totals.totalApplications,
      activeOpportunities: totals.activeOpportunities,
      averagePerOpportunity: totals.averagePerOpportunity,
      totalOpportunities: data.length,
      statusDistribution: {
        approved: data.filter(item => item.status === 'approved').length,
        pending: data.filter(item => item.status === 'pending').length,
        draft: data.filter(item => item.status === 'draft').length,
        rejected: data.filter(item => item.status === 'rejected').length,
      },
    },
    opportunities: data.map(item => ({
      id: item.opportunityId,
      title: item.opportunityTitle,
      applications: item.count,
      status: item.status,
      location: item.location,
      breakdown: item.statusBreakdown,
    })),
    metadata: {
      recordCount: data.length,
      exportTimestamp: new Date().toISOString(),
      dataSource: "GrowthStage Analytics API",
    },
  };
  
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `analytics-data-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};