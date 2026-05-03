import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmployerApplicationCard from '../components/employer/EmployerApplicationCard';

describe('EmployerApplicationCard', () => {
  const mockOnShortlist = vi.fn();
  const mockOnOffer = vi.fn();
  const mockOnReject = vi.fn();

  const mockApplication = {
    applicationId: 'app-123',
    status: 'received',
    appliedAt: '2024-01-15T10:00:00Z',
    applicant: {
      name: 'John Doe',
      email: 'john@example.com',
      location: 'Cape Town',
      nqfLevel: 7,
      bio: 'Experienced React developer',
      cvUrl: 'https://storage/cv.pdf'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display applicant name', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('should display applicant email', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText('john@example.com')).toBeDefined();
  });

  it('should display location when provided', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal details
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('📍 Cape Town')).toBeDefined();
  });

  it('should display NQF level when provided', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal details
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('🎓 NQF 7')).toBeDefined();
  });

  it('should show Shortlist and Reject buttons for received status', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal action buttons
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('⭐ Shortlist')).toBeDefined();
    expect(screen.getByText('❌ Reject')).toBeDefined();
  });

  it('should show Accept and Reject buttons for shortlisted status', () => {
    const shortlistedApp = { ...mockApplication, status: 'shortlisted' };
    render(
      <EmployerApplicationCard
        application={shortlistedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal action buttons
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('📩 Send Offer')).toBeDefined();
    expect(screen.getByText('❌ Reject')).toBeDefined();
  });

  it('should display offer sent state when status is offered', () => {
    const offeredApp = { ...mockApplication, status: 'offered' };
    render(
      <EmployerApplicationCard
        application={offeredApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // header shows status label, but expand to see the message body
    expect(screen.getByText('📩 Offer Sent')).toBeDefined();
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText(/waiting for the applicant's response/i)).toBeDefined();
  });

  it('should call onShortlist when Shortlist button clicked', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal action buttons
    fireEvent.click(screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('⭐ Shortlist'));
    expect(mockOnShortlist).toHaveBeenCalledWith('app-123');
  });

  it('should call onOffer when Offer button clicked', () => {
    const shortlistedApp = { ...mockApplication, status: 'shortlisted' };
    render(
      <EmployerApplicationCard
        application={shortlistedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal action buttons
    fireEvent.click(screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('📩 Send Offer'));
    expect(mockOnOffer).toHaveBeenCalledWith('app-123');
  });

  it('should call onReject when Reject button clicked', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    // expand card to reveal action buttons
    fireEvent.click(screen.getByText('John Doe'));
    fireEvent.click(screen.getByText('❌ Reject'));
    expect(mockOnReject).toHaveBeenCalledWith('app-123');
  });
});