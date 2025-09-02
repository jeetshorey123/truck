import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import TruckForm from './TruckForm';
import BoxForm from './BoxForm';
import OptimizationResults from './OptimizationResults';
import { getVolumeInCubicFeet, convertToFeet } from '../utils/unitConverter';
import { optimizeWithMixedSolution } from '../utils/mixedOptimizer';
import './TruckOptimizer.css';

const TruckOptimizer = () => {
  const [trucks, setTrucks] = useState([]);

  const [boxes, setBoxes] = useState([]);

  const [results, setResults] = useState(null);

  const addTruck = (truck) => {
    setTrucks([...trucks, { ...truck, id: Date.now() }]);
  };

  const updateTruck = (id, updatedTruck) => {
    setTrucks(trucks.map(truck => truck.id === id ? { ...updatedTruck, id } : truck));
  };

  const deleteTruck = (id) => {
    setTrucks(trucks.filter(truck => truck.id !== id));
  };

  const addBox = (box) => {
    setBoxes([...boxes, { ...box, id: Date.now() }]);
  };

  const updateBox = (id, updatedBox) => {
    setBoxes(boxes.map(box => box.id === id ? { ...updatedBox, id } : box));
  };

  const deleteBox = (id) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const calculateOptimization = () => {
    const optimization = optimizeWithMixedSolution(trucks, boxes);
    setResults(optimization);
  };

  return (
    <div className="truck-optimizer">
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12}>
            <div className="optimizer-header">
              <div className="section-icon">
                <div className="icon-cube">⚙️</div>
              </div>
              <h2 className="section-title">Smart Configuration Center</h2>
              <p className="section-subtitle">Configure your fleet and cargo specifications</p>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={6} md={12}>
            <Card className="glass-card truck-card">
              <Card.Header className="card-header-custom">
                <div className="header-icon">🚛</div>
                <h3>Fleet Management</h3>
                <p>Define your truck categories</p>
              </Card.Header>
              <Card.Body>
                <TruckForm 
                  trucks={trucks}
                  onAddTruck={addTruck}
                  onUpdateTruck={updateTruck}
                  onDeleteTruck={deleteTruck}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} md={12}>
            <Card className="glass-card box-card">
              <Card.Header className="card-header-custom">
                <div className="header-icon">📦</div>
                <h3>Cargo Management</h3>
                <p>Define your box categories</p>
              </Card.Header>
              <Card.Body>
                <BoxForm 
                  boxes={boxes}
                  onAddBox={addBox}
                  onUpdateBox={updateBox}
                  onDeleteBox={deleteBox}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col xs={12} className="text-center">
            {trucks.length === 0 || boxes.length === 0 ? (
              <Card className="glass-card getting-started-card">
                <Card.Body>
                  <div className="getting-started">
                    <div className="ai-assistant-icon">🤖</div>
                    <h3>AI Assistant Ready</h3>
                    <div className="instructions">
                      {trucks.length === 0 && (
                        <div className="instruction-item">
                          <span className="step-number">1</span>
                          <div className="step-content">
                            <strong>Add Fleet Categories</strong>
                            <p>Define truck dimensions, pricing, and availability</p>
                          </div>
                        </div>
                      )}
                      {boxes.length === 0 && (
                        <div className="instruction-item">
                          <span className="step-number">2</span>
                          <div className="step-content">
                            <strong>Add Cargo Categories</strong>
                            <p>Specify box dimensions and quantities</p>
                          </div>
                        </div>
                      )}
                      <div className="instruction-item">
                        <span className="step-number">3</span>
                        <div className="step-content">
                          <strong>AI Optimization</strong>
                          <p>Get intelligent recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <div className="calculate-section">
                <button 
                  className="calculate-btn"
                  onClick={calculateOptimization}
                >
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Launch AI Optimization</span>
                  <div className="btn-glow"></div>
                </button>
              </div>
            )}
          </Col>
        </Row>

        {results && (
          <Row className="mt-5">
            <Col xs={12}>
              <OptimizationResults results={results} />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default TruckOptimizer;
