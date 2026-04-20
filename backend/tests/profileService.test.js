import { jest } from '@jest/globals';

// Simple mock: each chained method returns the same object, final methods return Promises
const createQueryChain = () => {
  const chain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    update: jest.fn(() => chain),
    upsert: jest.fn(() => chain),
    insert: jest.fn(() => chain),
  };
  return chain;
};

const supabaseMock = {
  from: jest.fn(() => createQueryChain()),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      createSignedUrl: jest.fn(),
    })),
  },
};

jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: supabaseMock,
}));

const {
  getApplicantProfileByUserId,
  upsertApplicantProfileByUserId,
  uploadApplicantCV,
  saveApplicantCVPath,
  deleteApplicantCVIfExists,
  getApplicantCVSignedUrl,
  addApplicantQualificationByUserId,
} = await import('../src/services/profileService.js');

describe('profileService', () => {
  let queryChain;

  beforeEach(() => {
    jest.clearAllMocks();
    queryChain = createQueryChain();
    supabaseMock.from.mockReturnValue(queryChain);
  });

  describe('getApplicantProfileByUserId', () => {
    const mockProfile = { id: 'p123', full_name: 'John', email: 'john@x.com', role: 'applicant' };
    const mockApplicant = { id: 'a123', bio: 'dev', location: 'GP', nqf_level: 7, cv_url: 'cv.pdf' };
    const mockQualifications = [
      { id: 1, qualification_id: 'q1', qualifications: { title: 'BSc', nqf_level: 7, field: 'IT', subfield: 'Dev' }, status: 'done', originator: 'Uni', date_obtained: '2023' }
    ];

    test('returns full profile with qualifications', async () => {
      queryChain.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockApplicant, error: null });
      queryChain.select.mockResolvedValueOnce({ data: mockQualifications, error: null });

      const result = await getApplicantProfileByUserId('user-123');

      expect(result.user_id).toBe('user-123');
      expect(result.qualifications).toHaveLength(1);
      expect(supabaseMock.from).toHaveBeenCalledTimes(3);
    });

    test('handles no qualifications', async () => {
      queryChain.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockApplicant, error: null });
      queryChain.select.mockResolvedValueOnce({ data: null, error: null });

      const result = await getApplicantProfileByUserId('user-123');
      expect(result.qualifications).toEqual([]);
    });

    test('throws when profile not found', async () => {
      queryChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Profile not found' } });
      await expect(getApplicantProfileByUserId('user-123')).rejects.toThrow('Profile not found');
    });
  });

  describe('upsertApplicantProfileByUserId', () => {
    const mockProfile = { id: 'p123' };
    const mockUpsertResult = { id: 'a123', bio: 'dev', location: 'GP', nqf_level: 7 };

    test('upserts successfully', async () => {
      queryChain.single.mockResolvedValueOnce({ data: mockProfile, error: null });
      queryChain.update.mockResolvedValueOnce({ error: null });
      queryChain.upsert.mockReturnValue({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockUpsertResult, error: null }),
        })),
      });

      const payload = { full_name: 'John', surname: 'Doe', bio: 'dev', location: 'GP', nqf_level: 7 };
      const result = await upsertApplicantProfileByUserId('user-123', payload);
      expect(result).toEqual(mockUpsertResult);
    });

    test('throws when profile missing', async () => {
      queryChain.single.mockResolvedValueOnce({ data: null, error: { message: 'Profile missing' } });
      await expect(upsertApplicantProfileByUserId('user-123', {})).rejects.toThrow('Profile missing');
    });
  });

  describe('uploadApplicantCV', () => {
    const mockFile = { originalname: 'resume.pdf', buffer: Buffer.from('pdf'), mimetype: 'application/pdf' };
    const mockUpload = jest.fn();

    beforeEach(() => {
      supabaseMock.storage.from.mockReturnValue({ upload: mockUpload });
    });

    test('uploads successfully', async () => {
      mockUpload.mockResolvedValue({ data: { path: 'applicants/user-123/123-resume.pdf' }, error: null });
      const result = await uploadApplicantCV('user-123', mockFile);
      expect(result).toContain('applicants/user-123/');
    });

    test('throws when no file', async () => {
      await expect(uploadApplicantCV('user-123', null)).rejects.toThrow('No file provided');
    });

    test('throws on upload error', async () => {
      mockUpload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } });
      await expect(uploadApplicantCV('user-123', mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('saveApplicantCVPath', () => {
    const mockProfile = { id: 'p123' };
    const mockResult = { id: 'a123', cv_url: 'path/to/cv.pdf' };

    test('saves path successfully', async () => {
      queryChain.single.mockResolvedValueOnce({ data: mockProfile, error: null });
      queryChain.upsert.mockReturnValue({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockResult, error: null }),
        })),
      });

      const result = await saveApplicantCVPath('user-123', 'path/to/cv.pdf');
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteApplicantCVIfExists', () => {
    const mockProfile = { id: 'p123' };
    const mockApplicant = { cv_url: 'path/to/cv.pdf' };
    const mockRemove = jest.fn();

    beforeEach(() => {
      supabaseMock.storage.from.mockReturnValue({ remove: mockRemove });
    });

    test('deletes CV when exists', async () => {
      queryChain.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockApplicant, error: null });
      mockRemove.mockResolvedValue({ error: null });

      const result = await deleteApplicantCVIfExists('user-123');
      expect(result).toBe('path/to/cv.pdf');
    });

    test('returns null when no CV', async () => {
      queryChain.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const result = await deleteApplicantCVIfExists('user-123');
      expect(result).toBeNull();
    });
  });

  describe('getApplicantCVSignedUrl', () => {
    const mockSignedUrl = jest.fn();

    beforeEach(() => {
      supabaseMock.storage.from.mockReturnValue({ createSignedUrl: mockSignedUrl });
    });

    test('returns signed URL', async () => {
      mockSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.url' }, error: null });
      const result = await getApplicantCVSignedUrl('path/to/cv.pdf');
      expect(result).toBe('https://signed.url');
    });
  });

  describe('addApplicantQualificationByUserId', () => {
    const mockProfile = { id: 'p123' };
    const mockApplicant = { id: 'a123' };
    const mockQualification = { id: 'q123', qualification_name: 'BSc CS', status: 'completed' };

    test('adds custom qualification', async () => {
      queryChain.single
        .mockResolvedValueOnce({ data: mockProfile, error: null })
        .mockResolvedValueOnce({ data: mockApplicant, error: null });
      queryChain.insert.mockReturnValue({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: mockQualification, error: null }),
        })),
      });

      const payload = { custom_name: 'BSc CS', custom_nqf_level: 7, custom_field: 'IT', status: 'completed', date_obtained: '2023' };
      const result = await addApplicantQualificationByUserId('user-123', payload);
      expect(result).toEqual(mockQualification);
    });

    test('throws when missing name/id', async () => {
      await expect(addApplicantQualificationByUserId('user-123', {})).rejects.toThrow('Either qualification_id or custom_name must be provided');
    });
  });
});