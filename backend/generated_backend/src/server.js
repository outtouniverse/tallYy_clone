const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://root:root@cluster0.gxq57.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    
    useUnifiedTopology: true,
  });
  

// Define a schema for the notes
const noteSchema = new mongoose.Schema({
  content: String,
});

const Note = mongoose.model("Note", noteSchema);

// API to get the note
app.get("/api/note", async (req, res) => {
  const note = await Note.findOne();
  res.json(note || { content: "" });
});

// API to update the note
app.post("/api/note", async (req, res) => {
  const { content } = req.body;
  let note = await Note.findOne();
  if (!note) {
    note = new Note({ content });
  } else {
    note.content = content;
  }
  await note.save();
  io.emit("noteUpdated", note);
  res.json(note);
});

// WebSocket connection for real-time updates
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
