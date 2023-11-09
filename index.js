const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const URL = 'mongodb+srv://admin:admin123@info-6150.xyoqijv.mongodb.net/?retryWrites=true&w=majority';

const PORT = require("./port");
const passwordRegEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

const app = express();
app.use(express.json());

mongoose.connect(URL, {
    dbName: "User",
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
  });

const user = mongoose.model("User", Schema);

const Password = (password) => {
return bcrypt.hashSync(password, 10);
};

const validation = (response, name, email, password) => {
    if (!name || !email || !password) {
      response.status(400).send({ error: "fill all the required fields" });
      return false;
    }
  
    if (password.length < 8) {
      response
        .status(400)
        .send({ error: "Password must be at least 8 characters" });
      return false;
    } else if (!passwordRegEx.test(password)) {
      response.status(400).send({
        error:
          "Password must contain at least one uppercase, one lowercase & one number",
      });
      return false;
    }
return true;
};

app.post("/user/create", (request, response) => {
const { name, email, password } = request.body;
  
if (!validation(response, name, email, password)) return;
  
const NewUser = new user({
    name,
    email,
    password: Password(password),
});
  
NewUser.save().then(
    () => {
    console.log("Entry added for the user in DB");
    response.send("User created successfully");
    },
    (err) => console.log(err),
);
});

app.put("/user/edit", async (request, response) => {
const { name, email, password } = request.body;
  
if (!validation(response, name, email, password)) return;
  
let CUser = await user.findOneAndUpdate(
    { email: email },
    { name, password: Password(password) },
);
  
console.log(CUser);
  
if (!CUser) {
    response.send("User not found!");
} else {
    response.send(await user.findOne({ email: email }));
}
});

app.delete("/user/delete", async (request, response) => {
const { email } = request.body;
  
if (!email) {
    response.status(400).send({ error: "Missing required fields." });
    return;
}
  
let CUser = await user.findOneAndDelete({ email: email });
  
if (!CUser) {
    response.send("User not found!");
} else {
    response.send("User deleted successfully!");
}
});
  
app.get("/user/getall", async (_, response) => {
response.send(await user.find());
});
  
app.listen(PORT, () => {
console.log("Listening on PORT: " + PORT);
});