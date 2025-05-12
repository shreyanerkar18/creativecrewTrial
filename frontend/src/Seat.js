import React from 'react';
import { Button } from '@mui/material';

const Seat = ({ number, isSelected, onClick, managerDetails, managersList, isSeatsChanging, isAddingManager, totalHoeSeats, floor, selectedDay, seatData, selectedTeam }) => {
  let isDisabled = true;
  let seats;
  let allocatedSeats;

  if (managerDetails !== "" && managersList.length > 0 && selectedTeam!=="" && selectedTeam!=="default") {
    const dummy = managersList.flatMap(manager => 
      manager.teams.flatMap(team => team.teamId !== selectedTeam ? team.seats_array[selectedDay] : (seatData[selectedDay] || []))
    ).filter(seat => !(seatData[selectedDay] || []).includes(seat));
    
    allocatedSeats = isSeatsChanging ? dummy.filter(item => !managerDetails.teams.find(item => item.teamId === selectedTeam).seats_array[selectedDay].includes(item)) : dummy;

    isDisabled = !isSeatsChanging ? isDisabled : managerDetails.teams.find(item => item.teamId === selectedTeam).seats_array[selectedDay].includes(number) || (!allocatedSeats.includes(number) && (totalHoeSeats.includes(number))) ? false : isDisabled;

    if (!isAddingManager) {
      const { seats_array } = managerDetails.teams.find(item => item.teamId === selectedTeam);
      seats = seats_array[selectedDay];
    } else {
      const seats_array = seatData;
      seats = seats_array[selectedDay];
    }
  } else if (isAddingManager) {
    allocatedSeats = managersList.flatMap(manager => manager.teams.flatMap( item => item.seats_array[selectedDay]));
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
