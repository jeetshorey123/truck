import React, { useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import TruckOptimizer from './components/TruckOptimizer';

function App() {
  return (
    <div className="App">
      <main className="main-content">
        <Container fluid>
          <TruckOptimizer />
        </Container>
      </main>
      
      <div className="background-grid"></div>
    </div>
  );
}

export default App;
