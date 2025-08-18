const React = require('react');

const reactRouterDom = {
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    go: jest.fn(),
    listen: jest.fn(),
  }),
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  Router: ({ children }) => React.createElement('div', null, children),
  Route: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Link: ({ children, to, ...props }) => 
    React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ children, to, ...props }) => 
    React.createElement('a', { href: to, ...props }, children),
  Navigate: () => null,
  Outlet: () => null,
};

module.exports = reactRouterDom;