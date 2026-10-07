import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/storage';

describe('useComponentGenerator 영속성', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('저장된 컴포넌트를 복원하고 createdAt을 Date로 되돌린다', () => {
    localStorage.setItem(
      STORAGE_KEYS.components,
      JSON.stringify([
        { id: '1', prompt: 'p', code: 'c', createdAt: '2024-01-01T00:00:00.000Z' },
      ]),
    );
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('저장된 데이터가 배열이 아니면 빈 목록으로 시작한다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify({ broken: true }));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toEqual([]);
  });

  it('생성한 컴포넌트가 localStorage에 저장된다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ code: 'render(<div />)' }) })),
    );
    const { result } = renderHook(() => useComponentGenerator());

    await act(() => result.current.generate('카드', undefined, 'google'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.components) ?? '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].prompt).toBe('카드');
    });
  });

  it('전체 삭제하면 저장된 목록도 비워진다', () => {
    localStorage.setItem(
      STORAGE_KEYS.components,
      JSON.stringify([{ id: '1', prompt: 'p', code: 'c', createdAt: '2024-01-01T00:00:00.000Z' }]),
    );
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.clearAll());

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.components)!)).toEqual([]);
  });
});
