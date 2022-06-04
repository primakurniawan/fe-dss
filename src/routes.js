import React from 'react'

const Alternatives = React.lazy(() => import('./views/Alternatives'))
const Aspects = React.lazy(() => import('./views/Aspects'))
const Criteria = React.lazy(() => import('./views/Criteria'))
const Parameters = React.lazy(() => import('./views/Parameters'))
const Ranking = React.lazy(() => import('./views/Ranking'))
const Stores = React.lazy(() => import('./views/Stores'))
const Shortest = React.lazy(() => import('./views/Shortest'))

const routes = [
  { path: '/alternatives', name: 'Alternatives', element: Alternatives },
  { path: '/aspects', name: 'Aspects', element: Aspects },
  { path: '/criteria', name: 'Criteria', element: Criteria },
  { path: '/parameters', name: 'Parameters', element: Parameters },
  { path: '/ranking', name: 'Ranking', element: Ranking },
  { path: '/stores', name: 'Stores', element: Stores },
  { path: '/shortest', name: 'Shortest', element: Shortest },
  { path: '/', exact: true, name: 'Home' },
]

export default routes
