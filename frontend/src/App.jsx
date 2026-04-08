//PROVIDE GOOGLE OAUTH CONTEXT TO THE ENTIRE APP

import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID"> //GET FROM TASH
      <AuthProvider>
        {/* your routes/components */}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;