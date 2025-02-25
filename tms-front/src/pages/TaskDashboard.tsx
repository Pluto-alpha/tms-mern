import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import TaskCard from "../components/TaskCard";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../features/task/taskSlice";
import { RootState } from "../redux/store";
import { searchTasks } from "../features/task/taskSlice";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

const TaskDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state: RootState) => state.tasks.tasks);
  const loading = useAppSelector((state: RootState) => state.tasks.loading);
  const [taskDetails, setTaskDetails] = useState({
    _id: "",
    title: "",
    description: "",
    dueDate: "",
    status: "Pending",
  });
  const [statusSearch, setStatusSearch] = useState<string>("");
  const [dateSearch, setDateSearch] = useState<string>("");

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateTask = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (editing) {
      dispatch(updateTask({ taskId: taskDetails._id, task: taskDetails }));
      dispatch(fetchTasks());
    } else {
      dispatch(createTask(taskDetails));
      dispatch(fetchTasks());
    }
    setOpenDialog(false);
    resetTaskDetails();
  };

  const handleDeleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    dispatch(deleteTask(taskId));
  };

  const resetTaskDetails = () => {
    setTaskDetails({
      _id: "",
      title: "",
      description: "",
      dueDate: "",
      status: "Pending",
    });
    setEditing(false);
  };

  const handleCancel = () => {
    resetTaskDetails();
    setOpenDialog(false);
  };

  const handleEditTask = (task: typeof taskDetails) => {
    setTaskDetails(task);
    setEditing(true);
    setOpenDialog(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name === "dueDate") {
      const isoDate = moment(value as string).toISOString();
      setTaskDetails({ ...taskDetails, [name]: isoDate });
    } else {
      setTaskDetails({ ...taskDetails, [name as string]: value });
    }
  };

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    setTaskDetails({ ...taskDetails, status: e.target.value });
  };

  const handleSearch = () => {
    const searchParams = {
      status: statusSearch.trim()
        ? capitalizeFirstLetter(statusSearch.trim())
        : undefined,
      dueDate: dateSearch.trim()
        ? moment(dateSearch.trim()).format("DD-MM-YYYY")
        : undefined,
    };
    dispatch(searchTasks(searchParams));
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Task Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, display: "flex", justifyContent:'space-around' }}>
        <FormControl sx={{ width: 200 }} variant="outlined">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusSearch}
            onChange={(e) => setStatusSearch(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Due Date"
          type="date"
          value={dateSearch}
          onChange={(e) => setDateSearch(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          endIcon={<SearchIcon />}
        >
          Search
        </Button>

        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          endIcon={<AddIcon />}
        >
          Add Task
        </Button>
      </Box>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>{editing ? "Edit Task" : "Create Task"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            name="title"
            value={taskDetails.title}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3, mt: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={taskDetails.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Due Date"
            slotProps={{ inputLabel: { shrink: true } }}
            name="dueDate"
            value={
              taskDetails.dueDate
                ? moment(taskDetails.dueDate).format("YYYY-MM-DDTHH:mm")
                : ""
            }
            onChange={handleChange}
            fullWidth
            type="datetime-local"
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={taskDetails.status}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleCreateTask}>
            {editing ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ p: 3, display: "flex", flexWrap: "wrap", gap: 3 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : tasks.length === 0 ? (
          <Typography>No tasks found.</Typography>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              title={task.title}
              description={task.description}
              dueDate={task.dueDate}
              status={task.status}
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default TaskDashboard;
