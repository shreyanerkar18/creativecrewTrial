import React, { useState, useEffect, useContext } from "react";
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

export default function SeatPool() {
  const { token } = useContext(AuthContext);
  let firstName = "";
  let lastName = "";

  if (token) {
    const decoded = jwtDecode(token);
    firstName = decoded?.firstName || "";
    lastName = decoded?.lastName || "";
  }

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
    campuses: [],
    floors: [],
  });

  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    campus: "",
    floor: "",
    day: "",
  });

  const [seats, setSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [loading, setLoading] = useState(false);
  const [noSeatsMessage, setNoSeatsMessage] = useState("");
  const [selectedSeatsFromDB, setSelectedSeatsFromDB] = useState([]);

  // Fetch dropdown data once
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await axios.get(`${baseurl}/getSeatingCapacityAdmin`);
        const seatingData = response.data;

        const uniqueValues = (key) => [...new Set(seatingData.map((item) => item[key]))];

        setDropdownData({
          countries: uniqueValues("country"),
          states: uniqueValues("state"),
          cities: uniqueValues("city"),
          campuses: uniqueValues("campus"),
          floors: uniqueValues("floor"),
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch user-selected seats based on filters
  useEffect(() => {
    const fetchUserSelectedSeats = async () => {
      const { country, state, city, campus, floor, day } = filters;

      // Clear previous state to avoid stale data
      setSelectedSeatsFromDB([]);

      if (!firstName || !lastName || !country || !state || !city || !campus || !floor || !day) {
        return;
      }

      try {
        const response = await axios.get(`${baseurl}/userBookedSeats`, {
          params: {
            first_name: firstName,
            last_name: lastName,
            ...filters,
          },
        });

        const seats = response.data.seats || [];
        setSelectedSeatsFromDB(seats);
      } catch (error) {
        console.error("Error fetching user booked seats:", error);
      }
    };

    fetchUserSelectedSeats();
  }, [
    filters.country,
    filters.state,
    filters.city,
    filters.campus,
    filters.floor,
    filters.day,
  ]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
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
      const response = await axios.post(`${baseurl}/selectSeat`, payload);
      alert(`Seat ${seatNumber} booked successfully!`);

      setOccupiedSeats((prev) => [...prev, seatNumber]);
      setSeats((prev) => prev.filter((s) => s !== seatNumber));
      setSelectedSeatsFromDB((prev) => [...prev, seatNumber]);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      } else {
        console.error("Error booking seat:", error);
        alert("Failed to book seat.");
      }
    }
  };

  const fetchSeats = async () => {
    const { country, state, city, campus, floor, day } = filters;

    if (!country || !state || !city || !campus || !floor || !day) {
      alert("Please select all fields before fetching seats!");
      return;
    }

    try {
      setLoading(true);
      setNoSeatsMessage("");

      const [availableRes, selectedRes] = await Promise.all([
        axios.get(`${baseurl}/getFreeSeats`, { params: filters }),
        axios.get(`${baseurl}/getFreeSeatsFromSelected`, { params: filters }),
      ]);

      const availableSeats = availableRes.data.seats.map((s) => s.seat_number);
      const occupiedSelectedSeats = selectedRes.data.occupiedSeats || [];

      setSeats(availableSeats);
      setSelectedSeatsFromDB(occupiedSelectedSeats);

      const totalSeats = Math.max(...availableSeats, ...occupiedSelectedSeats, 50);
      const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
      const occupied = allSeats.filter(
        (seat) => !availableSeats.includes(seat) || occupiedSelectedSeats.includes(seat)
      );
      setOccupiedSeats(occupied);

      if (availableSeats.length === 0) {
        setNoSeatsMessage("No seats on this floor");
      }

      setSelectedFloor(floor);
    } catch (error) {
      console.error("Error fetching seat data:", error);
      alert("Failed to load seats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      {/* Heading */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {firstName && lastName && (
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Hi, {firstName}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Book Your Seat
        </Typography>
      </Box>

      {/* Dropdowns */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          mb: 3,
        }}
      >
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
              displayEmpty
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

      {/* Fetch Button */}
      <Box textAlign="center" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchSeats}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Seats"}
        </Button>
      </Box>

      {/* No Seats Message */}
      {noSeatsMessage && (
        <Typography sx={{ color: "red", textAlign: "center", mb: 2 }}>
          {noSeatsMessage}
        </Typography>
      )}

      {/* Seat Layout */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {seats.length > 0 || occupiedSeats.length > 0 ? (
          [...Array(Math.max(...seats, ...occupiedSeats, 50))].map((_, index) => {
            const seatNumber = index + 1;
            const isAvailable = seats.includes(seatNumber);
            const isOccupied = occupiedSeats.includes(seatNumber);

            return (
              <Button
                key={seatNumber}
                variant="contained"
                onClick={() => handleSeatSelect(seatNumber)}
                disabled={!isAvailable || isOccupied}
                sx={{
                  width: 90,
                  height: 40,
                  backgroundColor: !isAvailable || isOccupied ? "gray" : "green",
                  color: "white",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: !isAvailable || isOccupied ? "gray" : "#006400",
                  },
                }}
              >
                {selectedFloor ? `${selectedFloor}-${seatNumber}` : `${seatNumber}`}
              </Button>
            );
          })
        ) : (
          <Typography sx={{ mt: 3, color: "gray" }}>
            No seat data available
          </Typography>
        )}
      </Box>
    </Container>
  );
}