"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import {
  FaUser,
  FaBriefcase,
  FaComment,
  FaImage,
  FaFacebook,
  FaLinkedin,
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaSpinner,
  FaUsers,
  FaEye,
  FaUpload,
} from "react-icons/fa";

export default function CreateEmployee() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    comment: "",
    facebook: "",
    twitter: "",
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Admin authentication check
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    if (!session.user.isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      toast.info("Profile image selected");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.role.trim() ||
      !formData.comment.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.image) {
      toast.error("Please select a profile image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("role", formData.role.trim());
      formDataToSend.append("comment", formData.comment.trim());
      formDataToSend.append("facebook", formData.facebook.trim());
      formDataToSend.append("twitter", formData.twitter.trim());
      formDataToSend.append("image", formData.image);

      const response = await fetch("/api/admin/team", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create team member");
      }

      toast.success("🎉 Team member created successfully!");

      setTimeout(() => {
        router.push("/admin/ourTeams");
      }, 1500);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.role || formData.comment || formData.image) {
      if (
        confirm(
          "Are you sure you want to cancel? All unsaved changes will be lost."
        )
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className="text-md" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <FaUsers className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add Team Member
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new team member profile
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaUser className="text-primary text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    Full Name
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder="Enter full name"
                  required
                  maxLength={100}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.name.length}/100
                </div>
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaBriefcase className="text-primary text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    Role/Position
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  required
                  maxLength={100}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.role.length}/100
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaComment className="text-primary text-md" />
                <span className="label-text text-md font-semibold text-gray-700">
                  Bio/Comment
                </span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary w-full text-md py-3 min-h-32"
                placeholder="Write a brief description about this team member..."
                required
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.comment.length}/500
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaFacebook className="text-emerald-600 text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    Facebook URL
                  </span>
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaLinkedin className="text-emerald-700 text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    LinkedIn URL
                  </span>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-md" />
                <span className="label-text text-md font-semibold text-gray-700">
                  Profile Image
                </span>
                <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2">
                  <FaUpload />
                  Choose Image
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                    required
                  />
                </label>

                <span className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </div>

              {imagePreview && (
                <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                  <p className="font-semibold text-success mb-3 flex items-center gap-2">
                    <FaEye />
                    Image Preview
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-xl shadow-md p-2">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Selected Image
                      </p>
                      <p className="text-sm text-gray-600">
                        {formData.image?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(formData.image?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="btn flex-1 text-md py-3"
                disabled={isSubmitting}
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary flex-1 text-md py-3 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create Team Member
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-info/10 rounded-lg border border-info/20">
            <h3 className="font-semibold text-info mb-2 flex items-center gap-2">
              <FaUsers />
              Quick Tips
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Use high-quality professional headshots for profile images
              </li>
              <li>• Keep bios concise and engaging (2-3 sentences)</li>
              <li>• Include relevant social media links for networking</li>
              <li>• Ensure role titles are clear and descriptive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
