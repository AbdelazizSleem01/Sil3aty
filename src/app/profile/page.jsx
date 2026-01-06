"use client";
import { useSession, signOut, update, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
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
import Link from "next/link";
import Image from "next/image";
import {
  FaReadme,
  FaBookmark,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, i18n } = useTranslation();
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
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);

  useEffect(() => {
    document.title = `${t("name")} | ${t("profilePage", {
      name: session?.user?.name || t("name"),
    })}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("manageYourProfile"));
    }
  }, [session, t]);

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

    const fetchBookmarks = async () => {
      try {
        const res = await fetch("/api/profile/bookmarks");
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks || []);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setBookmarksLoading(false);
      }
    };

    if (session) {
      fetchUserProfile();
      fetchBookmarks();
    }
  }, [session]);

  const validatePassword = () => {
    if (!showPasswordForm) return true;

    let isValid = true;
    const errors = [];

    if (!currentPassword) {
      errors.push(t("currentPasswordIsRequired"));
      isValid = false;
    }
    if (newPassword.length < 8) {
      errors.push(t("passwordMustBeAtLeast8Characters"));
      isValid = false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      errors.push(t("passwordMustContainAtLeastOneUppercaseLetter"));
      isValid = false;
    }
    if (!/[0-9]/.test(newPassword)) {
      errors.push(t("passwordMustContainAtLeastOneNumber"));
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      errors.push(t("passwordsDoNotMatch"));
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
      };

      if (
        showPasswordForm &&
        currentPassword &&
        newPassword &&
        confirmPassword
      ) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
        updateData.confirmPassword = confirmPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || t("updateFailed"));
        return;
      }

      const result = await res.json();

      if (showPasswordForm && result.passwordUpdated) {
        toast.success(t("passwordUpdatedPleaseLoginAgain"));
        await signOut({ callbackUrl: "/login" });
      } else {
        await update({ name: user.name, email: user.email });
        toast.success(t("profileUpdated"));
        router.refresh();
      }
    } catch (error) {
      toast.error(t("failPasswordUpdate"));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: t("deleteYourAccount"),
      text: t("allYourDataWillBePermanentlyRemoved"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("yesDeleteIt"),
      cancelButtonText: t("cancel"),
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch("/api/profile", { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete account");

        await Swal.fire({
          title: t("accountDeleted"),
          text: t("yourAccountHasBeenSuccessfullyDeleted"),
          icon: "success",
          confirmButtonColor: "#10b981",
        });

        signOut({ callbackUrl: "/login" });
      } catch (error) {
        await Swal.fire({
          title: t("error"),
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
      toast.error(t("pleaseUploadAnImageFile"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("imageSizeMustBeLessThan2MB"));
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
        throw new Error(error.message || t("uploadFailed"));
      }

      const data = await res.json();
      setUser((prev) => ({ ...prev, profilePicture: data.url }));

      await session.update();

      await update({ image: data.url });

      toast.success(t("profilePictureUpdated"));
    } catch (error) {
      toast.error(t("failProfilePictureUpdate"));
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
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className=" rounded-xl shadow-2xl overflow-hidden">
          <div className=" px-6 py-8 text-center">
            <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg ">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={`${user.name}'s profile`}
                  className="w-full h-full object-cover"
                  width={100}
                  height={100}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center ">
                  <User className="h-16 w-16" />
                </div>
              )}
              <label
                className={`absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center transition-opacity ${
                  uploadingImage
                    ? "opacity-100 cursor-wait"
                    : "opacity-0 hover:opacity-100 cursor-pointer"
                }`}
              >
                {uploadingImage ? (
                  <span className="loading loading-spinner "></span>
                ) : (
                  <>
                    <Camera className="h-8 w-8 " />
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
            <h1 className="mt-4 text-2xl font-bold ">{user.name}</h1>
            <p className="">{user.email}</p>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="form-control w-full">
                <label className="label mb-2">
                  <span className="label-text flex items-center gap-2 ">
                    <User className="h-4 w-4" />
                    {t("fullName")}
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label mb-2">
                  <span className="label-text flex items-center gap-2 ">
                    <Mail className="h-4 w-4" />
                    {t("emailAddress")}
                  </span>
                </label>
                <input
                  type="email"
                  className="input w-full input-bordered  border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </div>

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
                    ? t("cancelPasswordChange")
                    : t("changePassword")}
                </button>

                {showPasswordForm && (
                  <>
                    <div className="mt-4 space-y-4">
                      <div className="form-control">
                        <label className="label mb-2">
                          <span className="label-text ">
                            {t("currentPassword")}
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
                            className={`absolute ${
                              i18n.language === "ar" ? "left-3" : "right-3"
                            } top-3`}
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

                      <div className="form-control">
                        <label className="label mb-2">
                          <span className="label-text ">
                            {t("newPassword")}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            className="input input-bordered w-full  border-gray-300"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className={`absolute ${
                              i18n.language === "ar" ? "left-3" : "right-3"
                            } top-3`}
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

                      <div className="w-full border border-gray-300 rounded-full h-2 mt-1">
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
                            ? t("strongPassword")
                            : getPasswordStrength(newPassword) >= 3
                            ? t("moderatePassword")
                            : getPasswordStrength(newPassword) >= 2
                            ? t("weakPassword")
                            : t("veryWeakPassword"))}
                      </p>

                      <div className="form-control">
                        <label className="label mb-2">
                          <span className="label-text">
                            {t("confirmNewPassword")}
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`input input-bordered w-full  ${
                              passwordError
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className={`absolute ${
                              i18n.language === "ar" ? "left-3" : "right-3"
                            } top-3`}
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

                    <div className="text-xs text-gray-500 mt-2">
                      <p>{t("passwordRequirements")}</p>
                      <ul
                        className={`list-disc space-y-1 ${
                          i18n.language === "ar" ? "pr-5" : "pl-5"
                        }`}
                      >
                        <li>{t("atLeast8Characters")}</li>
                        <li>{t("atLeastOneUppercaseLetter")}</li>
                        <li>{t("atLeastOneNumber")}</li>
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
                {!loading && t("updateProfile")}
              </button>
            </form>

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-4">
                <AlertTriangle className="h-5 w-5" />
                {t("dangerZone")}
              </h3>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-error w-full"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteYourAccount")}
              </button>
            </div>
          </div>
        </div>

        {/* Bookmarked Articles Section */}
        <div className=" rounded-xl shadow-2xl overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3 mb-6">
              <FaBookmark className="text-2xl text-blue-500" />
              <h2 className="text-2xl font-bold">{t("bookmarkedArticles")}</h2>
            </div>

            {bookmarksLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <FaBookmark className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t("noBookmarkedArticles")}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t("startExploringAndBookmark")}
                </p>
                <Link href="/blogs" className="btn btn-primary">
                  {t("exploreCollections")}
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blogs/${blog.slug}`}
                    className="block group"
                  >
                    <div className=" rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      {blog.coverImage && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={blog.coverImage}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="badge badge-primary">
                              <FaBookmark className="w-3 h-3 mx-1" />
                              {t("saved")}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {blog.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaClock className="w-4 h-4" />
                            <span>
                              {blog.estimatedReadTime} {t("min")}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <FaEye className="w-4 h-4" />
                              <span>{blog.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaHeart className="w-4 h-4" />
                              <span>{blog.likesCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                          {blog.author?.profilePicture ? (
                            <Image
                              src={blog.author.profilePicture}
                              alt={blog.author.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            {blog.author?.name || t("authorUnknown")}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-400">
                            {new Date(blog.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
