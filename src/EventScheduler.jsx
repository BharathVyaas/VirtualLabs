import { useState, useEffect } from "react";
import { getISODay } from "date-fns";
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentTooltip,
  Toolbar,
  DateNavigator,
  CurrentTimeIndicator,
} from "@devexpress/dx-react-scheduler-material-ui";
import { ViewState } from "@devexpress/dx-react-scheduler";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from "@mui/material";
import SlotModal from "./SlotModal";
import CheckIcon from "@mui/icons-material/Check";
import Logo from "./assets/logo.png";
import { addDays, getISOWeek, getMonth, getYear, startOfWeek } from "date-fns";
import axios from "axios";
import bgVlabs from "./assets/bgVlabs.jpeg";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

let DATE = new Date();
let WEEKNUMBER = getISOWeek(new Date());
let MONTH = getMonth(new Date());
let YEAR = getYear(new Date());

const EventSchedulerV2 = () => {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState();
  const [slots, setSlots] = useState();
  const [validatedEmail, setValidatedEmail] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [technologyOptions, setTechnologyOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("authenticate");
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [userNavigated, setUserNavigated] = useState();
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSlots = async (technologyId) => {
    try {
      if (selectedTechnology) {
        const res = await axios.post(
          "http://49.207.10.13:3009/Retrive_SlotDetails_V1",
          {
            WeekNumber: WEEKNUMBER,
            TechnologyId: technologyId || selectedTechnology,
          }
        );
        const newSlots =
          res?.data?.dbresult?.map((slot) => ({
            id: `${slot.DayNumber}-${slot.SlotInTime}-${slot.SlotOutTime}`,
            startDate: new Date(
              YEAR,
              MONTH,
              getDateForDayOfWeek(DATE, slot.DayNumber),
              slot.SlotInTime.split(":")[0],
              slot.SlotInTime.split(":")[1]
            ),
            endDate: new Date(
              YEAR,
              MONTH,
              getDateForDayOfWeek(DATE, slot.DayNumber),
              slot.SlotOutTime.split(":")[0],
              slot.SlotOutTime.split(":")[1]
            ),
            title: `Slots ${slot.NumberOfDistinctMentorsAvailable}`,
          })) || [];
        setSlots(newSlots.filter((slot) => slot.startDate >= new Date()));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const res = await axios.post(
        "http://49.207.10.13:3009/FetchTechnologyBy_Email",
        {
          Email: validatedEmail,
        }
      );
      setTechnologyOptions(
        res?.data?.dbresult?.map((technology) => ({
          id: technology.TechnologyID,
          name: technology.TechnologyName,
        })) || []
      );

      if (res?.data?.dbresult?.length === 1) {
        setSelectedTechnology(res?.data?.dbresult[0].TechnologyID);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setSelectedTechnology(null);
    setTechnologyOptions([]);
    setSlots([]);
  }, [email]);

  useEffect(() => {
    if (validatedEmail) fetchTechnologies();
  }, [validatedEmail]);

  useEffect(() => {
    if (technologyOptions?.length === 1) {
      fetchSlots(technologyOptions?.[0]?.TechnologyID);
    }
  }, [technologyOptions]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleTechnologyChange = (e) => {
    setSelectedTechnology(e.target.value);
  };

  const handleSlotSelection = (slotData) => {
    setSelectedSlotData(slotData);
    setIsModalOpen(true);
  };

  const handleSubmitEmail = async () => {
    try {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (re.test(email)) {
        const res = await axios.post(
          "http://49.207.10.13:3009/Fetch_StudentEmai",
          {
            Email: email,
          }
        );
        if (res?.data?.dbresult?.[0]?.IsAuthenticated) {
          setStudentId(res?.data?.dbresult?.[0]?.studentId);
          setActiveTab("schedule");
          setIsModalOpen(false);
          setValidatedEmail(email);
        } else if (res.status !== 200) {
          setErrorMsg("Email validation failed please try later.");
        } else {
          setValidatedEmail(false);
        }
      } else {
        setValidatedEmail(false);
      }
      setErrorMsg("");
      setSubmitClicked(true);
    } catch (err) {
      setErrorMsg("Email validation failed please try later.");
      console.error(err);
    }
  };

  const handleSchedule = async (e, appointmentData) => {
    try {
      console.log(new Date(appointmentData.startDate).getHours());
      setIsModalOpen(false);
      setShowThankYouModal(true);
      const res = await axios.post(
        "http://49.207.10.13:3009/Update_BookSlot_V1",
        {
          WeekNumber: WEEKNUMBER,
          DayNumber: getISODay(appointmentData.startDate) + 1,
          SlotInTime:
            (String(new Date(appointmentData.startDate).getHours()).length < 2
              ? `0${new Date(appointmentData.startDate).getHours()}`
              : new Date(appointmentData.startDate).getHours()) +
            ":" +
            (String(new Date(appointmentData.startDate).getMinutes()).length < 2
              ? `0${new Date(appointmentData.startDate).getMinutes()}`
              : new Date(appointmentData.startDate).getMinutes()),
          SlotOutTime:
            (String(new Date(appointmentData.endDate).getHours()).length < 2
              ? `0${new Date(appointmentData.endDate).getHours()}`
              : new Date(appointmentData.endDate).getHours()) +
            ":" +
            (String(new Date(appointmentData.endDate).getMinutes()).length < 2
              ? `0${new Date(appointmentData.endDate).getMinutes()}`
              : new Date(appointmentData.endDate).getMinutes()),

          StudentId: studentId,
          Email: validatedEmail,
        }
      );

      setSuccessMessageOpen(res?.data?.dbresult?.[0]?.Message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNavigate = (action) => {
    switch (action) {
      case "next":
        handleNavigateNext();
        break;
      case "previous":
        handleNavigatePrevious();
        break;
      default:
        break;
    }
  };

  const handleNavigateNext = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 7));
  };

  const handleNavigatePrevious = () => {
    setCurrentDate((prevDate) => addDays(prevDate, -7));
  };

  const getDateForDayOfWeek = (date, dayOfWeek) => {
    const startOfWeekDate = startOfWeek(date);

    const adjustedDate = addDays(startOfWeekDate, dayOfWeek - 1);

    return adjustedDate.getDate();
  };

  useEffect(() => {
    if (showThankYouModal) {
      setTimeout(() => window.location.reload(), 7000);
    }
  }, [showThankYouModal]);

  const onCurrentDateChange = async (e) => {
    if (startOfWeek(e) >= startOfWeek(new Date())) {
      const weekNumber = getISOWeek(e);
      const month = getMonth(e);
      const year = getYear(e);
      DATE = e;
      WEEKNUMBER = weekNumber;
      MONTH = month;
      YEAR = year;
      try {
        if (selectedTechnology) {
          const res = await axios.post(
            "http://49.207.10.13:3009/Retrive_SlotDetails_V1",
            {
              WeekNumber: weekNumber,
              TechnologyId: selectedTechnology,
            }
          );
          const newSlots =
            res?.data?.dbresult?.map((slot) => ({
              id: `${slot.DayNumber}-${slot.SlotInTime}-${slot.SlotOutTime}`,
              startDate: new Date(
                year,
                month,
                getDateForDayOfWeek(e, slot.DayNumber),

                slot.SlotInTime.split(":")[0],
                slot.SlotInTime.split(":")[1]
              ),
              endDate: new Date(
                year,
                month,
                getDateForDayOfWeek(e, slot.DayNumber),

                slot.SlotOutTime.split(":")[0],
                slot.SlotOutTime.split(":")[1]
              ),
              title: `Slots ${slot.NumberOfDistinctMentorsAvailable}`,
            })) || [];
          setSlots(newSlots.filter((slot) => slot.startDate >= new Date()));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (userNavigated) {
      setUserNavigated(false);
    }
  }, [userNavigated]);

  return (
    <div className="flex justify-center items-center w-full h-screen overflow-auto bg-bg bg-center-bottom bg-cover">
      <div className="xl:w-[90%] w-full mx-auto xl:mx-0">
        <div className="mx-auto w-full">
          <img src={Logo} width={350} height={70} className="h-[9vh]" />
          <main className="h-[91vh] flex flex-row justify-between">
            <div className="w-full">
              <Container maxWidth="md">
                <Box mt={4} mb={4}>
                  <h1
                    align="center"
                    gutterBottom
                    className="animate-pulse text-[1.6rem] md:text-[2rem] xl:text-[2.6rem] text-transparent bg-gradient-to-r from-red-800 via-blue-800 to-pink-800 bg-clip-text"
                  >
                    Live Online Virtual Lab Slot Booking
                  </h1>
                </Box>
                <div className="bg-white rounded-lg p-4">
                  {/* Container for tabs and inputs */}
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    className="bg-white text-black"
                  >
                    <Tab
                      label={
                        <Typography variant="body1" fontWeight="bold">
                          Authenticate
                        </Typography>
                      }
                      value="authenticate"
                    />
                    <Tab
                      label={
                        <Typography variant="body1" fontWeight="bold">
                          Schedule
                        </Typography>
                      }
                      value="schedule"
                      disabled={!validatedEmail}
                    />
                  </Tabs>
                  {activeTab === "authenticate" && (
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="606px"
                    >
                      {/** bg test */}
                      <div className="hidden">
                        <a href="http://www.freepik.com/free-vector/programmer-working-isometric-style_4911005.htm#query=web%20developer&position=13&from_view=keyword&track=ais&uuid=0eb8da38-bad0-4f11-85bd-43323642ff8f">
                          Image by pikisuperstar
                        </a>
                        on Freepik
                      </div>
                      <img
                        src={bgVlabs}
                        width={400}
                        height={300}
                        className="mt-14 mb-8"
                      />
                      {/* Inputs for authentication */}
                      {/* Modify input fields as needed */}
                      <Box mb={2} className="md:w-[70%] w-full">
                        <TextField
                          id="email"
                          label="Enter registered EmailId"
                          variant="outlined"
                          fullWidth
                          value={email}
                          onChange={handleEmailChange}
                          className="bg-white text-black border border-gray-300 rounded-md"
                        />
                      </Box>
                      {/* Modify button as needed */}
                      <Box mb={2} width="70%">
                        <Button
                          onClick={handleSubmitEmail}
                          variant="contained"
                          fullWidth
                          disabled={!email}
                          className="bg-blue-700 text-white hover:bg-blue-700"
                        >
                          Submit Email
                        </Button>
                      </Box>
                      {/* Error message */}
                      {(submitClicked || errorMsg) &&
                        (!validatedEmail || errorMsg) && (
                          <Typography
                            variant="h6"
                            color="error"
                            textAlign="center"
                          >
                            {errorMsg ? (
                              <p>{errorMsg}</p>
                            ) : (
                              <p>
                                Entered Email is not registered please use
                                registered email.
                              </p>
                            )}
                            <p>helpline: 8179191999</p>
                          </Typography>
                        )}
                    </Box>
                  )}
                  {/* Schedule tab */}
                  {activeTab === "schedule" && (
                    <Box mt={4}>
                      <Box
                        display="flex"
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        {/* Select technology dropdown */}
                        <Box width="70%">
                          <Select
                            id="technology"
                            value={selectedTechnology}
                            onChange={handleTechnologyChange}
                            fullWidth
                            displayEmpty
                            variant="outlined"
                            className="bg-white text-black border border-gray-300 rounded-md"
                          >
                            {/* Menu items for technologies */}
                            {technologyOptions?.length !== 1 && (
                              <MenuItem value={null} disabled>
                                Select A Technology
                              </MenuItem>
                            )}
                            {technologyOptions.map((tech) => (
                              <MenuItem key={tech.id} value={tech.id}>
                                {tech.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                        {/* Fetch button */}
                        <Box width="25%">
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() =>
                              selectedTechnology ? fetchSlots() : null
                            }
                            className="bg-blue-500 text-white hover:bg-blue-700"
                          >
                            Fetch
                          </Button>
                        </Box>
                      </Box>
                      {/* Scheduler component */}
                      <Box
                        border="1px solid #ccc"
                        borderRadius={5}
                        height="500px"
                        overflow="auto"
                        width="100%"
                        mt={2}
                        cursor="pointer"
                      >
                        <Scheduler data={slots} onClick={handleSlotSelection}>
                          <ViewState
                            defaultCurrentDate={currentDate}
                            onCurrentDateChange={onCurrentDateChange}
                          />
                          <WeekView startDayHour={8.5} endDayHour={19} />
                          <Toolbar />
                          <DateNavigator />
                          <Appointments />
                          <AppointmentTooltip
                            showOpenButton={false}
                            showCloseButton={true}
                            contentComponent={({
                              appointmentData,
                              ...restProps
                            }) => (
                              <>
                                <AppointmentTooltip.Content
                                  {...restProps}
                                  appointmentData={appointmentData}
                                >
                                  <Box
                                    display="flex"
                                    justifyContent="center"
                                    mt={2}
                                  >
                                    <Button
                                      onClick={() =>
                                        handleSchedule(null, appointmentData)
                                      }
                                      variant="contained"
                                      color="secondary"
                                      style={{ marginRight: "10px" }}
                                    >
                                      Book Slot
                                    </Button>
                                  </Box>
                                </AppointmentTooltip.Content>
                              </>
                            )}
                          />
                          <CurrentTimeIndicator
                            shadePreviousCells={true}
                            updateInterval={10000}
                          />
                        </Scheduler>
                      </Box>
                      {/* Slot modal */}
                      <SlotModal
                        isOpen={isModalOpen}
                        slotData={selectedSlotData}
                        onClose={handleCloseModal}
                        onSchedule={handleSchedule}
                      />
                    </Box>
                  )}
                  {/* Snackbar and dialog components */}
                  <Snackbar
                    open={successMessageOpen}
                    autoHideDuration={6000}
                    onClose={() => setSuccessMessageOpen(false)}
                    message={successMessageOpen}
                  />
                  {successMessageOpen && (
                    <Dialog
                      open={showThankYouModal}
                      onClose={() => setShowThankYouModal(false)}
                      keepMounted
                    >
                      <DialogTitle>Thank You!</DialogTitle>
                      <DialogContent>
                        <Typography variant="body1">
                          {successMessageOpen}
                        </Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => {
                            if (
                              successMessageOpen ===
                              "You have already booked this slot."
                            ) {
                              setShowThankYouModal(false);
                            } else {
                              window.location.reload();
                            }
                          }}
                          color="primary"
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>
                  )}
                </div>
              </Container>
            </div>
          </main>
        </div>
        {/* <footer>
          <div className="max-w-full text-xl font-medium pb-8 grid place-content-center overflow-hidden">
            <span className="">
              © 2023 Naresh i Technologies | Software Training - Online | All
              Rights Reserved.
            </span>
          </div>
        </footer> */}
      </div>
      <div className="xl:flex flex-col mx-auto justify-between min-h-[80vh] w-[30%] ads-container xl:visible hidden"></div>
    </div>
  );
};

export default EventSchedulerV2;
