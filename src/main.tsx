import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './routes/App';
import ErrorPage from './routes/error-page';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './routes/root';
import DashboardRoot from './routes/dashboard';
import AboutPage from './routes/dashboard/about';
import ProfilePage from './routes/dashboard/profile';
import MemberPage, { membersLoader } from './routes/dashboard/members';
import ProposalsPage, { proposalsLoader } from './routes/dashboard/proposals';
import HomePage from './routes/dashboard/index';
import ProjectsPage from './routes/dashboard/projects';
import { AuthProvider } from './lib/AuthContext';
import SingleMemberPage, { loader } from './routes/dashboard/member';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <App />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardRoot />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'members',
        element: <MemberPage />,
        loader: membersLoader,
      },
      {
        path: 'proposals',
        element: <ProposalsPage />,
        loader: proposalsLoader,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'members/:id',
        element: <SingleMemberPage />,
        loader: loader,
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
