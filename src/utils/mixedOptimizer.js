import { getVolumeInCubicFeet, convertToFeet } from './unitConverter';

export const optimizeWithMixedSolution = (trucks, boxes) => {
  const availableTrucks = trucks.filter(truck => 
    truck.length && truck.width && truck.height && truck.price
  );
  
  const boxesToShip = boxes.filter(box => 
    box.length && box.width && box.height && box.quantity > 0
  );

  if (availableTrucks.length === 0 || boxesToShip.length === 0) {
    return { solutions: [], recommendation: null };
  }

  // Separate constraint trucks from flexible trucks
  const constraintTrucks = availableTrucks.filter(truck => truck.isConstraint && truck.constraintValue > 0);
  const flexibleTrucks = availableTrucks.filter(truck => !truck.isConstraint);

  const solutions = [];

  // If no constraints, use normal optimization
  if (constraintTrucks.length === 0) {
    return optimizeNormal(availableTrucks, boxesToShip);
  }

  // Mixed solution optimization
  const mixedSolutions = generateMixedSolutions(constraintTrucks, flexibleTrucks, boxesToShip);
  solutions.push(...mixedSolutions);

  // Sort solutions by cost and feasibility
  solutions.sort((a, b) => {
    if (a.canShipAll && !b.canShipAll) return -1;
    if (!a.canShipAll && b.canShipAll) return 1;
    return a.totalCost - b.totalCost;
  });

  const totalBoxVolume = boxesToShip.reduce((total, box) => {
    return total + (getVolumeInCubicFeet(box.length, box.width, box.height, box.unit) * box.quantity);
  }, 0);

  return {
    totalBoxVolume,
    solutions,
    recommendation: solutions[0],
    isMixedSolution: true,
    constraintTrucks: constraintTrucks.map(truck => ({
      name: truck.name,
      fixedCount: truck.constraintValue,
      cost: truck.price * truck.constraintValue
    }))
  };
};

const generateMixedSolutions = (constraintTrucks, flexibleTrucks, boxesToShip) => {
  const solutions = [];
  
  // First, allocate boxes to constraint trucks
  let remainingBoxes = [...boxesToShip];
  let constraintAllocation = [];
  let constraintCost = 0;
  let constraintVolume = 0;

  constraintTrucks.forEach(truck => {
    const trucksToUse = parseInt(truck.constraintValue);
    const truckVolume = getVolumeInCubicFeet(truck.length, truck.width, truck.height, truck.unit);
    
    for (let truckNum = 0; truckNum < trucksToUse; truckNum++) {
      const allocation = allocateBoxesToTruck(truck, remainingBoxes);
      if (allocation.boxes.length > 0) {
        constraintAllocation.push({
          truckType: truck.name,
          truckNumber: truckNum + 1,
          boxes: allocation.boxes,
          volumeUsed: allocation.volumeUsed,
          volumeUtilization: ((allocation.volumeUsed / truckVolume) * 100).toFixed(1)
        });
        constraintVolume += allocation.volumeUsed;
        remainingBoxes = allocation.remainingBoxes;
      }
      constraintCost += parseFloat(truck.price);
    }
  });

  // Now optimize remaining boxes with flexible trucks
  if (remainingBoxes.some(box => box.quantity > 0)) {
    flexibleTrucks.forEach(truck => {
      const flexibleSolution = optimizeSingleTruckType(truck, remainingBoxes);
      
      if (flexibleSolution) {
        const totalAllocation = [
          ...constraintAllocation,
          ...flexibleSolution.distribution
        ];

        solutions.push({
          truckTypes: [
            ...constraintTrucks.map(ct => ({
              name: ct.name,
              count: parseInt(ct.constraintValue),
              isConstraint: true
            })),
            {
              name: truck.name,
              count: flexibleSolution.trucksUsed,
              isConstraint: false
            }
          ],
          totalCost: constraintCost + flexibleSolution.totalCost,
          distribution: totalAllocation,
          unshippedBoxes: flexibleSolution.unshippedBoxes,
          canShipAll: flexibleSolution.canShipAll,
          volumeUtilization: calculateOverallUtilization(totalAllocation),
          constraintCost: constraintCost,
          flexibleCost: flexibleSolution.totalCost,
          constraintVolume: constraintVolume,
          flexibleVolume: flexibleSolution.totalVolume || 0
        });
      }
    });
  } else {
    // All boxes fit in constraint trucks
    solutions.push({
      truckTypes: constraintTrucks.map(ct => ({
        name: ct.name,
        count: parseInt(ct.constraintValue),
        isConstraint: true
      })),
      totalCost: constraintCost,
      distribution: constraintAllocation,
      unshippedBoxes: [],
      canShipAll: true,
      volumeUtilization: calculateOverallUtilization(constraintAllocation),
      constraintCost: constraintCost,
      flexibleCost: 0,
      constraintVolume: constraintVolume,
      flexibleVolume: 0
    });
  }

  return solutions;
};

