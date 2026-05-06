import { RouterProvider } from 'react-router';
import { router } from './routes';
import { LanguageProvider } from './context/LanguageContext';
import { MatchProvider } from './context/MatchContext';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <LanguageProvider>
      <MatchProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </MatchProvider>
    </LanguageProvider>
  );
}
