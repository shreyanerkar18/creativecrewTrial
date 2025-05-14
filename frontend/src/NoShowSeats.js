import React, { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Button,
} from "@mui/material";
import axios from "axios";
import { baseurl } from "./utils";
import { AuthContext } from "./AuthProvider";
import { jwtDecode } from "jwt-decode";

export default function NoShowSeats() {
  const { token } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    campus: "",
    floor: "",
    day: "",
  });

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
    campuses: [],
    floors: [],
  });

  const [noShowSeats, setNoShowSeats] = useState([]);
  const [selectedSeatsFromDB, setSelectedSeatsFromDB] = useState([]);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setFirstName(decoded?.firstName || "");
      setLastName(decoded?.lastName || "");
    }
  }, [token]);

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await axios.get(`${baseurl}/getSeatingCapacityAdmin`);
        const data = res.data;
        const unique = (key) => [...new Set(data.map((item) => item[key]))];
        setDropdownData({
          countries: unique("country"),
          states: unique("state"),
          cities: unique("city"),
          campuses: unique("campus"),
          floors: unique("floor"),
        });
      } catch (err) {
        console.error("Dropdown fetch error", err);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch already selected seats by user (to restrict double booking)
  useEffect(() => {
    const fetchSelected = async () => {
      const { country, state, city, campus, floor, day } = filters;
      if (!firstName || !lastName || !country || !state || !city || !campus || !floor || !day) return;
      try {
        const res = await axios.get(`${baseurl}/userBookedSeats`, {
          params: {
            first_name: firstName,
            last_name: lastName,
            ...filters,
          },
        });
        setSelectedSeatsFromDB(res.data.seats || []);
      } catch (err) {
        console.error("Selected seats fetch error", err);
      }
    };
    fetchSelected();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const fetchNoShowSeats = async () => {
    try {
      const res = await axios.get(`${baseurl}/getFilteredNoShows`, {
        params: filters,
      });
      const seats = res.data.map((s) => s.seat_number); // only seat numbers
      setNoShowSeats(seats);
    } catch (err) {
      console.error("No show fetch error", err);
    }
  };

  const handleSeatSelect = async (seatNumber) => {
    if (selectedSeatsFromDB.length > 0) {
      alert("You have already booked a seat for this day.");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      seat_number: seatNumber,
      ...filters,
    };

    try {
      await axios.post(`${baseurl}/selectSeat`, payload);
      alert(`Seat ${seatNumber} booked successfully!`);
      setSelectedSeatsFromDB([seatNumber]); // prevent further booking
      setNoShowSeats((prev) => prev.filter((s) => s !== seatNumber));
    } catch (err) {
      if (err.response && err.response.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to book seat.");
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
        Book No Show Seats
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", mb: 3 }}>
        {[
          { label: "Country", key: "country", options: dropdownData.countries },
          { label: "State", key: "state", options: dropdownData.states },
          { label: "City", key: "city", options: dropdownData.cities },
          { label: "Campus", key: "campus", options: dropdownData.campuses },
          { label: "Floor", key: "floor", options: dropdownData.floors },
          {
            label: "Day",
            key: "day",
            options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          },
        ].map(({ label, key, options }) => (
          <FormControl key={key} sx={{ minWidth: 150 }}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={filters[key] || ""}
              onChange={(e) => handleFilterChange(key, e.target.value)}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Box textAlign="center" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={fetchNoShowSeats}>
          Fetch No Show Seats
        </Button>
      </Box>

      {/* Seats */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
        {noShowSeats.length > 0 ? (
          noShowSeats.map((seat) => (
            <Button
              key={seat}
              variant="contained"
              onClick={() => handleSeatSelect(seat)}
              disabled={selectedSeatsFromDB.length > 0}
              sx={{
                width: 80,
                height: 40,
                backgroundColor: selectedSeatsFromDB.includes(seat) ? "gray" : "orange",
                color: "white",
                '&:hover': {
                  backgroundColor: "darkorange",
                },
              }}
            >
              {filters.floor ? `${filters.floor}-${seat}` : seat}
            </Button>
          ))
        ) : (
          <Typography>No no-show seats found</Typography>
        )}
      </Box>
    </Container>
  );
}