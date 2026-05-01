import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './context/LanguageContext';
import { MatchProvider } from './context/MatchContext';

export default function App() {
  return (
    <LanguageProvider>
      <MatchProvider>
        <RouterProvider router={router} />
      </MatchProvider>
    </LanguageProvider>
  );
}
