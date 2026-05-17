import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import EmployerApplicationCard from '../components/employer/EmployerApplicationCard';
import * as employerApplicationService from '../services/employerApplicationService';

vi.mock('../services/employerApplicationService', async () => {
  const actual = await vi.importActual('../services/employerApplicationService');
  return {
    ...actual,
    getApplicationDetails: vi.fn(),
    getApplicationCvSignedUrl: vi.fn(),
  };
});

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
    employerApplicationService.getApplicationDetails.mockResolvedValue({
      success: true,
      applicantSkills: [],
      qualifications: [],
    });
    employerApplicationService.getApplicationCvSignedUrl.mockResolvedValue({
      success: true,
      signed_url: null,
    });
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

  it('should display match percentage for decimal scores', () => {
    const matchedApp = { ...mockApplication, matchScore: 0.86 };

    render(
      <EmployerApplicationCard
        application={matchedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );

    expect(
      screen.getByText((_, element) => element?.textContent === 'Match: 86%')
    ).toBeDefined();
  });

  it('should hide match percentage for invalid scores', () => {
    const invalidMatchApp = { ...mockApplication, matchScore: 'not-a-number' };

    render(
      <EmployerApplicationCard
        application={invalidMatchApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );

    expect(screen.queryByText(/Match:/i)).toBeNull();
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

  it('should display accepted status', () => {
    const acceptedApp = { ...mockApplication, status: 'accepted' };
    render(
      <EmployerApplicationCard
        application={acceptedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText('✅ Accepted')).toBeDefined();
  });

  it('should display rejected status', () => {
    const rejectedApp = { ...mockApplication, status: 'rejected' };
    render(
      <EmployerApplicationCard
        application={rejectedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText('❌ Rejected')).toBeDefined();
  });

  it('should fall back to received status config for unknown status', () => {
    const unknownStatusApp = { ...mockApplication, status: 'archived' };

    render(
      <EmployerApplicationCard
        application={unknownStatusApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );

    expect(screen.getByText('⏳ Pending Review')).toBeDefined();
  });

  it('should not show action buttons for accepted status', () => {
    const acceptedApp = { ...mockApplication, status: 'accepted' };
    render(
      <EmployerApplicationCard
        application={acceptedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.queryByText('⭐ Shortlist')).toBeNull();
    expect(screen.queryByText('📩 Send Offer')).toBeNull();
  });

  it('should disable buttons when processing', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        isProcessing={true}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    const shortlistBtn = screen.getByText('⭐ Shortlist').closest('button');
    expect(shortlistBtn?.disabled).toBe(true);
  });

  it('should display applied date', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText(/Applied/i)).toBeDefined();
  });

  it('should display shortlisted status message when expanded', () => {
    const shortlistedApp = { ...mockApplication, status: 'shortlisted' };
    render(
      <EmployerApplicationCard
        application={shortlistedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText(/Candidate has been shortlisted/i)).toBeDefined();
  });

  it('should display offered status message when expanded', () => {
    const offeredApp = { ...mockApplication, status: 'offered' };
    render(
      <EmployerApplicationCard
        application={offeredApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText(/Offer has been sent/i)).toBeDefined();
  });

  it('should display accepted status message when expanded', () => {
    const acceptedApp = { ...mockApplication, status: 'accepted' };
    render(
      <EmployerApplicationCard
        application={acceptedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText(/Candidate has accepted the offer/i)).toBeDefined();
  });

  it('should display rejected status message when expanded', () => {
    const rejectedApp = { ...mockApplication, status: 'rejected' };
    render(
      <EmployerApplicationCard
        application={rejectedApp}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText(/This application has been rejected/i)).toBeDefined();
  });

  it('should handle applicant without location', () => {
    const appNoLocation = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, location: null }
    };
    render(
      <EmployerApplicationCard
        application={appNoLocation}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.queryByText(/📍/)).toBeNull();
  });

  it('should handle applicant without bio', () => {
    const appNoBio = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, bio: null }
    };
    render(
      <EmployerApplicationCard
        application={appNoBio}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.queryByText('About')).toBeNull();
  });

  it('should expand to show applicant details', () => {
    const appWithBio = {
      ...mockApplication,
      applicant: { 
        ...mockApplication.applicant, 
        bio: 'Experienced React developer',
        applicantProfileId: null
      }
    };

    render(
      <EmployerApplicationCard
        application={appWithBio}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    
    // Initially not expanded
    expect(screen.queryByText('Experienced React developer')).toBeNull();
    
    // Click to expand
    fireEvent.click(screen.getByText('John Doe'));
    
    // Now bio should be visible
    expect(screen.getByText('Experienced React developer')).toBeDefined();
  });

  it('should not fetch details when applicantProfileId is missing', () => {
    const appWithoutProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: null }
    };

    render(
      <EmployerApplicationCard
        application={appWithoutProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );

    fireEvent.click(screen.getByText('John Doe'));

    expect(employerApplicationService.getApplicationDetails).not.toHaveBeenCalled();
  });

  it('should show loading state while fetching applicant details', async () => {
    let resolveDetails;
    const pendingDetails = new Promise((resolve) => {
      resolveDetails = resolve;
    });

    employerApplicationService.getApplicationDetails.mockReturnValueOnce(pendingDetails);

    const appWithProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: 'profile-123' }
    };

    render(
      <EmployerApplicationCard
        application={appWithProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        token="test-token"
      />
    );

    fireEvent.click(screen.getByText('John Doe'));

    expect(await screen.findByText(/Loading profile details/i)).toBeDefined();

    resolveDetails({ success: true, applicantSkills: [], qualifications: [] });

    await waitFor(() => {
      expect(screen.queryByText(/Loading profile details/i)).toBeNull();
    });
  });

  it('should render fetched skills, qualifications, and CV link', async () => {
    employerApplicationService.getApplicationDetails.mockResolvedValueOnce({
      success: true,
      applicantSkills: [{ id: 1, title: 'React' }],
      qualifications: [
        {
          id: 'q1',
          title: 'BSc Computer Science',
          field: 'Computer Science',
          nqf_level: 7,
          status: 'completed',
        },
      ],
    });
    employerApplicationService.getApplicationCvSignedUrl.mockResolvedValueOnce({
      success: true,
      signed_url: 'https://signed-url.com/cv.pdf',
    });

    const appWithProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: 'profile-123' }
    };

    render(
      <EmployerApplicationCard
        application={appWithProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        token="test-token"
      />
    );

    fireEvent.click(screen.getByText('John Doe'));

    expect(await screen.findByText('React')).toBeDefined();
    expect(screen.getByText('BSc Computer Science')).toBeDefined();

    const qualificationsSection = screen.getByText('Qualifications').closest('section');
    expect(qualificationsSection).not.toBeNull();
    expect(
      within(qualificationsSection).getByText(
        (_, element) => element?.textContent?.trim() === 'NQF 7'
      )
    ).toBeDefined();

    const cvLink = await screen.findByRole('link', { name: /CV \/ Resume/i });
    expect(cvLink).toHaveAttribute('href', 'https://signed-url.com/cv.pdf');
  });

  it('should fetch and display cv uploads section', async () => {
    employerApplicationService.getApplicationDetails.mockResolvedValueOnce({
      success: true,
      applicantSkills: [],
      qualifications: [],
    });
    employerApplicationService.getApplicationCvSignedUrl.mockResolvedValueOnce({
      success: true,
      signed_url: 'https://signed-url.com/cv.pdf',
    });

    const appWithProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: 'profile-123' }
    };

    render(
      <EmployerApplicationCard
        application={appWithProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        token="test-token"
      />
    );
    
    fireEvent.click(screen.getByText('John Doe'));
    
    // Uploads section should exist
    expect(screen.getByText('Uploads')).toBeDefined();
  });

  it('should handle multiple expanded states', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    
    // Expand
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('📍 Cape Town')).toBeDefined();
    
    // Collapse
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.queryByText('📍 Cape Town')).toBeNull();
    
    // Expand again
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('📍 Cape Town')).toBeDefined();
  });

  it('should display CV upload section', async () => {
    employerApplicationService.getApplicationDetails.mockResolvedValueOnce({
      success: true,
      applicantSkills: [],
      qualifications: [],
    });
    employerApplicationService.getApplicationCvSignedUrl.mockResolvedValueOnce({
      success: true,
      signed_url: 'https://signed-url.com/cv.pdf',
    });

    const appWithProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: 'profile-123' }
    };

    render(
      <EmployerApplicationCard
        application={appWithProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        token="test-token"
      />
    );
    
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(screen.getByText('Uploads')).toBeDefined();
  });

  it('handle fetch error gracefully', async () => {
    employerApplicationService.getApplicationDetails.mockRejectedValueOnce(new Error('Network error'));

    const appWithProfileId = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, applicantProfileId: 'profile-123' }
    };

    render(
      <EmployerApplicationCard
        application={appWithProfileId}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
        token="test-token"
      />
    );
    
    fireEvent.click(screen.getByText('John Doe'));
    
    // Component should still render without crashing
    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('should toggle expand/collapse on header click', () => {
    render(
      <EmployerApplicationCard
        application={mockApplication}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    
    // Initially collapsed - should not see location
    expect(screen.queryByText('📍 Cape Town')).toBeNull();
    
    // Click to expand
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.getByText('📍 Cape Town')).toBeDefined();
    
    // Click to collapse
    fireEvent.click(screen.getByText('John Doe'));
    expect(screen.queryByText('📍 Cape Town')).toBeNull();
  });

  it('should handle applicant with no surname', () => {
    const appNoSurname = {
      ...mockApplication,
      applicant: { ...mockApplication.applicant, surname: null }
    };
    render(
      <EmployerApplicationCard
        application={appNoSurname}
        onShortlist={mockOnShortlist}
        onOffer={mockOnOffer}
        onReject={mockOnReject}
      />
    );
    expect(screen.getByText('John Doe')).toBeDefined();
  });
});