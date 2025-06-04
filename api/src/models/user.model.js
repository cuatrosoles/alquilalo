// src/models/user.model.js
const userSchema = {
    uid: String,       // ID único proporcionado por Firebase Auth
    name: String,
    email: String,
    phoneNumber: String,
    location: String,
    profileImage: String,
    createdAt: Date,
    updatedAt: Date,
    // Otros campos específicos del usuario podrían ir aquí
  };
  
  export default userSchema;