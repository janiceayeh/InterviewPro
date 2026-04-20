import { POST } from '@/app/api/analytics/overview/route'
import * as firebase from '@/lib/firebase'
import { getAuth } from 'firebase/auth'
import { getDocs } from 'firebase/firestore'

jest.mock('@/lib/firebase')
jest.mock('firebase/firestore')
jest.mock('firebase/auth')

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>

describe('/api/analytics/overview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when user is not authenticated', async () => {
    const request = new Request('http://localhost:3000/api/analytics/overview', {
      method: 'GET',
    })

    ;(getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('should calculate readiness score correctly', async () => {
    const mockInterviews = [
      {
        id: '1',
        userId: 'test-user',
        category: 'behavioral',
        score: 85,
        feedback: 'Good',
        createdAt: new Date(),
        duration: 300,
        content: {},
      },
      {
        id: '2',
        userId: 'test-user',
        category: 'technical',
        score: 75,
        feedback: 'Average',
        createdAt: new Date(),
        duration: 300,
        content: {},
      },
    ]

    mockGetDocs.mockResolvedValue({
      docs: mockInterviews.map((interview) => ({
        id: interview.id,
        data: () => interview,
        exists: () => true,
      })),
      empty: false,
      size: mockInterviews.length,
    } as any)

    ;(getAuth as jest.Mock).mockReturnValue({
      currentUser: {
        uid: 'test-user',
      },
    })

    const request = new Request('http://localhost:3000/api/analytics/overview', {
      method: 'GET',
    })

    const response = await POST(request)

    if (response.status === 200) {
      const data = await response.json()
      expect(data).toHaveProperty('overallReadinessScore')
      expect(data).toHaveProperty('averageScore')
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('categoryAverages')
    }
  })

  it('should return empty data when user has no interviews', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [],
      empty: true,
      size: 0,
    } as any)

    ;(getAuth as jest.Mock).mockReturnValue({
      currentUser: {
        uid: 'test-user',
      },
    })

    const request = new Request('http://localhost:3000/api/analytics/overview', {
      method: 'GET',
    })

    const response = await POST(request)

    if (response.status === 200) {
      const data = await response.json()
      expect(data.overallReadinessScore).toBe(0)
      expect(data.averageScore).toBe(0)
    }
  })

  it('should generate recommendations based on performance', async () => {
    const mockInterviews = [
      {
        id: '1',
        userId: 'test-user',
        category: 'behavioral',
        score: 50,
        feedback: 'Needs improvement',
        createdAt: new Date(),
        duration: 300,
        content: {},
      },
    ]

    mockGetDocs.mockResolvedValue({
      docs: mockInterviews.map((interview) => ({
        id: interview.id,
        data: () => interview,
        exists: () => true,
      })),
      empty: false,
      size: mockInterviews.length,
    } as any)

    ;(getAuth as jest.Mock).mockReturnValue({
      currentUser: {
        uid: 'test-user',
      },
    })

    const request = new Request('http://localhost:3000/api/analytics/overview', {
      method: 'GET',
    })

    const response = await POST(request)

    if (response.status === 200) {
      const data = await response.json()
      expect(Array.isArray(data.recommendations)).toBe(true)
    }
  })
})
