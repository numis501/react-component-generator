import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  beforeEach(() => localStorage.clear());

  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 그 값으로 시작한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값이 바뀌면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe('"next"');
  });

  it('revive 함수로 저장된 값을 복원한다', () => {
    localStorage.setItem('k', JSON.stringify(['2024-01-01T00:00:00.000Z']));
    const { result } = renderHook(() =>
      usePersistentState<Date[]>('k', [], (raw) => (raw as string[]).map((s) => new Date(s))),
    );
    expect(result.current[0][0]).toBeInstanceOf(Date);
  });
});
