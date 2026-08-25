import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router/AppRouter';
import { ToastContainer } from './components/common/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // data considered fresh for 30s — avoids refetching
                         // on every component remount within that window
      gcTime: 5 * 60 * 1000, // keep unused cache around for 5 minutes so
                              // navigating back to a page (e.g., Menu -> New
                              // Order -> Menu) doesn't always trigger a
                              // fresh network request
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;