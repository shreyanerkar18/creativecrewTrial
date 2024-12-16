const jwt = require('jsonwebtoken');
const models = require('../models/models');

const bcrypt = require('bcrypt'); 
const saltRounds = 10;

const JWT_SECRET = '2343434asaflajsdfkljalsibkei'; // Hardcoded JWT secret

exports.signup = async (req, res) => {
  console.log(req);
  console.log("Hai");
  const { firstName, lastName, email, password, role, bu, transport } = req.body;
  console.log(firstName, lastName, email, password, role, bu, transport);

  try { 
      const hashedPassword = await bcrypt.hash(password, saltRounds);
       const token = jwt.sign({ email }, JWT_SECRET);
      console.log(firstName, lastName, email, hashedPassword, role, bu, transport); 
      models.insertUser(firstName, lastName, email, hashedPassword, role, bu, transport, (err, result) => {
         if (err) {
           console.error("Error inserting user:", err.message);
         return res.status(500).json({ error: 'Error inserting data into the database' }); 
        } 
        res.status(201).json({ message: 'Data inserted successfully', token }); 
      }); 
  } catch (error) {
       console.error("Error hashing password:", error);
       res.status(500).json({ error: 'Server error. Please try again later.' });
  }
  /*const token = jwt.sign({ email }, JWT_SECRET);

  console.log(firstName, lastName, email, password, role, bu, transport);

  models.insertUser(firstName, lastName, email, password, role, bu, transport, (err, result) => {
    if (err) {
      console.error("Error inserting user:", err.message);
      return res.status(500).json({ error: 'Error inserting data into the database' });
    }
    res.status(201).json({ message: 'Data inserted successfully', token });
  })*/
 };

