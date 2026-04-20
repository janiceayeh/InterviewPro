import { GET } from '@/app/api/copilot-chat/history/route'
import { POST as POST_SAVE } from '@/app/api/copilot-chat/save/route'
import { DELETE } from '@/app/api/copilot-chat/delete/route'
import { getAuth } from 'firebase/auth'
import { getDocs, doc, deleteDoc } from 'firebase/firestore'

jest.mock('firebase/auth')
jest.mock('firebase/firestore')

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>

describe('/api/copilot-chat endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAuth as jest.Mock).mockReturnValue({
      currentUser: {
        uid: 'test-user',
      },
    })
  })

  describe('GET /api/copilot-chat/history', () => {
    it('should return 401 when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({
        currentUser: null,
      })

      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return chat history for authenticated user', async () => {
      const mockChats = [
        {
          id: '1',
          userId: 'test-user',
          title: 'Interview Practice Session',
          messages: [],
          messageCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockGetDocs.mockResolvedValue({
        docs: mockChats.map((chat) => ({
          id: chat.id,
          data: () => chat,
          exists: () => true,
        })),
        empty: false,
        size: mockChats.length,
      } as any)

      const response = await GET()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should return empty array when user has no chats', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
        empty: true,
        size: 0,
      } as any)

      const response = await GET()
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual([])
    })
  })

  describe('POST /api/copilot-chat/save', () => {
    it('should save a new chat session', async () => {
      const request = new Request('http://localhost:3000/api/copilot-chat/save', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Chat',
          messages: [],
        }),
      })

      const response = await POST_SAVE(request)
      expect(response.status).toBe(200)
    })

    it('should update existing chat session', async () => {
      const request = new Request('http://localhost:3000/api/copilot-chat/save', {
        method: 'POST',
        body: JSON.stringify({
          chatId: 'existing-id',
          title: 'Updated Chat',
          messages: [
            {
              role: 'user',
              parts: [{ type: 'text', text: 'Hello' }],
            },
          ],
        }),
      })

      const response = await POST_SAVE(request)
      expect(response.status).toBe(200)
    })

    it('should return 401 when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({
        currentUser: null,
      })

      const request = new Request('http://localhost:3000/api/copilot-chat/save', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Chat',
          messages: [],
        }),
      })

      const response = await POST_SAVE(request)
      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/copilot-chat/delete', () => {
    it('should delete a chat session', async () => {
      mockDeleteDoc.mockResolvedValue(undefined)

      const request = new Request(
        'http://localhost:3000/api/copilot-chat/delete?id=chat-id',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      expect(response.status).toBe(200)
    })

    it('should return 401 when user is not authenticated', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({
        currentUser: null,
      })

      const request = new Request(
        'http://localhost:3000/api/copilot-chat/delete?id=chat-id',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      expect(response.status).toBe(401)
    })

    it('should return 400 when chat ID is not provided', async () => {
      const request = new Request(
        'http://localhost:3000/api/copilot-chat/delete',
        {
          method: 'DELETE',
        }
      )

      const response = await DELETE(request)
      expect(response.status).toBe(400)
    })
  })
})
