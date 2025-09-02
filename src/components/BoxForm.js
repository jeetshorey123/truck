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

const BoxForm = ({ boxes, onAddBox, onUpdateBox, onDeleteBox }) => {
  const [formData, setFormData] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    quantity: '',
    unit: UNITS.INCHES
  });

  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.length || !formData.width || !formData.height || !formData.quantity) {
      alert('Please fill all fields');
      return;
    }

    const boxData = {
      name: formData.name,
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      height: parseFloat(formData.height),
      quantity: parseInt(formData.quantity),
      unit: formData.unit
    };

    if (editingId) {
      onUpdateBox(editingId, boxData);
      setEditingId(null);
    } else {
      onAddBox(boxData);
    }

    setFormData({
      name: '',
      length: '',
      width: '',
      height: '',
      quantity: '',
      unit: UNITS.INCHES
    });
  };

  const handleEdit = (box) => {
    setFormData({
      name: box.name,
      length: box.length.toString(),
      width: box.width.toString(),
      height: box.height.toString(),
      quantity: box.quantity.toString(),
      unit: box.unit || UNITS.INCHES
    });
    setEditingId(box.id);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      length: '',
      width: '',
      height: '',
      quantity: '',
      unit: UNITS.INCHES
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
    <div className="box-form">
      <Form onSubmit={handleSubmit} className="form">
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Box Type Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Standard Box"
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
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Number of boxes"
                min="1"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="form-buttons">
          <Button type="submit" className="me-2">
            {editingId ? 'Update Box Type' : 'Add Box Type'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Form>

      <div className="box-list">
        <h4 className="list-title">Cargo Categories ({boxes.length})</h4>
        {boxes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No box types added yet. Add your first box type above.</p>
          </div>
        ) : (
          <div className="box-grid">
            {boxes.map(box => (
              <div key={box.id} className="box-card">
                <div className="box-header">
                  <h4>{box.name}</h4>
                  <div className="box-actions">
                    <Button size="sm" variant="info" onClick={() => handleEdit(box)} className="edit-btn me-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDeleteBox(box.id)} className="delete-btn">
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="box-details">
                  <p><strong>Dimensions:</strong> {formatDisplayValue(box.length, box.unit)} × {formatDisplayValue(box.width, box.unit)} × {formatDisplayValue(box.height, box.unit)} {box.unit || UNITS.INCHES}</p>
                  <p><strong>Volume per box:</strong> {formatDisplayValue(getVolumeInCubicFeet(box.length, box.width, box.height, box.unit || UNITS.INCHES), UNITS.FEET)} ft³</p>
                  <p><strong>Quantity:</strong> {box.quantity} boxes</p>
                  <p><strong>Total volume:</strong> {formatDisplayValue(getVolumeInCubicFeet(box.length, box.width, box.height, box.unit || UNITS.INCHES) * box.quantity, UNITS.FEET)} ft³</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxForm;