const allocateBoxesToTruck = (truck, boxes) => {
  const truckVolume = getVolumeInCubicFeet(truck.length, truck.width, truck.height, truck.unit);
  const allocatedBoxes = [];
  let remainingBoxes = [...boxes];
  let volumeUsed = 0;

  for (let i = remainingBoxes.length - 1; i >= 0; i--) {
    const box = remainingBoxes[i];
    const boxVolume = getVolumeInCubicFeet(box.length, box.width, box.height, box.unit);

    // Check dimensional constraints
    if (canBoxFitInTruck(box, truck)) {
      let boxesCanFit = Math.floor((truckVolume - volumeUsed) / boxVolume);
      boxesCanFit = Math.min(boxesCanFit, box.quantity);

      if (boxesCanFit > 0) {
        allocatedBoxes.push({
          ...box,
          quantityInTruck: boxesCanFit
        });
        volumeUsed += boxesCanFit * boxVolume;

        if (box.quantity <= boxesCanFit) {
          remainingBoxes.splice(i, 1);
        } else {
          remainingBoxes[i] = {
            ...box,
            quantity: box.quantity - boxesCanFit
          };
        }
      }
    }
  }

  return {
    boxes: allocatedBoxes,
    remainingBoxes,
    volumeUsed
  };
};

const canBoxFitInTruck = (box, truck) => {
  const boxLengthInFeet = convertToFeet(box.length, box.unit);
  const boxWidthInFeet = convertToFeet(box.width, box.unit);
  const boxHeightInFeet = convertToFeet(box.height, box.unit);
  
  const truckLengthInFeet = convertToFeet(truck.length, truck.unit);
  const truckWidthInFeet = convertToFeet(truck.width, truck.unit);
  const truckHeightInFeet = convertToFeet(truck.height, truck.unit);

  return boxLengthInFeet <= truckLengthInFeet &&
         boxWidthInFeet <= truckWidthInFeet &&
         boxHeightInFeet <= truckHeightInFeet;
};

const optimizeSingleTruckType = (truck, boxes) => {
  const truckVolume = getVolumeInCubicFeet(truck.length, truck.width, truck.height, truck.unit);
  const distribution = [];
  let remainingBoxes = [...boxes];
  let trucksUsed = 0;
  let totalCost = 0;
  let totalVolume = 0;
  const maxTrucks = truck.available || 999;

  while (remainingBoxes.some(box => box.quantity > 0) && trucksUsed < maxTrucks) {
    const allocation = allocateBoxesToTruck(truck, remainingBoxes);
    
    if (allocation.boxes.length > 0) {
      distribution.push({
        truckType: truck.name,
        truckNumber: trucksUsed + 1,
        boxes: allocation.boxes,
        volumeUsed: allocation.volumeUsed,
        volumeUtilization: ((allocation.volumeUsed / truckVolume) * 100).toFixed(1)
      });
      remainingBoxes = allocation.remainingBoxes;
      trucksUsed++;
      totalCost += parseFloat(truck.price);
      totalVolume += allocation.volumeUsed;
    } else {
      break;
    }
  }

  return {
    trucksUsed,
    totalCost,
    distribution,
    unshippedBoxes: remainingBoxes.filter(box => box.quantity > 0),
    canShipAll: remainingBoxes.every(box => box.quantity === 0),
    totalVolume
  };
};

const optimizeNormal = (trucks, boxes) => {
  const solutions = [];
  
  trucks.forEach(truck => {
    const solution = optimizeSingleTruckType(truck, boxes);
    if (solution) {
      solutions.push({
        truckType: truck.name,
        trucksUsed: solution.trucksUsed,
        totalCost: solution.totalCost,
        volumeUtilization: solution.trucksUsed > 0 ? 
          (solution.distribution.reduce((sum, truck) => sum + parseFloat(truck.volumeUtilization), 0) / solution.trucksUsed).toFixed(1) : 0,
        distribution: solution.distribution,
        unshippedBoxes: solution.unshippedBoxes,
        canShipAll: solution.canShipAll,
        isUnlimited: !truck.available
      });
    }
  });

  solutions.sort((a, b) => {
    if (a.canShipAll && !b.canShipAll) return -1;
    if (!a.canShipAll && b.canShipAll) return 1;
    return a.totalCost - b.totalCost;
  });

  const totalBoxVolume = boxes.reduce((total, box) => {
    return total + (getVolumeInCubicFeet(box.length, box.width, box.height, box.unit) * box.quantity);
  }, 0);

  return {
    totalBoxVolume,
    solutions,
    recommendation: solutions[0]
  };
};

const calculateOverallUtilization = (distribution) => {
  if (distribution.length === 0) return 0;
  const totalUtilization = distribution.reduce((sum, truck) => sum + parseFloat(truck.volumeUtilization || 0), 0);
  return (totalUtilization / distribution.length).toFixed(1);
};
