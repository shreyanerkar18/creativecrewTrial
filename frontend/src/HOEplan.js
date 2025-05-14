// import React from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
// } from "@mui/material";

// const AllocateSeats = () => {
//   const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
//   const teams = {
//     "Manager 1": 10,
//     "Manager 2": 14,
//     "Manager 3": 7,
//     "Manager 4 Team 1": 8,
//     "Manager 4 Team 2": 4,
//     "Manager 4 Team 3": 3,
//     "Manager 5": 10,
//     "Manager 6 Team 1": 4,
//     "Manager 6 Team 2": 4,
//     "Manager 6 Team 3": 3,
//     "Manager 7": 17,
//     "Manager 8 Team 1": 12,
//     "Manager 8 Team 2": 6,
//     "Manager 9": 5,
//   };

//   const dependencies = [
//     ["Manager 1", "Manager 3"],
//     ["Manager 4 Team 1", "Manager 4 Team 3"],
//     ["Manager 8 Team 1", "Manager 8 Team 2"],
//   ];

//   const totalSeats = 42;
//   let schedule = {
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//   };
//   let assignedDays = {};

//   for (let team in teams) {
//     assignedDays[team] = [];
//   }

//   function canAddTeam(day, team) {
//     let currentSeats = schedule[day].reduce((sum, t) => sum + teams[t], 0);
//     return currentSeats + teams[team] <= totalSeats;
//   }

//   for (let team in teams) {
//     let availableDays = weekDays.filter((day) => assignedDays[team].length < 2);
//     availableDays.sort(() => Math.random() - 0.5);

//     for (let day of availableDays) {
//       if (canAddTeam(day, team)) {
//         schedule[day].push(team);
//         assignedDays[team].push(day);
//       }
//       if (assignedDays[team].length === 2) break;
//     }
//   }

//   for (let [team1, team2] of dependencies) {
//     let commonDay = assignedDays[team1].find((day) =>
//       assignedDays[team2].includes(day)
//     );

//     if (!commonDay) {
//       for (let day of assignedDays[team1]) {
//         if (canAddTeam(day, team2)) {
//           schedule[day].push(team2);
//           assignedDays[team2].push(day);
//           break;
//         }
//       }
//     }
//   }

//   for (let [team1, team2] of dependencies) {
//     if (
//       assignedDays[team1].includes("Friday") &&
//       assignedDays[team2].includes("Friday")
//     ) {
//       for (let altDay of weekDays.slice(0, 4)) {
//         if (canAddTeam(altDay, team2)) {
//           schedule["Friday"] = schedule["Friday"].filter((t) => t !== team2);
//           schedule[altDay].push(team2);
//           assignedDays[team2] = assignedDays[team2].map((day) =>
//             day === "Friday" ? altDay : day
//           );
//           break;
//         }
//       }
//     }
//   }

