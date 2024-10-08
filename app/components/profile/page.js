"use client";
import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import supabase from "@/app/supabase/supabaseClient"; // Adjust the import path as needed

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setEmail(user?.email || "");
      setPhoneNumber(user?.user_metadata?.phone || "");
      setProfilePhoto(
        user?.user_metadata?.avatar_url || "/default-profile.png"
      );
      setLoading(false);
    };
    fetchSession();
  }, []);

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data, error: uploadError } = await supabase.storage
        .from("juice-images")
        .upload(`public/${file.name}`, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("juice-images")
        .getPublicUrl(`public/${file.name}`);

      setProfilePhoto(publicData.publicUrl);
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error("An unexpected error occurred:", err);
      setError("An error occurred while updating the profile photo.");
      toast.error("Failed to update profile photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDialogOpen = () => setOpenUpdateDialog(true);
  const handleUpdateDialogClose = () => setOpenUpdateDialog(false);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      if (phoneNumber !== user?.user_metadata?.phone) {
        const { error: phoneError } = await supabase.auth.updateUser({
          user_metadata: { phone: phoneNumber },
        });
        if (phoneError) throw phoneError;
      }

      if (newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: newEmail,
        });
        if (emailError) throw emailError;
      }

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      toast.success("Profile updated successfully!");
      handleUpdateDialogClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-3">Loading...</div>;

  return (
    <div className="m-4">
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mb: 3, fontWeight: "bold" }}
      >
        User Profile
      </Typography>
      <Typography
        variant="subtitle1"
        align="center"
        color="textSecondary"
        paragraph
        sx={{ mb: 4 }}
      >
        Personal details.
      </Typography>
      <Card sx={{ maxWidth: 600, margin: "auto", padding: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="200"
          image={profilePhoto}
          alt="Profile Photo"
          sx={{ borderRadius: "50%", margin: "auto", width: 150, boxShadow: 2 }}
        />
        <CardContent>
          <Grid container spacing={3} justifyContent="center">
            <Grid item>
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{ border: "1px solid", borderRadius: "50%", padding: 1 }}
              >
                <input
                  type="file"
                  hidden
                  onChange={handleProfilePhotoChange}
                  disabled={loading}
                />
                <PhotoCamera />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                Full Name
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.user_metadata?.full_name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                Email Address
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.email || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                Phone Number
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {phoneNumber || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                Joined Date
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.created_at || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                About
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.user_metadata?.bio || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <Button
          onClick={handleUpdateDialogOpen}
          variant="contained"
          color="primary"
          sx={{ fontWeight: "bold" }}
        >
          Update Profile
        </Button>
      </div>

      <Dialog
        open={openUpdateDialog}
        onClose={handleUpdateDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-2">
            <div className="mb-4">
              <Typography variant="h6" fontWeight="bold">
                Update Profile Photo
              </Typography>
              <div className="flex items-center">
                <img
                  src={profilePhoto}
                  alt="Profile Photo"
                  className="h-24 w-24 rounded-full object-cover shadow-md"
                />
                <input
                  type="file"
                  onChange={handleProfilePhotoChange}
                  disabled={loading}
                  className="ml-4"
                />
              </div>
            </div>

            <TextField
              label="Phone Number"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              className="mb-4 "
              variant="outlined"
              InputLabelProps={{ sx: { fontSize: "0.875rem" } }}
            />

            <TextField
              label="New Email"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={loading}
              className="mb-4"
              variant="outlined"
              InputLabelProps={{ sx: { fontSize: "0.875rem" } }}
            />

            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="mb-4"
              variant="outlined"
              InputLabelProps={{ sx: { fontSize: "0.875rem" } }}
            />

            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="mb-4"
              variant="outlined"
              InputLabelProps={{ sx: { fontSize: "0.875rem" } }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleProfileUpdate}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ fontWeight: "bold" }}
          >
            Update Profile
          </Button>
          <Button
            onClick={handleUpdateDialogClose}
            variant="outlined"
            color="default"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
}
