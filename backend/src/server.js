//ENTRY POINT OF THE BACKEND, STARTS THE SERVER AND LISTENS ON PORT 5000

require("dotenv").config();
const app = require("./app");

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});