//   return (
//     <TableContainer component={Paper} style={{ margin: "20px", width: "90%" }}>
//       <Table>
//         <TableHead>
//           <TableRow style={{ backgroundColor: "#1976D2" }}>
//             <TableCell style={{ color: "white", fontWeight: "bold" }}>
//               Day
//             </TableCell>
//             {Object.keys(teams).map((team) => (
//               <TableCell
//                 key={team}
//                 style={{ color: "white", fontWeight: "bold" }}
//               >
//                 {team}
//               </TableCell>
//             ))}
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {weekDays.map((day) => (
//             <TableRow key={day}>
//               <TableCell style={{ fontWeight: "bold" }}>{day}</TableCell>
//               {Object.keys(teams).map((team) => (
//                 <TableCell key={team} align="center">
//                   {schedule[day].includes(team) ? teams[team] : ""}
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default AllocateSeats;

import React, { useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const defaultTeams = {
  "Manager 1": 10,
  "Manager 2": 14,
  "Manager 3": 7,
  "Manager 4 Team 1": 8,
  "Manager 4 Team 2": 4,
  "Manager 4 Team 3": 3,
  "Manager 5": 10,
  "Manager 6 Team 1": 4,
  "Manager 6 Team 2": 4,
  "Manager 6 Team 3": 3,
  "Manager 7": 17,
  "Manager 8 Team 1": 12,
  "Manager 8 Team 2": 6,
  "Manager 9": 5,
};

const AllocateSeats = () => {
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [teams, setTeams] = useState(defaultTeams);
  const [managerName, setManagerName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [schedule, setSchedule] = useState(null);

  // Function to add a manager and team size dynamically
  const addTeam = () => {
    if (managerName.trim() !== "" && teamSize.trim() !== "") {
      setTeams({ ...teams, [managerName]: parseInt(teamSize, 10) });
      setManagerName("");
      setTeamSize("");
    }
  };

  // Algorithm for seat allocation
  const allocateSeats = () => {
    if (totalSeats.trim() === "" || Object.keys(teams).length === 0) {
      alert("Please enter total seats before allocating.");
      return;
    }

    let assignedDays = {};
    let schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    for (let team in teams) {
      assignedDays[team] = [];
    }

    function canAddTeam(day, team) {
      let currentSeats = schedule[day].reduce((sum, t) => sum + teams[t], 0);
      return currentSeats + teams[team] <= parseInt(totalSeats, 10);
    }

    for (let team in teams) {
      let availableDays = weekDays.filter(
        (day) => assignedDays[team].length < 2
      );
      availableDays.sort(() => Math.random() - 0.5);

      for (let day of availableDays) {
        if (canAddTeam(day, team)) {
          schedule[day].push(team);
          assignedDays[team].push(day);
        }
        if (assignedDays[team].length === 2) break;
      }
    }

    setSchedule(schedule);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Office Seat Allocation
      </Typography>

      {/* Inputs for adding teams */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Manager Name"
          variant="outlined"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Team Size"
          variant="outlined"
          type="number"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={addTeam}>
          Add Team
        </Button>
      </div>

      {/* Input for total seats */}
      <TextField
        label="Total Seats Available"
        variant="outlined"
        type="number"
        value={totalSeats}
        onChange={(e) => setTotalSeats(e.target.value)}
        fullWidth
        style={{ marginBottom: "20px" }}
      />

      {/* Button to allocate seats */}
      <Button
        variant="contained"
        color="secondary"
        onClick={allocateSeats}
        fullWidth
      >
        Allocate Seats
      </Button>

      {/* Display Default Teams Before Allocation */}
      <Typography variant="h5" style={{ marginTop: "30px" }}>
        Teams & Their Sizes
      </Typography>
      <TableContainer component={Paper} style={{ marginTop: "10px" }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#1976D2" }}>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>
                Manager
              </TableCell>
              <TableCell style={{ color: "white", fontWeight: "bold" }}>
                Team Size
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(teams).map(([team, size]) => (
              <TableRow key={team}>
                <TableCell>{team}</TableCell>
                <TableCell>{size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Display Seat Allocation Table After Allocation */}
      {schedule && (
        <>
          <Typography variant="h5" style={{ marginTop: "30px" }}>
            Seat Allocation Table
          </Typography>

          <TableContainer component={Paper} style={{ marginTop: "10px" }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#1976D2" }}>
                  <TableCell style={{ color: "white", fontWeight: "bold" }}>
                    Day
                  </TableCell>
                  {Object.keys(teams).map((team) => (
                    <TableCell
                      key={team}
                      style={{ color: "white", fontWeight: "bold" }}
                    >
                      {team}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {weekDays.map((day) => (
                  <TableRow key={day}>
                    <TableCell style={{ fontWeight: "bold" }}>{day}</TableCell>
                    {Object.keys(teams).map((team) => (
                      <TableCell key={team} align="center">
                        {schedule[day].includes(team) ? teams[team] : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default AllocateSeats;
