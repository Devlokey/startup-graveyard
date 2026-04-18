import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCreateServerClient } = vi.hoisted(() => ({
  mockCreateServerClient: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  createServerClient: mockCreateServerClient,
}))

import { ingestStartup } from '../../crawler/ingest'
import type { ExtractedStartup } from '../../crawler/extract'

const startup: ExtractedStartup = {
  name: 'LearnX',
  sector: 'Edtech',
  funding_inr: 12000,
  founded_year: 2019,
  shutdown_date: '2024-03-01',
  reason: 'Poor unit economics',
  failure_tag: 'Overfunded',
  source_url: 'https://inc42.com/learnx',
  source_name: 'inc42',
}

function setupSupabaseMock(existingRow: object | null, insertError: object | null = null) {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: existingRow, error: null })
  const ilikeMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock })
  const insertMock = vi.fn().mockResolvedValue({ error: insertError })
  const fromMock = vi.fn().mockReturnValue({ select: selectMock, insert: insertMock })
  mockCreateServerClient.mockReturnValue({ from: fromMock })
  return { insertMock, fromMock }
}

describe('ingestStartup', () => {
  beforeEach(() => {
    mockCreateServerClient.mockReset()
  })

  it('inserts a new startup and returns "inserted"', async () => {
    const { insertMock } = setupSupabaseMock(null)
    const result = await ingestStartup(startup)
    expect(result).toBe('inserted')
    expect(insertMock).toHaveBeenCalledOnce()
  })

  it('returns "duplicate" if startup name already exists', async () => {
    const { insertMock } = setupSupabaseMock({ id: 'existing-uuid' })
    const result = await ingestStartup(startup)
    expect(result).toBe('duplicate')
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('returns "error" if Supabase insert fails', async () => {
    setupSupabaseMock(null, { message: 'DB error' })
    const result = await ingestStartup(startup)
    expect(result).toBe('error')
  })
})
