import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import AssetsPage from './pages/AssetsPage';
import SensorsPage from './pages/SensorsPage';
import PredictionsPage from './pages/PredictionsPage';
import NotFound from './components/NotFound';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ padding: '1rem' }}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/assets" component={AssetsPage} />
          <Route path="/sensors" component={SensorsPage} />
          <Route path="/predictions" component={PredictionsPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;