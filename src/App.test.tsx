import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/storage';

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/config') {
        return { ok: true, json: async () => ({ envKeys: { anthropic: false, google: false } }) };
      }
      return { ok: true, json: async () => ({ code: 'render(<div>ok</div>)' }) };
    }),
  );
}

describe('App 영속성', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch();
  });

  it('저장된 Provider를 복원한다', () => {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });

  it('Provider 선택이 localStorage에 저장된다', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.provider)!)).toBe('anthropic');
  });

  it('저장된 API 키를 현재 Provider 기준으로 복원한다', () => {
    localStorage.setItem(
      STORAGE_KEYS.apiKeys,
      JSON.stringify({ anthropic: 'sk-ant-1', google: 'AIza-1' }),
    );
    render(<App />);
    expect(screen.getByLabelText('API Key')).toHaveValue('AIza-1');
  });

  it('Provider를 바꾸면 해당 Provider의 키가 보이고, 입력한 키는 저장된다', async () => {
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify({ anthropic: 'sk-ant-1' }));
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(screen.getByLabelText('API Key')).toHaveValue('sk-ant-1');

    await user.selectOptions(screen.getByLabelText('Provider'), 'google');
    await user.type(screen.getByLabelText('API Key'), 'AIza-2');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiKeys)!);
    expect(saved).toEqual({ anthropic: 'sk-ant-1', google: 'AIza-2' });
  });

  it('생성한 프롬프트가 히스토리에 저장되고 새로고침 후에도 보인다', async () => {
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify({ google: 'AIza-1' }));
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.type(screen.getByRole('textbox', { name: '' }), '프로필 카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.promptHistory)!)).toEqual(['프로필 카드']);
    });

    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: '프로필 카드' })).toBeInTheDocument();
    expect(screen.getByText('생성된 컴포넌트 1개')).toBeInTheDocument();
  });
});
