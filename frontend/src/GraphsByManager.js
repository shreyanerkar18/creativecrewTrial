import React, { useEffect, useState, useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import { baseurl } from "./utils";
import axios from 'axios';
import { Container, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { AuthContext } from "./AuthProvider";
import { jwtDecode } from 'jwt-decode';

// import {
//   Button, Grid, Typography, Select, MenuItem, InputLabel, FormControl, Paper, TextField, Box, Snackbar, Alert,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow
// } from '@mui/material';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphsbyManager = () => {
  const [managerId, setManagerId] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamOptions, setTeamOptions] = useState([]);
  const [floorGraphData, setFloorGraphData] = useState(null);

  const { token } = useContext(AuthContext);
  const decoded = jwtDecode(token);

  useEffect(() => {
    const fetchManagerTeams = async () => {
      try {
        const response = await axios.get(`${baseurl}/getManagerIdForGraph`, {
          params: {
            bu: decoded.bu,
            firstName: decoded.firstName,
            lastName: decoded.lastName
          }
        });

        const managers = response.data.map(item => ({ id: item.id, team: item.team || "Default" }));

        // Extract unique teams & sort them alphabetically
        const sortedTeams = [...new Set(managers.map(manager => manager.team))].sort();

        setManagerId(managers.map(manager => manager.id));
        setTeamOptions(sortedTeams);

        // Automatically set "Default" if present
        setSelectedTeam(sortedTeams.includes("Default") ? "Default" : sortedTeams[0]);

      } catch (error) {
        console.error('Error fetching manager Ids:', error);
      }
    };

    fetchManagerTeams();
  }, []);


  useEffect(() => {
    if (managerId.length > 0 && selectedTeam) {
      fetchManagerData();
    }
  }, [managerId, selectedTeam]);

  const fetchManagerData = async () => {
    try {
      const response = await axios.get(`${baseurl}/getGraphDetailsForManager`, {
        params: {
          managerId: managerId
        }
      });

      const filteredData = response.data.filter(item => item.manager_team === selectedTeam);

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

      const dayGroupedData = days.reduce((acc, day) => {
        acc[day] = { allocated: 0, occupied: 0 };
        return acc;
      }, {});

      filteredData.forEach(item => {
        days.forEach(day => {
          if (item.manager_seats && item.manager_seats[day]) {
            dayGroupedData[day].allocated = item.manager_seats[day].length;
          }

          if (item.occupied_seats && day === item.day) {
            dayGroupedData[day].occupied = item.occupied_seats.filter(seat => seat !== null).length;
          }
        });
      });

      setFloorGraphData({
        labels: Object.keys(dayGroupedData),
        datasets: [
          {
            label: 'Allocated Seats',
            data: Object.values(dayGroupedData).map(d => d.allocated),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Occupied Seats',
            data: Object.values(dayGroupedData).map(d => d.occupied),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
          }
        ],
      });

    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };

  return (
    <Container>
      <FormControl sx={{ minWidth: 200, mt : 5, mb: 5 }}>
        <InputLabel id="team-select-label"> Select Team</InputLabel>
        <Select
          labelId="team-select-label"
          id="team-select"
          value={selectedTeam}
          label="Select Team"
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          {teamOptions.map(team => (
            <MenuItem key={team} value={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {floorGraphData && <Bar data={floorGraphData} />}
    </Container>
  );
};

export default GraphsbyManager;
