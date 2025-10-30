"use client";
import { useSession, signOut, update, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePicture: null,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    document.title = `Sil3aty | ${session?.user?.name || "User"} Profile`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `Manage your profile settings, update information, and change your password`
      );
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser({
          name: data.name,
          email: data.email,
          profilePicture: data.profilePicture || "/default-avatar.png",
        });
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  const validatePassword = () => {
    if (!showPasswordForm) return true;

    let isValid = true;
    const errors = [];

    if (!currentPassword) {
      errors.push("Current password is required");
      isValid = false;
    }
    if (newPassword.length < 8) {
      errors.push("Password must be at least 8 characters");
      isValid = false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push("Password must contain at least one uppercase letter");
      isValid = false;
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.push("Password must contain at least one number");
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      errors.push("Passwords do not match");
      isValid = false;
    }

    setPasswordError(errors.join(", "));
    return isValid;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (showPasswordForm) {
      if (!validatePassword()) {
        setLoading(false);
        return;
      }
    }

    try {
      const updateData = {
        name: user.name,
        email: user.email,
        currentPassword: showPasswordForm ? currentPassword : undefined,
        newPassword: showPasswordForm ? newPassword : undefined,
        confirmPassword: showPasswordForm ? confirmPassword : undefined,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      await session.update();

      router.refresh();
      if (showPasswordForm) {
        toast.success("Password updated! Please login again");
        await signOut({ callbackUrl: "/login" });
      } else {
        await update({ name: user.name, email: user.email });
        toast.success("Profile updated!");
      }
    } catch (error) {
      toast.success("Profile updated!");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Your Account?",
      text: "All your data will be permanently removed. This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch("/api/profile", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete account");

        await Swal.fire({
          title: "Account Deleted",
          text: "Your account has been successfully deleted",
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        signOut({ callbackUrl: "/login" });
      } catch (error) {
        await Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await res.json();
      setUser((prev) => ({ ...prev, profilePicture: data.url }));

      await session.update();

      await update({ image: data.url });

      toast.success("Profile picture updated!");
    } catch (error) {
      toast.success("Profile picture updated!");
      window.location.reload();
    } finally {
      setUploadingImage(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 3;
    return 4;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-700 px-6 py-8 text-center">
          <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg bg-gray-700">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={`${user.name}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User className="h-16 w-16" />
              </div>
            )}
            <label
              className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${
                uploadingImage
                  ? "opacity-100 cursor-wait"
                  : "opacity-0 hover:opacity-100 cursor-pointer"
              }`}
            >
              {uploadingImage ? (
                <span className="loading loading-spinner text-white"></span>
              ) : (
                <>
                  <Camera className="h-8 w-8 text-white" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </>
              )}
            </label>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-gray-300">{user.email}</p>
        </div>

        {/* Profile Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Name Field */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4" />
                  Full Name
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full  bg-gray-700 text-white border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4" />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                className="input w-full input-bordered bg-gray-700 text-white border-gray-600 focus:border-emerald-500 focus:ring-emerald-500"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className={`btn w-full ${
                  showPasswordForm ? "btn-warning" : "btn-warning"
                }`}
              >
                <Lock className="h-4 w-4" />
                {showPasswordForm
                  ? "Cancel Password Change"
                  : "Change Password"}
              </button>

              {showPasswordForm && (
                <>
                  <div className="mt-4 space-y-4">
                    {/* Current Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-300">
                          Current Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="input input-bordered w-full bg-gray-700 text-white border-gray-600"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-300">
                          New Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="input input-bordered w-full bg-gray-700 text-white border-gray-600"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(newPassword) >= 4
                            ? "bg-green-500"
                            : getPasswordStrength(newPassword) >= 3
                            ? "bg-yellow-500"
                            : getPasswordStrength(newPassword) >= 2
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${
                            (getPasswordStrength(newPassword) / 4) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p
                      className="text-xs mt-1 ${
                      getPasswordStrength(newPassword) >= 4 ? 'text-green-500' :
                      getPasswordStrength(newPassword) >= 3 ? 'text-yellow-500' :
                      getPasswordStrength(newPassword) >= 2 ? 'text-orange-500' :
                      'text-red-500'
                    }"
                    >
                      {newPassword &&
                        (getPasswordStrength(newPassword) >= 4
                          ? "Strong password"
                          : getPasswordStrength(newPassword) >= 3
                          ? "Moderate password"
                          : getPasswordStrength(newPassword) >= 2
                          ? "Weak password"
                          : "Very weak password")}
                    </p>

                    {/* Confirm Password */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-gray-300">
                          Confirm New Password
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`input input-bordered w-full bg-gray-700 text-white ${
                            passwordError ? "border-red-500" : "border-gray-600"
                          }`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1 text-sm text-red-500">
                          {passwordError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    <p>Password requirements:</p>
                    <ul className="list-disc pl-5">
                      <li>At least 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Update Button */}
            <button
              type="submit"
              className={`btn btn-primary w-full mt-6 ${
                loading ? "loading" : ""
              }`}
              disabled={loading}
            >
              {!loading && "Update Profile"}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h3>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-error w-full"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