exports.login = (req, res) => {
  const { email, password } = req.body;

  models.findUserByEmail(email, async (err, user) => {
    if (err) {
      console.error('Error fetching user data:', err.message);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    if (!user) { 
      return res.status(401).json({ error: 'Invalid credentials' }); 
    }

    try { 
      // Compare entered password with the stored hashed password 
      const isPasswordValid = await bcrypt.compare(password, user.password); 
      if (!isPasswordValid) {
         return res.status(401).json({ error: 'Invalid credentials' });
      }

    const newToken = jwt.sign({ email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, bu : user.bu }, JWT_SECRET);

    // Log the new token for debugging
    console.log('Login successful');
    console.log('Generated JWT Token:', newToken);
    console.log('Role:', user.role);
    console.log('First Name:', user.first_name);
    console.log('Last Name:', user.last_name);

    res.status(200).json({
      message: 'Login successful',
      token: newToken,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    });
  } catch (error) { 
    console.error('Error during login:', error); 
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
  });
};

exports.getSeatData = async (req, res) => {
  const { firstName, lastName } = req.query;

  try {
    // Call the model function to get seat data
    const seatData = await models.getSeatDataByUser(firstName, lastName);

    if (seatData.length === 0) {
      return res.status(404).json({ message: 'No seat data found' });
    }

    // Respond with the fetched seat data
    res.status(200).json(seatData);
  } catch (error) {
    console.error('Error fetching seat data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getBu = async (req, res) => {
  try {
    const Bu = await models.getBu();
    if (Bu.length === 0) {
      return res.status(404).json({ message: 'Bu not found' });
    }
    res.status(200).json(Bu);
    console.log(Bu);
  } catch (err) {
    console.error('Error fetching Bunames:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocatedSetsAdmin = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocatedSetsAdmin();
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
    console.log(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getSeatingCapacityAdmin = async (req, res) => {
  try {
    const getCapacity = await models.getSeatingCapacityAdmin();
    if (getCapacity.length === 0) {
      return res.status(404).json({ message: 'getCapacity not found' });
    }
    res.status(200).json(getCapacity);
    console.log(getCapacity);
  } catch (err) {
    console.error('Error fetching getCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.postSeatingCapacityAdmin = async (req, res) => {
  const requestBody = req.body;
  try {
    const createCapacityMsg = await models.createSeatingCapacityAdmin(requestBody);
    res.status(200).json({ msg: 'created succesfully' });
    console.log(createCapacityMsg);
  } catch (err) {
    console.error('Error fetching createCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateSeatingCapacityAdmin = async (req, res) => {
  const id = req.params.id;
  const { capacity } = req.body
  try {
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const updateCapacityMsg = await models.updateSeatingCapacityAdmin(id, capacity);
    res.status(200).json({ msg: 'updated succesfully' });
    console.log(updateCapacityMsg);
  } catch (err) {
    console.error('Error fetching update Capacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteSeatingCapacityAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const deleteCapacityMsg = await models.deleteSeatingCapacityAdmin(id);
    res.status(200).json({ msg: 'deleted succesfully' });
    console.log(deleteCapacityMsg);
  } catch (err) {
    console.error('Error fetching delete Capacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.createAllocatedSetsAdmin = async (req, res) => {
  console.log(req.body)
  const requestBody = req.body;
  try {
    const createCapacityMsg = await models.createAllocatedSetsAdmin(requestBody);
    res.status(200).json({ msg: 'created succesfully' });
    console.log(createCapacityMsg);
  } catch (err) {
    console.error('Error fetching createCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getSeatingCapacityAdminByFilter = async (req, res) => {
  try {
    const { country, city, state, floor, campus } = req.query
    const values = [country, state, city, parseInt(floor), campus]
    const allocatedSeats = await models.getSeatingCapacityAdminByFilter(values);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
    console.log(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocationForAdminMatrix = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocationForAdminMatrix(req);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocationForHOEMatrix = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocationForHOEMatrix(req);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getBUByFloor = async (req, res) => {
  try {
    const bus = await models.getBUByFloor(req);
    if (bus.length === 0) {
      return res.status(404).json({ message: 'BU not found' });
    }
    res.status(200).json(bus);
    console.log(bus);
  } catch (err) {
    console.error('Error fetching BU:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocationForBUwise = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocationForBUwise(req);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getHOEFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await models.getHOEFromTable(id);
    if (result.length === 0) {
      return res.status(404).json({ message: 'HOE not found' });
    }
    res.status(200).json(result);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching HOE:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManagersByHOEIdFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { country, state, city, campus, floor } = req.query;

  try {
    const result = await models.getManagersByHOEIdFromTable(id, country, state, city, campus, floor);
    // if (result.length === 0) {
    //   return res.status(404).json({ message: 'Managers not found' });
    // }
    res.status(200).json(result.length ? result : []);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching Managers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManagerData = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { seats } = req.body;

  try {
    const result = await models.updateManagerData(id, seats);
    res.status(200).json({ message: 'Manager data updated successfully', result });
  } catch (err) {
    console.error('Error updating manager data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addNewManager = async (req, res) => {
  const { firstName, lastName, businessUnit, country, state, city, campus, floor, seats_array, hoe_id } = req.body;

  try {
    const result = await models.addNewManager(firstName, lastName, businessUnit, country, state, city, campus, floor, seats_array, hoe_id);
    res.status(200).json({ message: 'New Manager added successfully', result });
  } catch (err) {
    console.error('Error adding manager data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManagerIdFromTable = async (req, res) => {
  const {bu, firstName, lastName} = req.query;
  console.log("contolleer;;;;;;", bu, firstName, lastName);
  try {
    const result = await models.getManagerIdFromTable(bu, firstName, lastName);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getManagerFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await models.getManagerFromTable(id);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeesByManagerIdFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await models.getEmployeesByManagerIdFromTable(id);
    //res.status(200).json({ message: 'Employee data fetched successfully', result });
    res.status(200).json(result.length ? result : []);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmployeeSeatData = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { seats } = req.body;
  try {
    await models.updateEmployeeSeatData(id, seats);
    res.json({ message: 'Seat data updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addNewEmployee = async (req, res) => {
  const { firstName, lastName, businessUnit, seat_data, managerId } = req.body;

  try {
    const result = await models.addNewEmployee(firstName, lastName, businessUnit, seat_data, managerId);
    res.status(200).json({ message: 'New Manager added successfully', result });
  } catch (err) {
    console.error('Error adding manager data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManagersByFloor = async (req, res) => {
  try {
    const { country, city, state, floor, campus,bu_id } = req.query
    const values = [country, state, city, parseInt(floor), campus,bu_id]
    const managers = await models.getManagersByFloor(values);
    if (managers.length === 0) {
      return res.status(404).json({ message: 'Managers not found' });
    }
    res.status(200).json(managers);
  } catch (err) {
    console.error('Error fetching Managers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocationForManagerMatrix = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocationForManagerMatrix(req);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getTransportMetrix = async (req, res) => {
  try {
    const data = await models.getTransportMetrix(req);
    if (data.length === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.status(200).json(data);
    console.log(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getFloorConfiguration = async (req, res) => {
  const { country, state, city, campus, floor } = req.query;

  try {
    const result = await models.getFloorConfiguration(country, state, city, campus, floor);
    // if (result.length === 0) {
    //   return res.status(404).json({ message: 'Managers not found' });
    // }
    res.status(200).json(result.length ? result : []);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching floor configuration:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDetailsBeforeAllocation = async (req, res) => {
  const { country, state, city, campus, floor, businessId } = req.query;
  console.log(country, state, city, campus, floor, businessId);

  try {
    const result = await models.getDetailsBeforeAllocation(country, state, city, campus, floor, businessId);
    // if (result.length === 0) {
    //   return res.status(404).json({ message: 'Managers not found' });
    // }
    res.status(200).json(result.length ? result : []);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching details before allocation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateToSameRow = async (req, res) => {
  const { country, state, city, campus, floor, bu, seats } = req.body;
  console.log(country, state, city, campus, floor, bu, seats);

  try {
    const result = await models.updateToSameRow(country, state, city, campus, floor, bu, seats);
    // if (result.length === 0) {
    //   return res.status(404).json({ message: 'Managers not found' });
    // }
    res.json({ message: 'Allocated successfully' });
    //console.log(hoe);
  } catch (err) {
    console.error('Error updating seats column in seat_allocation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Graphs
exports.getManagerAllocationData = async (req, res) => {
  try {
    const data = await models.getManagerAllocationData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching manager allocation data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

exports.getSeatAllocationData = async (req, res) => {
  try {
    const seatData = await models.getSeatAllocationData();

    if (seatData.length === 0) {
      return res.status(404).json({ message: 'No seat data found' });
    }

    // Respond with the seat data
    res.status(200).json(seatData);
  } catch (error) {
    console.error('Error fetching seat data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSeatingCapacityData = async (req, res) => {
  try {
    const seatingData = await models.getSeatingCapacityData();

    if (seatingData.length === 0) {
      return res.status(404).json({ message: 'No seating capacity data found' });
    }

    res.status(200).json(seatingData);
  } catch (error) {
    console.error('Error fetching seating capacity data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};