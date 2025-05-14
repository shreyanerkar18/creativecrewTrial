import React from 'react';
import { Button } from '@mui/material';

const Seat = ({ number, isSelected, onClick, managerDetails, managersList, isSeatsChanging, isAddingManager, totalHoeSeats, floor, selectedDay, seatData }) => {
  let isDisabled = true;
  let seats;
  let allocatedSeats;

  if (managerDetails !== "" && managersList.length > 0) {
    const dummy = managersList.flatMap(manager => 
      manager.name !== managerDetails.name ? 
      manager.seats_array[selectedDay] : 
      (seatData[selectedDay] || [])
    ).filter(seat => !(seatData[selectedDay] || []).includes(seat));
    
    allocatedSeats = isSeatsChanging ? dummy.filter(item => !managerDetails.seats_array[selectedDay].includes(item)) : dummy;

    isDisabled = !isSeatsChanging ? isDisabled : managerDetails.seats_array[selectedDay].includes(number) || (!allocatedSeats.includes(number) && (totalHoeSeats.includes(number))) ? false : isDisabled;

    const { seats_array } = managerDetails;
    seats = seats_array[selectedDay];
  } else if (isAddingManager) {
    allocatedSeats = managersList.flatMap(manager => manager.seats_array[selectedDay]);
    seats = [];
    isDisabled = !isSeatsChanging ? isDisabled : seats.includes(number) || (!allocatedSeats.includes(number) && (totalHoeSeats.includes(number))) ? false : isDisabled;
  } else {
    allocatedSeats = [];
    isDisabled = true;
    seats = [];
  }

  return (
    <Button
      variant="contained"
      onClick={onClick}
      style={{ margin: '5px' }}
      disabled={isDisabled}
      sx={{
        width: 30,
        backgroundColor: isSelected ? '#007bff' : '#28a745',
        '&.Mui-disabled': {
          backgroundColor: seats.includes(number) ? "#ffc107" : allocatedSeats.includes(number) ? "#fd7e14" : (totalHoeSeats.includes(number)) ? "#28a745" : ""
        },
      }}
    >
      {floor}-{number}
    </Button>
  );
};

export default Seat;
