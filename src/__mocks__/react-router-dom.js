import React from 'react';

export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>;
export const Route = ({ element }) => element;
export const MemoryRouter = ({ children }) => <div>{children}</div>;
export const useNavigate = () => jest.fn();
export const useParams = () => ({});
export const useLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
});
