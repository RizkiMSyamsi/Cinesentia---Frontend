import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * Polls `GET /api/analyses/:id/status` every 2 seconds until
 * the analysis reaches a terminal state (completed or failed).
 *
 * @param {string|null} analysisId - The analysis UUID to poll. Pass null to disable.
 * @returns {{ status, progress, errorMessage, isLoading, isError }}
 */
export function useAnalysisPolling(analysisId) {
  const query = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: async () => {
      const { data } = await api.get(`/analyses/${analysisId}/status`);
      return data;
    },
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false; // stop polling
      }
      return 2000; // poll every 2s
    },
  });

  return {
    status: query.data?.status ?? 'queued',
    progress: query.data?.progress ?? 0,
    errorMessage: query.data?.error_message ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
