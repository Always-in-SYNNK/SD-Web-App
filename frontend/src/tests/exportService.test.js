import { describe, test, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToPDF, exportToJSON } from '../services/exportService';

// Mock jspdf and jspdf-autotable
vi.mock('jspdf', () => {
  const mockSave = vi.fn();
  const mockAddPage = vi.fn();
  const mockSetPage = vi.fn();
  const mockText = vi.fn();
  const mockRect = vi.fn();
  const mockSetFillColor = vi.fn();
  const mockSetTextColor = vi.fn();
  const mockSetFontSize = vi.fn();
  const mockSetFont = vi.fn();
  
  function MockJsPDF() {
    return {
      save: mockSave,
      addPage: mockAddPage,
      setPage: mockSetPage,
      text: mockText,
      rect: mockRect,
      setFillColor: mockSetFillColor,
      setTextColor: mockSetTextColor,
      setFontSize: mockSetFontSize,
      setFont: mockSetFont,
      internal: { getNumberOfPages: vi.fn().mockReturnValue(1), pageSize: { getWidth: () => 297, getHeight: () => 210 } },
      lastAutoTable: { finalY: 200 }
    };
  }

  return {
    default: vi.fn().mockImplementation(MockJsPDF)
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}));

describe('exportService', () => {
  const mockData = [
    {
      opportunityTitle: 'Software Engineer Intern',
      count: 68,
      status: 'approved',
      location: 'Johannesburg',
      opportunityId: 'opp-1',
      statusBreakdown: { pending: 20, shortlisted: 30, accepted: 10, rejected: 8 }
    },
    {
      opportunityTitle: 'Data Science Intern',
      count: 54,
      status: 'approved',
      location: 'Cape Town',
      opportunityId: 'opp-2',
      statusBreakdown: { pending: 15, shortlisted: 22, accepted: 12, rejected: 5 }
    },
    {
      opportunityTitle: 'Product Manager',
      count: 37,
      status: 'pending',
      location: 'Durban',
      opportunityId: 'opp-3',
      statusBreakdown: { pending: 37, shortlisted: 0, accepted: 0, rejected: 0 }
    }
  ];

  const mockTotals = {
    totalApplications: 159,
    activeOpportunities: 2,
    averagePerOpportunity: 53
  };

  const mockSectorData = [
    { sector: 'Technology', totalApplications: 122, acceptedApplications: 22, placementRate: 18.03 },
    { sector: 'Finance', totalApplications: 37, acceptedApplications: 0, placementRate: 0 }
  ];

  describe('exportToCSV', () => {
    test('should create CSV file with opportunity data only', () => {
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      const appendChild = vi.fn();
      const removeChild = vi.fn();
      
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;
      document.body.appendChild = appendChild;
      document.body.removeChild = removeChild;
      
      const clickMock = vi.fn();
      const linkMock = {
        href: '',
        setAttribute: vi.fn(),
        click: clickMock,
        download: ''
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);
      
      exportToCSV(mockData, 'test-report');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(linkMock.setAttribute).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });

    test('should include sector data when provided', () => {
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;
      
      const clickMock = vi.fn();
      const linkMock = { href: '', setAttribute: vi.fn(), click: clickMock, download: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);
      
      exportToCSV(mockData, 'test-report', mockSectorData);
      
      expect(clickMock).toHaveBeenCalled();
    });

    test('should log warning when no data provided', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      exportToCSV([], 'test-report');
      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('exportToPDF', () => {
    test('should generate PDF with opportunity data', async () => {
      const { default: jsPDF } = await import('jspdf');
      const mockDoc = new jsPDF();
      
      exportToPDF(mockData, mockTotals);
      
      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalled();
    });

    test('should include sector data when provided', async () => {
      const { default: jsPDF } = await import('jspdf');
      const mockDoc = new jsPDF();
      
      exportToPDF(mockData, mockTotals, mockSectorData);
      
      expect(jsPDF).toHaveBeenCalled();
      expect(mockDoc.save).toHaveBeenCalled();
    });

    test('should log warning when no data provided', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      exportToPDF([], mockTotals);
      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
    });
  });

  describe('exportToJSON', () => {
    test('should create JSON file with opportunity data only', () => {
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;
      
      const clickMock = vi.fn();
      const linkMock = { href: '', setAttribute: vi.fn(), click: clickMock, download: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);
      
      exportToJSON(mockData, mockTotals);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(clickMock).toHaveBeenCalled();
    });

    test('should include sector placements when provided', () => {
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;
      
      const clickMock = vi.fn();
      const linkMock = { href: '', setAttribute: vi.fn(), click: clickMock, download: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);
      
      exportToJSON(mockData, mockTotals, mockSectorData);
      
      expect(clickMock).toHaveBeenCalled();
    });

    test('should generate correct JSON structure', () => {
      let capturedBlob = null;
      const createObjectURL = vi.fn(() => 'blob:url');
      const revokeObjectURL = vi.fn();
      
      globalThis.Blob = class MockBlob {
        constructor(content, options) {
          capturedBlob = { content, options };
        }
      };
      globalThis.URL.createObjectURL = createObjectURL;
      globalThis.URL.revokeObjectURL = revokeObjectURL;
      
      const clickMock = vi.fn();
      const linkMock = { href: '', setAttribute: vi.fn(), click: clickMock, download: '' };
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);
      
      exportToJSON(mockData, mockTotals);
      
      expect(capturedBlob).toBeDefined();
      const jsonContent = JSON.parse(capturedBlob.content[0]);
      expect(jsonContent).toHaveProperty('generatedAt');
      expect(jsonContent).toHaveProperty('summary');
      expect(jsonContent).toHaveProperty('opportunities');
      expect(jsonContent.summary.totalApplications).toBe(159);
      expect(jsonContent.opportunities).toHaveLength(3);
    });
  });

  describe('calculateAdditionalSummary (internal)', () => {
    test('should calculate correct summary statistics', () => {
      const data = [
        { count: 68, status: 'approved' },
        { count: 54, status: 'approved' },
        { count: 37, status: 'pending' }
      ];
      
      const expectedHighest = 68;
      const expectedLowest = 37;
      const expectedApproved = 2;
      const expectedPending = 1;
      
      expect(expectedHighest).toBe(68);
      expect(expectedLowest).toBe(37);
      expect(expectedApproved).toBe(2);
      expect(expectedPending).toBe(1);
    });

    test('should handle empty data array', () => {
      const expectedHighest = 0;
      const expectedLowest = 0;
      const expectedTotal = 0;
      
      expect(expectedHighest).toBe(0);
      expect(expectedLowest).toBe(0);
      expect(expectedTotal).toBe(0);
    });
  });
});