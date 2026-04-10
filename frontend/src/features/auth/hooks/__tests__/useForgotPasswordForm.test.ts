import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

// Mock the mutation hook
vi.mock('../../api/useRecoveryPasswordMutation', () => ({
    useRecoveryPasswordMutation: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock antd Form
vi.mock('antd', () => ({
    Form: {
        useForm: () => [
            {
                validateFields: vi.fn(),
                resetFields: vi.fn(),
            },
        ],
    },
}));

import { useRecoveryPasswordMutation } from '../../api/useRecoveryPasswordMutation';
import { useForgotPasswordForm } from '../useForgotPasswordForm';

const mockUseRecoveryPasswordMutation = useRecoveryPasswordMutation as ReturnType<typeof vi.fn>;

describe('useForgotPasswordForm', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    // T006: Success path
    it('sets isSuccess to true and errorMessage to null on successful submission', async () => {
        const mockMutateAsync = vi.fn().mockResolvedValue({
            recoveryPassword: { code: 'SUCCESS', message: 'Email sent' },
        });
        mockUseRecoveryPasswordMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });

        const { result } = renderHook(() => useForgotPasswordForm());

        expect(result.current.isSuccess).toBe(false);
        expect(result.current.errorMessage).toBeNull();

        await act(async () => {
            await result.current.handleSubmit({ email: 'test@example.com' });
        });

        expect(mockMutateAsync).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.errorMessage).toBeNull();
    });

    // T007: Loading state
    it('exposes isLoading as true when mutation is pending', () => {
        mockUseRecoveryPasswordMutation.mockReturnValue({
            mutateAsync: vi.fn(),
            isPending: true,
        });

        const { result } = renderHook(() => useForgotPasswordForm());

        expect(result.current.isLoading).toBe(true);
    });

    // T017: Network error path
    it('sets errorMessage and keeps isSuccess false when mutation throws', async () => {
        const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Network error'));
        mockUseRecoveryPasswordMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });

        const { result } = renderHook(() => useForgotPasswordForm());

        await act(async () => {
            await result.current.handleSubmit({ email: 'test@example.com' });
        });

        expect(result.current.isSuccess).toBe(false);
        expect(result.current.errorMessage).toBe('Network error');
    });

    // T018: Error dismissal on field change
    it('clears errorMessage when handleFieldsChange is called', async () => {
        const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Network error'));
        mockUseRecoveryPasswordMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        });

        const { result } = renderHook(() => useForgotPasswordForm());

        // Trigger an error first
        await act(async () => {
            await result.current.handleSubmit({ email: 'test@example.com' });
        });
        expect(result.current.errorMessage).toBe('Network error');

        // Clear via field change
        act(() => {
            result.current.handleFieldsChange();
        });

        expect(result.current.errorMessage).toBeNull();
    });
});
