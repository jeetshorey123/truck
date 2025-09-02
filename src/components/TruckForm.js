import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

const UNITS = {
  FEET: 'feet',
  METERS: 'meters',
  CENTIMETERS: 'centimeters',
  INCHES: 'inches'
};

const UNIT_LABELS = {
  feet: 'ft',
  meters: 'm',
  centimeters: 'cm',
  inches: 'in'
};

// Utility functions
const formatDisplayValue = (value, unit) => {
  return parseFloat(value).toFixed(1);
};

const getVolumeInCubicFeet = (length, width, height, unit) => {
  const convertToFeet = (value, fromUnit) => {
    const conversions = {
      'feet': 1,
      'meters': 3.28084,
      'centimeters': 0.0328084,
      'inches': 0.0833333
    };
    return value * (conversions[fromUnit] || 1);
  };
  
  const l = convertToFeet(length, unit);
  const w = convertToFeet(width, unit);
  const h = convertToFeet(height, unit);
  return l * w * h;
};

const TruckForm = ({ trucks, onAddTruck, onUpdateTruck, onDeleteTruck }) => {
  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    price: '',
    available: '',
    unit: UNITS.FEET,
    isConstraint: false,
    constraintValue: ''
  });

  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      length: '',
      width: '',
      height: '',
      price: '',
      available: '',
      unit: UNITS.FEET,
      isConstraint: false,
      constraintValue: ''
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.length || !formData.width || !formData.height || !formData.price) {
      alert('Please fill all required fields');
      return;
    }

    const truckData = {
      name: formData.name,
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      price: parseFloat(formData.price),
      available: formData.available ? parseInt(formData.available) : null,
      unit: formData.unit
    };

    if (editingId) {
      onUpdateTruck(editingId, truckData);
      setEditingId(null);
    } else {
      onAddTruck(truckData);
    }

    setFormData({
      name: '',
      length: '',
      width: '',
      height: '',
      price: '',
      available: '',
      unit: UNITS.FEET
    });
  };

  const handleEdit = (truck) => {
    setFormData({
      name: truck.name,
      length: truck.length.toString(),
      width: truck.width.toString(),
      height: truck.height.toString(),
      price: truck.price.toString(),
      available: truck.available ? truck.available.toString() : '',
      unit: truck.unit || UNITS.FEET
    });
    setEditingId(truck.id);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      length: '',
      width: '',
      height: '',
      price: '',
      available: '',
      unit: UNITS.FEET
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="truck-form">
      <Form onSubmit={handleSubmit} className="form">
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Truck Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Small Truck"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                {Object.entries(UNITS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Length ({formData.unit})</Form.Label>
              <Form.Control
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Length"
                min="0"
                step="0.1"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Width ({formData.unit})</Form.Label>
              <Form.Control
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                placeholder="Width"
                min="0"
                step="0.1"
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Height ({formData.unit})</Form.Label>
              <Form.Control
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height"
                min="0"
                step="0.1"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price per truck in Rupees"
                min="0"
                step="0.01"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Available Trucks (optional)</Form.Label>
              <Form.Control
                type="number"
                name="available"
                value={formData.available}
                onChange={handleChange}
                placeholder="Leave empty to calculate required"
                min="1"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isConstraint"
                checked={formData.isConstraint}
                onChange={(e) => setFormData({...formData, isConstraint: e.target.checked})}
                label="🔒 Use this truck type as a constraint for mixed solutions"
              />
              <Form.Text className="text-muted">
                When enabled, specify exactly how many of this truck type to use, and the system will optimize other truck types around this constraint.
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            {formData.isConstraint && (
              <Form.Group className="mb-3">
                <Form.Label>Fixed Number of Trucks</Form.Label>
                <Form.Control
                  type="number"
                  name="constraintValue"
                  value={formData.constraintValue}
                  onChange={handleChange}
                  placeholder="Exact number to use"
                  min="0"
                  required={formData.isConstraint}
                />
              </Form.Group>
            )}
          </Col>
        </Row>

        <div className="form-buttons">
          <Button type="submit" className="me-2">
            {editingId ? 'Update Truck' : 'Add Truck'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Form>

      <div className="truck-list">
        <h4 className="list-title">Fleet Categories ({trucks.length})</h4>
        {trucks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚛</div>
            <p>No trucks added yet. Add your first truck above.</p>
          </div>
        ) : (
          <div className="truck-grid">
            {trucks.map(truck => (
              <div key={truck.id} className="truck-card">
                <div className="truck-header">
                  <h4>{truck.name}</h4>
                  <div className="truck-actions">
                    <Button size="sm" variant="info" onClick={() => handleEdit(truck)} className="edit-btn me-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDeleteTruck(truck.id)} className="delete-btn">
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="truck-details">
                  <p><strong>Dimensions:</strong> {formatDisplayValue(truck.length, truck.unit)} × {formatDisplayValue(truck.width, truck.unit)} × {formatDisplayValue(truck.height, truck.unit)} {truck.unit || UNITS.FEET}</p>
                  <p><strong>Volume:</strong> {formatDisplayValue(getVolumeInCubicFeet(truck.length, truck.width, truck.height, truck.unit || UNITS.FEET), UNITS.FEET)} ft³</p>
                  <p><strong>Price:</strong> ₹{truck.price}</p>
                  <p><strong>Available:</strong> {truck.available ? `${truck.available} trucks` : 'Calculate as needed'}</p>
                  {truck.isConstraint && (
                    <div className="constraint-badge">
                      🔒 <strong>Mixed Solution Constraint:</strong> Fixed at {truck.constraintValue} trucks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckForm;
