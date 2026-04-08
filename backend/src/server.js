//ENTRY POINT OF THE BACKEND, STARTS THE SERVER AND LISTENS ON PORT 5000

require("dotenv").config();
const app = require("./app");

app.listen(5000, () => { 
  console.log("Server running on port 5000");
});