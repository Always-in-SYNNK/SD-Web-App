//HANDLES API CALL TO BACKEND FOR GOOGLE LOGIN - SEPARATE SERVICE LAYER FOR CLEANER COMPONENTS AND REUSABILITY

export async function loginWithGoogle(token, role) {

  console.log("Sending token:", token); //debugging
  console.log("Role:", role);

  const response = await fetch("http://localhost:5000/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, role }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json(); // { user, token }
}