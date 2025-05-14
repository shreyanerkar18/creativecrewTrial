// import React, { useState } from "react";
import React, { useRef, useEffect, useState, useCallback } from "react";

import axios from "axios";
import { baseurl } from "./utils";
// import { Button, Container, Grid, Typography } from "@mui/material";
import {
  Box,
  Button,
  Grid,
  TextField,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";

const StyledCard = ({ title, children }) => (
  <Card sx={{ mb: 3, borderRadius: 4, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const HoePlan = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [managers, setManagers] = useState([]); // to store and update all managers under HOE
  const [selectedManager, setSelectedManager] = useState(""); // to store and update selected manager in drop-down
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [locations, setLocations] = useState([]);

  const [teams, setTeams] = useState({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${baseurl}/getManagerTeams`);
        console.log("Fetched Teams: ", response);

        const formatted = {};
        response.data.forEach((team) => {
          formatted[team.first_name] = parseInt(team.team_size);
        });

        console.log("for", formatted);

        setTeams(formatted);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const [editingManager, setEditingManager] = useState(null);
  const [editedTeamSize, setEditedTeamSize] = useState("");

  const [editableRow, setEditableRow] = useState(null);
  const [editedManager, setEditedManager] = useState("");

  const [totalSeats, setTotalSeats] = useState(42);
  const [daysRequired, setDaysRequired] = useState(2);
  const [schedule, setSchedule] = useState(null);
  const [managerName, setManagerName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [editManagerName, setEditManagerName] = useState("");
  const [newManagerName, setNewManagerName] = useState("");

  const [newTeamSize, setNewTeamSize] = useState("");
  const [removeManagerName, setRemoveManagerName] = useState("");
  const [splitManagerName, setSplitManagerName] = useState("");
  const [numSubTeams, setNumSubTeams] = useState("");
  const [subTeamSizes, setSubTeamSizes] = useState("");
  const [minSeatsRequired, setMinSeatsRequired] = useState(null);
  const [previousDaysRequired, setPreviousDaysRequired] =
    useState(daysRequired);

  // save button
  const [seatingArrangementName, setSeatingArrangementName] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const calculateMinSeatsRequired = () => {
    let totalTeamDays = Object.values(teams).reduce(
      (sum, size) => sum + size * daysRequired,
      0
    );

    let minSeats = Math.ceil(totalTeamDays / 5);

    // Only reset totalSeats if it's 0 or daysRequired has changed
    if (totalSeats === 0 || previousDaysRequired !== daysRequired) {
      setTotalSeats(minSeats);
      setPreviousDaysRequired(daysRequired); // Store last used value
      alert(
        `Cannot allocate seats fairly. Consider increasing seats. Minimum required seats: ${minSeats}`
      );
    }

    setMinSeatsRequired(minSeats);
    return minSeats;
  };

  const addManager = () => {
    if (managerName && teamSize && !isNaN(teamSize) && teamSize > 0) {
      const updatedTeams = { ...teams, [managerName]: parseInt(teamSize) };
      setTeams(updatedTeams);
      setTotalSeats(totalSeats + parseInt(teamSize));
      calculateMinSeatsRequired(updatedTeams);
      setManagerName("");
      setTeamSize("");
      // 🔹 Recalculate min seats required
      calculateMinSeatsRequired(updatedTeams);

      // 🔹 Reallocate seats
      allocateSeats(updatedTeams);
    } else {
      alert("❌ Please enter a valid manager name and team size.");
    }
  };

  const editManager = (manager) => {
    setEditableRow(manager);
    setEditedManager(manager); // Pre-fill current manager name
    setEditedTeamSize(teams[manager]); // Pre-fill current team size
  };

  const saveManagerEdit = (oldManager) => {
    const updatedTeams = { ...teams };
    delete updatedTeams[oldManager]; // Remove the old manager key
    updatedTeams[editedManager] = editedTeamSize; // Add new key-value pair

    setTeams(updatedTeams);
    setPreferences((prev) => {
      const newPreferences = { ...prev };
      newPreferences[editedManager] = newPreferences[oldManager];
      delete newPreferences[oldManager];
      return newPreferences;
    });

    setEditableRow(null); // Exit edit mode
  };

  const removeManager = (manager) => {
    if (manager && teams[manager]) {
      const removedTeamSize = teams[manager];
      const confirmChange = window.confirm(
        `Are you sure you want to remove ${manager}? This will reduce seats by ${removedTeamSize}.`
      );

      if (confirmChange) {
        const updatedTeams = { ...teams };
        delete updatedTeams[manager];
        setTeams(updatedTeams);
        setTotalSeats(totalSeats - removedTeamSize);
        calculateMinSeatsRequired(updatedTeams);
      }
    } else {
      alert("❌ Manager not found or invalid name.");
    }
  };

  const handleEditTeamSize = (manager) => {
    setEditingManager(manager);
    setEditedTeamSize(teams[manager]);
  };

  const splitTeam = () => {
    if (!splitManagerName || !teams[splitManagerName]) {
      alert("❌ Please enter a valid manager name.");
      return;
    }

    let numTeams = parseInt(numSubTeams);
    let sizes = subTeamSizes.split(",").map((size) => parseInt(size.trim()));

    if (sizes.length !== numTeams) {
      alert("❌ Number of teams and provided sizes do not match.");
      return;
    }

    let originalSize = teams[splitManagerName];
    let totalSplitSize = sizes.reduce((sum, size) => sum + size, 0);

    if (totalSplitSize !== originalSize) {
      alert("❌ Sum of new teams' sizes must equal the original team size.");
      return;
    }

    const updatedTeams = { ...teams };
    delete updatedTeams[splitManagerName];

    sizes.forEach((size, index) => {
      updatedTeams[`${splitManagerName} - Team ${index + 1}`] = size;
    });

    setTeams(updatedTeams);
    calculateMinSeatsRequired(updatedTeams);
    setSplitManagerName("");
    setNumSubTeams("");
    setSubTeamSizes("");
  };

  const allocateSeats = () => {
    let requiredSeats = calculateMinSeatsRequired();

    if (totalSeats < requiredSeats) {
      alert(
        `Cannot allocate seats fairly. Consider increasing seats. Minimum required seats: ${requiredSeats}`
      );
      setTotalSeats(requiredSeats);
      setMinSeatsRequired(requiredSeats);
      return;
    }

    let allocationPossible = false;
    let newSchedule = null;
    let tempTotalSeats = totalSeats;

    while (!allocationPossible) {
      let schedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      };

      let assignedDays = {};
      for (let team in teams) {
        assignedDays[team] = [];
      }

      function canAddTeam(day, team) {
        let currentSeats = schedule[day].reduce((sum, t) => sum + teams[t], 0);
        return currentSeats + teams[team] <= tempTotalSeats;
      }

      let sortedTeams = Object.keys(teams).sort((a, b) => teams[b] - teams[a]);

      let dayIndex = 0;
      for (let i = 0; i < daysRequired; i++) {
        for (let team of sortedTeams) {
          if (assignedDays[team].length < daysRequired) {
            let day = weekDays[dayIndex % 5];
            if (canAddTeam(day, team)) {
              schedule[day].push(team);
              assignedDays[team].push(day);
            }
            dayIndex++;
          }
        }
      }

      allocationPossible = Object.keys(teams).every(
        (team) => assignedDays[team].length === daysRequired
      );

      if (allocationPossible) {
        newSchedule = schedule;
      } else {
        tempTotalSeats++;
      }
    }

    if (tempTotalSeats !== totalSeats) {
      alert(
        `Cannot allocate seats fairly. Consider increasing seats. Minimum required seats: ${tempTotalSeats}`
      );
      setTotalSeats(tempTotalSeats);
      setMinSeatsRequired(tempTotalSeats);
    }

    setSchedule(newSchedule);
  };

  const [preferences, setPreferences] = useState({});
  const [showPreferences, setShowPreferences] = useState(false);

  const allocateSeatsWithPreference = () => {
    setShowPreferences(true); // Show preference table when button is clicked
    const initializedPreferences = Object.keys(teams).reduce((acc, manager) => {
      acc[manager] = weekDays.reduce((days, day) => {
        days[day] = false;
        return days;
      }, {});
      return acc;
    }, {});
    setPreferences(initializedPreferences);
  };

  const allocateSeatsConsideringPreference = () => {
    let newSchedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    let assignedDays = {};
    for (let team in teams) {
      assignedDays[team] = [];
    }

    let allocationPossible = true;

    // Step 1: Try to assign based on preferences
    for (let i = 0; i < daysRequired; i++) {
      for (let team in teams) {
        if (assignedDays[team].length >= daysRequired) continue;

        let preferredDays = weekDays.filter(
          (day) =>
            preferences[team]?.[day] &&
            !assignedDays[team].includes(day) &&
            newSchedule[day].reduce((sum, t) => sum + teams[t], 0) +
              teams[team] <=
              totalSeats
        );

        let allocated = false;

        for (let day of preferredDays) {
          newSchedule[day].push(team);
          assignedDays[team].push(day);
          allocated = true;
          break;
        }

        // If preferred days didn't work, try any available day
        if (!allocated) {
          let fallbackDays = weekDays.filter(
            (day) =>
              !assignedDays[team].includes(day) &&
              newSchedule[day].reduce((sum, t) => sum + teams[t], 0) +
                teams[team] <=
                totalSeats
          );

          for (let day of fallbackDays) {
            newSchedule[day].push(team);
            assignedDays[team].push(day);
            allocated = true;
            break;
          }
        }

        // If still not allocated, mark as failure
        if (!allocated) {
          allocationPossible = false;
        }
      }
    }

    // 🔴 Check if every team has been fully scheduled for daysRequired
    const allTeamsSatisfied = Object.values(assignedDays).every(
      (days) => days.length === daysRequired
    );

    if (!allocationPossible || !allTeamsSatisfied) {
      alert(
        "❌ Cannot allocate seats fairly. Either reduce preferences, increase number of seats, or split the team."
      );
      return;
    }

    setSchedule(newSchedule);
  };

  const handlePreferenceChange = (manager, day) => {
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [manager]: {
        ...(prevPreferences[manager] || {}),
        [day]: !(prevPreferences[manager]?.[day] || false),
      },
    }));
  };


  const handleSaveSeatingArrangement = async () => {
    if (!seatingArrangementName) {
      alert("Please enter a seating arrangement name.");
      return;
    }

    try {
      const formattedSchedule = {}; // { teamName: ['Monday', 'Wednesday'] }
      Object.keys(schedule).forEach((day) => {
        schedule[day].forEach((team) => {
          if (!formattedSchedule[team]) {
            formattedSchedule[team] = [];
          }
          formattedSchedule[team].push(day);
        });
      });

      console.log("abbc", formattedSchedule);
      const payload = {
        allocationName: seatingArrangementName,
        schedule: formattedSchedule,
        teams,
        daysRequired,
      };

      console.log("pay", payload);

      await axios.post(`${baseurl}/saveSeatingArrangement`, payload);
      alert("Seating arrangement saved successfully!");
      setShowSavePrompt(false);
      setSeatingArrangementName("");
    } catch (error) {
      console.error("Error saving seating arrangement:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Status:", error.response.status);
      }
      if (error.response && error.response.status === 400) {
        alert(error.response.data.error); // Shows: "Seating arrangement name already exists. Please choose a different name."
      } else {
        alert("Failed to save. Please try again.");
      }
    }

  };


  const [seatingNames, setSeatingNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [arrangement, setArrangement] = useState([]);

  useEffect(() => {
    fetchSeatingNames();
  }, []);

  const fetchSeatingNames = async () => {
    try {
      const res = await axios.get(`${baseurl}/seating-names`);
      setSeatingNames(res.data);
    } catch (err) {
      console.error("Error fetching seating names", err);
    }
  };

  const fetchArrangement = async (name) => {
    try {
      const res = await axios.get(`${baseurl}/seating-arrangement/${name}`);
      setArrangement(res.data);
    } catch (err) {
      console.error("Error fetching arrangement", err);
    }
  };

  // const handleDelete = async () => {
  //   try {
  //     await axios.delete(`${baseurl}/seating-arrangement/${selectedName}`);
  //     alert("Arrangement deleted");
  //     setArrangement([]);
  //     fetchSeatingNames();
  //     setSelectedName("");
  //   } catch (err) {
  //     console.error("Error deleting arrangement", err);
  //   }
  // };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the arrangement "${selectedName}"?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${baseurl}/seating-arrangement/${selectedName}`);
      alert("Arrangement deleted");
      setArrangement([]);
      fetchSeatingNames();
      setSelectedName("");
    } catch (err) {
      console.error("Error deleting arrangement", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seat Allocation System</h2>

      {/* Add Manager Section */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <TextField
          label="Manager Name"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          size="small" // Small size for TextField
        />
        <TextField
          label="Team Size"
          type="number"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          size="small" // Small size for TextField
        />
        <Button variant="contained" onClick={addManager} size="small">
          Add Manager
        </Button>
      </div>

      {/* Split Team Section */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <TextField
          label="Manager Name to Split"
          value={splitManagerName}
          onChange={(e) => setSplitManagerName(e.target.value)}
          size="small" // Small size for TextField
        />
        <TextField
          label="Number of Teams"
          type="number"
          value={numSubTeams}
          onChange={(e) => setNumSubTeams(e.target.value)}
          size="small" // Small size for TextField
        />
        <TextField
          label="Sizes of New Teams (comma-separated)"
          value={subTeamSizes}
          onChange={(e) => setSubTeamSizes(e.target.value)}
          size="small" // Small size for TextField
        />
        <Button
          variant="contained"
          color="warning"
          onClick={splitTeam}
          size="small"
        >
          Split Team
        </Button>
      </div>

      {/* Seat Allocation Settings */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <TextField
          label="Total Seats"
          type="number"
          value={totalSeats}
          onChange={(e) => setTotalSeats(parseInt(e.target.value))}
          size="small" // Small size for TextField
        />
        <TextField
          label="Days Required"
          type="number"
          value={daysRequired}
          onChange={(e) => setDaysRequired(parseInt(e.target.value))}
          size="small" // Small size for TextField
        />
        <Button
          variant="contained"
          color="primary"
          onClick={allocateSeats}
          size="small"
        >
          Allocate Seats
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={allocateSeatsWithPreference}
          style={{ marginLeft: 10 }}
          size="small" // Small size for Button
        >
          Allocate Seats with Preference
        </Button>
      </div>

      {showPreferences && (
        <div style={{ marginTop: 20 }}>
          <TableContainer
            component={Paper}
            style={{ marginTop: 20, width: "80%", margin: "auto" }}
          >
            <h3 style={{ textAlign: "center" }}>Preference Table</h3>
            <Table size="small">
              {" "}
              {/* Small size for Table */}
              <TableHead>
                <TableRow>
                  <TableCell>Manager</TableCell>
                  <TableCell>Team Size</TableCell>
                  {weekDays.map((day) => (
                    <TableCell key={day}>{day}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(teams).map((manager) => (
                  <TableRow key={manager}>
                    <TableCell>
                      {editableRow === manager ? (
                        <>
                          <TextField
                            value={editedManager}
                            onChange={(e) => setEditedManager(e.target.value)}
                            size="small" // Small size for TextField
                          />
                          <IconButton
                            onClick={() => saveManagerEdit(manager)}
                            style={{ color: "green" }}
                            size="small" // Small size for IconButton
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setEditedManager(manager); // Reset manager name
                              setEditedTeamSize(teams[manager]); // Reset team size
                              setEditableRow(null); // Exit edit mode
                            }}
                            style={{ color: "black" }}
                            size="small" // Small size for IconButton
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          {manager}
                          <IconButton
                            onClick={() => editManager(manager)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => removeManager(manager)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {editableRow === manager ? (
                        <TextField
                          type="number"
                          value={editedTeamSize}
                          onChange={(e) => setEditedTeamSize(e.target.value)}
                          size="small" // Small size for TextField
                        />
                      ) : (
                        teams[manager]
                      )}
                    </TableCell>
                    {weekDays.map((day) => (
                      <TableCell key={day}>
                        <Checkbox
                          checked={preferences[manager]?.[day] || false}
                          onChange={() => handlePreferenceChange(manager, day)}
                          size="small" // Small size for Checkbox
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Allocate Button Below the Table */}
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={allocateSeatsConsideringPreference}
              size="small" // Small size for Button
            >
              Allocate
            </Button>
          </div>
        </div>
      )}

      {/* Minimum Required Seats */}
      {/* <h3>Minimum Required Seats: {minSeatsRequired}</h3> */}

      <Paper sx={{ padding: 3, margin: 3 }}>
        <div>
          <Typography variant="h6">View Seating Arrangements</Typography>

          <Select
            value={selectedName}
            onChange={(e) => {
              setSelectedName(e.target.value);
              fetchArrangement(e.target.value);
            }}
            displayEmpty
            sx={{ marginTop: 2, minWidth: 300 }}
          >
            <MenuItem value="" disabled>
              Select an arrangement
            </MenuItem>
            {seatingNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>

          {arrangement.length > 0 && (
            <>
              <Table sx={{ marginTop: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Manager Name</TableCell>
                    <TableCell>Team Name</TableCell>
                    <TableCell>Allocated Days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arrangement.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.team_name}</TableCell>
                      <TableCell>{row.team_name}</TableCell>
                      <TableCell>{row.allocated_days}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                sx={{ marginTop: 2 }}
              >
                Delete This Arrangement
              </Button>
            </>
          )}
        </div>
      </Paper>

      {/* Seat Allocation Table */}
      <TableContainer sx={{ marginTop: 2, padding: 2 }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  borderRight: "1px solid #ddd",
                  fontWeight: "bold",
                  backgroundColor: "#f0f0f0", // Highlight first row
                }}
              >
                Day
              </TableCell>
              {Object.keys(teams).length > 0 &&
                Object.keys(teams).map((manager) => (
                  <TableCell
                    key={manager}
                    sx={{
                      borderRight: "1px solid #ddd",
                      fontWeight: "bold",
                      backgroundColor: "#f0f0f0", // Highlight first row
                    }}
                  >
                    {`${manager} (${teams[manager]})`}
                  </TableCell>
                ))}
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}
              >
                Total Seats
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {weekDays.map((day) => {
              const totalSeatsForDay = Object.keys(teams).reduce(
                (sum, team) => {
                  return schedule && schedule[day].includes(team)
                    ? sum + teams[team]
                    : sum;
                },
                0
              );

              return (
                <TableRow key={day}>
                  <TableCell
                    sx={{
                      borderRight: "1px solid #ddd",
                      backgroundColor: "#f9f9f9", // Highlight first column
                      fontWeight: "bold",
                    }}
                  >
                    {day}
                  </TableCell>
                  {Object.keys(teams).map((team) => (
                    <TableCell
                      key={team}
                      sx={{
                        borderRight: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {schedule && schedule[day].includes(team)
                        ? teams[team]
                        : ""}
                    </TableCell>
                  ))}
                  <TableCell>{totalSeatsForDay}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* {schedule && Object.keys(schedule).length > 0 && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {!showSavePrompt ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowSavePrompt(true)}
              size="small" // Small size for Button
            >
              Save Seating Arrangement
            </Button>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <TextField
                label="Seating Arrangement Name"
                value={seatingArrangementName}
                onChange={(e) => setSeatingArrangementName(e.target.value)}
                size="small" // Small size for TextField
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSeatingArrangement}
                size="small" // Small size for Button
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowSavePrompt(false);
                  setSeatingArrangementName("");
                }}
                size="small" // Small size for Button
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )} */}


{schedule && Object.keys(schedule).length > 0 && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {!showSavePrompt ? (
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowSavePrompt(true)}
            >
              Save Seating Arrangement
            </Button>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <TextField
                label="Seating Arrangement Name"
                value={seatingArrangementName}
                onChange={(e) => setSeatingArrangementName(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSeatingArrangement}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowSavePrompt(false);
                  setSeatingArrangementName("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default HoePlan;