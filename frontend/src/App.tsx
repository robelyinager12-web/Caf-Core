import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router/AppRouter';
import { ToastContainer } from './components/common/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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