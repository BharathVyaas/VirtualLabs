import React from "react";
import { Modal, Button } from "@mui/material";

const SlotModal = ({ isOpen, onClose, onSchedule }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
        }}
      >
        <h2>Slot Options</h2>
        <Button
          onClick={onSchedule}
          variant="contained"
          color="primary"
          style={{ marginRight: "10px" }}
        >
          Schedule
        </Button>
        <Button onClick={onClose} variant="contained">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default SlotModal;
