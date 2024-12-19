import React, { useState, useEffect } from "react";
import "./AllocationPlanning.css"; // Ensure you have a CSS file for styling

const sampleBUs = [
  { name: "Cloud", employees: 500 },
  { name: "Human Resources", employees: 350 },
  { name: "Cybersecurity", employees: 250 },
  { name: "Software Engineering", employees: 700 },
  { name: "Marketing", employees: 200 },
];

const sampleCampuses = [
  { campus: "Knowledge City", location: "Hyderabad", floor: 5, capacity: 210 },
  { campus: "Knowledge City", location: "Hyderabad", floor: 6, capacity: 160 },
  { campus: "Gresham Street", location: "London", floor: 10, capacity: 180 },
  { campus: "Mindspace", location: "Hyderabad", floor: 7, capacity: 150 },
  { campus: "M E Business Park", location: "Bengaluru", floor: 11, capacity: 250 },
  { campus: "Manyata Tech Park", location: "Bengaluru", floor: 7, capacity: 150 },
];

const workingDays = 5;

const NewSeatAllocation = () => {
  const [totalSeats, setTotalSeats] = useState(
    sampleCampuses.reduce((total, campus) => total + campus.capacity, 0)
  );
  const [daysRequired, setDaysRequired] = useState(2);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [allocationResult, setAllocationResult] = useState([]);
  const [campusDetails, setCampusDetails] = useState(sampleCampuses);
  const [seatShortfall, setSeatShortfall] = useState(null);
  const [accommodationMessage, setAccommodationMessage] = useState("");

  useEffect(() => {
    const totalEmployeeCount = sampleBUs.reduce((total, bu) => total + bu.employees, 0);
    setTotalEmployees(totalEmployeeCount);
  }, []);

  const minimumSeatsRequired = Math.ceil(
    (totalEmployees * daysRequired) / workingDays
  );

  const handleAllocateSeats = () => {
    const totalEmployeeCount = totalEmployees;
    const totalAvailableSeats = totalSeats;
    let shortfall = null;

    const result = sampleBUs.map((bu) => {
      const allocationPercentage = bu.employees / totalEmployeeCount;
      const allocatedSeats = Math.round(allocationPercentage * totalAvailableSeats);
      const requiredSeatsInWeek = bu.employees * daysRequired;
      const remainingSeats = allocatedSeats * 5 - requiredSeatsInWeek;

      if (remainingSeats < 0) {
        shortfall = {
          buName: bu.name,
          seatsNeeded: Math.abs(remainingSeats),
        };
      }

      return {
        ...bu,
        allocatedSeats,
        requiredSeatsInWeek,
        remainingSeats: remainingSeats >= 0 ? remainingSeats : null,
      };
    });

    // Calculate total remaining seats
    const totalRemainingSeats = result.reduce(
      (acc, bu) => acc + (bu.remainingSeats || 0),
      0
    );

    // Display message if there are remaining seats
    if (totalRemainingSeats > 0) {
      setAccommodationMessage(`We can accommodate more ${totalRemainingSeats / workingDays} employees.`);
    } else {
      setAccommodationMessage("No extra seats available this week.");
    }

    setAllocationResult(result);
    setSeatShortfall(shortfall);
  };

  // Calculate totals for the table
  const totals = allocationResult.reduce(
    (acc, bu) => {
      acc.employees += bu.employees;
      acc.requiredSeatsInWeek += bu.requiredSeatsInWeek;
      acc.allocatedSeats += bu.allocatedSeats;
      acc.remainingSeats += bu.remainingSeats || 0;
      return acc;
    },
    { employees: 0, requiredSeatsInWeek: 0, allocatedSeats: 0, remainingSeats: 0 }
  );

  return (
    <div className="allocation-container">
      <h1>🌟 Seat Allocation System</h1>
      <div className="minimum-seats-message">
        <p>
          For a total of {totalEmployees} employees, we need a minimum of {minimumSeatsRequired} seats.
        </p>
      </div>

      <div className="input-group">
        <label>
          <span>Total Seats Available:</span>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            placeholder="Enter total seats"
          />
        </label>
      </div>

      <div className="input-group">
        <label>
          <span>Days Required Per Week:</span>
          <input
            type="number"
            value={daysRequired}
            onChange={(e) => setDaysRequired(e.target.value)}
            placeholder="Enter days per week"
          />
        </label>
      </div>

      <button className="allocate-button" onClick={handleAllocateSeats}>
        📊 Allocate Seats
      </button>

      {accommodationMessage && (
        <div className="accommodation-message">
          <p>{accommodationMessage}</p>
        </div>
      )}

      {seatShortfall && (
        <div className="shortfall-popup">
          <p>
            🚨Still need{" "}
            {seatShortfall.seatsNeeded * daysRequired} seats!
          </p>
        </div>
      )}

      {allocationResult.length > 0 && (
        <div>
          <h2>Business Unit Seat Allocation</h2>
          <table className="bu-table">
            <thead>
              <tr>
                <th>Business Unit</th>
                <th>Total Employees</th>
                <th>Required Seats in a Week</th>
                <th>Allocated Seats For Week</th>
                <th>Accommodate Employees</th>
              </tr>
            </thead>
            <tbody>
              {allocationResult.map((bu, index) => (
                <tr key={index}>
                  <td>{bu.name}</td>
                  <td>{bu.employees}</td>
                  <td>{bu.requiredSeatsInWeek}</td>
                  <td>{bu.allocatedSeats}</td>
                  <td>{bu.remainingSeats !== null ? bu.remainingSeats / workingDays : "—"}</td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="totals-row">
                <td>Total Employees</td>
                <td>{totals.employees}</td>
                <td>{totals.requiredSeatsInWeek}</td>
                <td>{totals.allocatedSeats}</td>
                <td>{totals.remainingSeats / workingDays}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div>
        <h2>Campus Details</h2>
        <table className="campus-table">
          <thead>
            <tr>
              <th>Campus</th>
              <th>Location</th>
              <th>Floor</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {campusDetails.map((campus, index) => (
              <tr key={index}>
                <td>{campus.campus}</td>
                <td>{campus.location}</td>
                <td>{campus.floor}</td>
                <td>{campus.capacity}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3">Total Capacity</td>
              <td>
                {campusDetails.reduce((total, campus) => total + campus.capacity, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewSeatAllocation;