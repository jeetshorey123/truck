import React from 'react';

const OptimizationResults = ({ results }) => {
  if (!results) return null;

  const { totalBoxVolume, solutions, recommendation, isMixedSolution, constraintTrucks } = results;

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN')}`;

  return (
    <div className="optimization-results">
      <h2>🚚 Optimization Results</h2>
      
      {isMixedSolution && constraintTrucks && (
        <div className="mixed-solution-info">
          <h3>🔒 Mixed Solution with Constraints</h3>
          <div className="constraint-summary">
            {constraintTrucks.map((truck, index) => (
              <div key={index} className="constraint-item">
                <strong>{truck.name}:</strong> {truck.fixedCount} trucks (Fixed) - {formatCurrency(truck.cost)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Cargo Volume</h3>
          <p className="stat-value">{totalBoxVolume?.toFixed(1) || 0} ft³</p>
        </div>
        <div className="stat-card">
          <h3>Solutions Found</h3>
          <p className="stat-value">{solutions?.length || 0}</p>
        </div>
        {isMixedSolution && (
          <div className="stat-card">
            <h3>Solution Type</h3>
            <p className="stat-value">🔄 Mixed Fleet</p>
          </div>
        )}
      </div>

      {recommendation && (
        <div className="recommendation">
          <h3>🎯 Recommended Solution</h3>
          <div className="recommendation-card">
            <div className="recommendation-header">
              {isMixedSolution ? (
                <>
                  <h4>Mixed Fleet Solution</h4>
                  <div className="cost-breakdown">
                    <div className="total-cost">Total Cost: {formatCurrency(recommendation.totalCost)}</div>
                    {recommendation.constraintCost > 0 && (
                      <div className="cost-detail">Constraint Cost: {formatCurrency(recommendation.constraintCost)}</div>
                    )}
                    {recommendation.flexibleCost > 0 && (
                      <div className="cost-detail">Flexible Cost: {formatCurrency(recommendation.flexibleCost)}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h4>{recommendation.truckType}</h4>
                  <div className="cost-badge">
                    Total Cost: {formatCurrency(recommendation.totalCost)}
                  </div>
                </>
              )}
            </div>
            
            {isMixedSolution && recommendation.truckTypes ? (
              <div className="mixed-solution-details">
                <h5>Fleet Composition:</h5>
                {recommendation.truckTypes.map((truck, index) => (
                  <div key={index} className="truck-type-detail">
                    <span className="truck-name">{truck.name}:</span>
                    <span className="truck-count">{truck.count} trucks</span>
                    {truck.isConstraint && <span className="constraint-badge">🔒 Fixed</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="recommendation-details">
                <div className="detail-item">
                  <span className="label">Trucks Needed:</span>
                  <span className="value">
                    {recommendation.trucksUsed}
                    {recommendation.isUnlimited && <span className="calculated-badge"> (calculated)</span>}
                  </span>
                </div>
              </div>
            )}
            
            <div className="recommendation-details">
              <div className="detail-item">
                <span className="label">Average Utilization:</span>
                <span className="value">{recommendation.volumeUtilization}%</span>
              </div>
              <div className="detail-item">
                <span className="label">Can Ship All:</span>
                <span className={`value ${recommendation.canShipAll ? 'success' : 'warning'}`}>
                  {recommendation.canShipAll ? '✅ Yes' : '⚠️ No'}
                </span>
              </div>
            </div>

            {recommendation.distribution && recommendation.distribution.length > 0 && (
              <div className="truck-distribution">
                <h5>Loading Distribution:</h5>
                {recommendation.distribution.map((truck, index) => (
                  <div key={index} className="truck-load">
                    <h6>
                      {truck.truckType ? `${truck.truckType} ${truck.truckNumber}` : `Truck ${truck.truckNumber}`} - 
                      Utilization: {truck.volumeUtilization}%
                    </h6>
                    <div className="box-list">
                      {truck.boxes.map((box, boxIndex) => (
                        <div key={boxIndex} className="box-item">
                          <span>{box.name}: {box.quantityInTruck} boxes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recommendation.unshippedBoxes && recommendation.unshippedBoxes.length > 0 && (
              <div className="unshipped-boxes">
                <h5>⚠️ Unshipped Boxes:</h5>
                {recommendation.unshippedBoxes.map((box, index) => (
                  <div key={index} className="unshipped-item">
                    {box.name}: {box.quantity} boxes remaining
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="all-solutions">
        <h3>All Solutions Comparison</h3>
        <div className="solutions-grid">
          {solutions && solutions.map((solution, index) => (
            <div 
              key={index}
              className={`solution-card ${solution === recommendation ? 'recommended' : ''}`}
            >
              <div className="solution-header">
                {solution.truckTypes ? (
                  <h4>Mixed Fleet #{index + 1}</h4>
                ) : (
                  <h4>{solution.truckType}</h4>
                )}
                <span className="solution-cost">{formatCurrency(solution.totalCost)}</span>
              </div>
              
              <div className="solution-details">
                {solution.truckTypes ? (
                  <div className="mixed-composition">
                    {solution.truckTypes.map((truck, tIndex) => (
                      <div key={tIndex} className="composition-item">
                        {truck.name}: {truck.count} {truck.isConstraint ? '(Fixed)' : ''}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Trucks: {solution.trucksUsed}</p>
                )}
                <p>Utilization: {solution.volumeUtilization}%</p>
                <p className={solution.canShipAll ? 'success' : 'warning'}>
                  {solution.canShipAll ? '✅ Ships All' : '⚠️ Partial Shipping'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationResults;
