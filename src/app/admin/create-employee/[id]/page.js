"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
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
  FaEdit,
} from "react-icons/fa";

export default function EditEmployee() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    comment: "",
    facebook: "",
    twitter: "",
    image: null,
    existingImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        const response = await fetch(`/api/admin/team/${id}`);
        if (!response.ok) throw new Error("Failed to fetch team member");
        const data = await response.json();

        setFormData({
          name: data.name,
          role: data.role,
          comment: data.comment,
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          image: null,
          existingImage: data.image,
        });

      } catch (err) {
        toast.error(`❌ ${err.message}`);
        setTimeout(() => {
          router.push("/admin/ourTeams");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTeamMember();
    }
  }, [id, router]);

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
      toast.info("New image selected");
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

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("role", formData.role.trim());
      formDataToSend.append("comment", formData.comment.trim());
      formDataToSend.append("facebook", formData.facebook.trim());
      formDataToSend.append("twitter", formData.twitter.trim());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch(`/api/admin/team/${id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update team member");
      }

      toast.success("🎉 Team member updated successfully!");

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
    const hasChanges =
      formData.name !== formData.originalName ||
      formData.role !== formData.originalRole ||
      formData.comment !== formData.originalComment ||
      formData.image;

    if (hasChanges) {
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

  const hasChanges =
    formData.name !== formData.originalName ||
    formData.role !== formData.originalRole ||
    formData.comment !== formData.originalComment ||
    formData.image;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Team Member...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch team member details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning rounded-2xl shadow-lg">
              <FaEdit className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Edit Team Member
              </h1>
              <p className="text-gray-600 mt-1">
                Update team member information
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaUser className="text-primary text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    Full Name
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
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
                  <FaBriefcase className="text-primary text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    Role/Position
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
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
                <FaComment className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">
                  Bio/Comment
                </span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary w-full text-lg py-3 min-h-32"
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
                  <FaFacebook className="text-emerald-600 text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    Facebook URL
                  </span>
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaLinkedin className="text-emerald-700 text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    LinkedIn URL
                  </span>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">
                  Profile Image
                </span>
              </label>

              {/* Current Image */}
              {formData.existingImage && (
                <div className="mb-4 p-4 border-2 border-dashed border-info rounded-lg bg-info/10">
                  <p className="font-semibold text-info mb-3 flex items-center gap-2">
                    <FaEye />
                    Current Image
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-xl shadow-md p-2">
                      <img
                        src={formData.existingImage}
                        alt="Current profile"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Current Profile Image
                      </p>
                      <p className="text-sm text-gray-600">
                        This image will be kept if no new image is selected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2">
                  <FaUpload />
                  Change Image
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>

                <span className="text-sm text-gray-500">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </div>

              {/* New Image Preview */}
              {imagePreview && (
                <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                  <p className="font-semibold text-success mb-3 flex items-center gap-2">
                    <FaEye />
                    New Image Preview
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-xl shadow-md p-2">
                      <img
                        src={imagePreview}
                        alt="New profile preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-success">
                        New Image Selected
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost flex-1 text-lg py-3"
                disabled={isSubmitting}
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-warning flex-1 text-lg py-3 flex items-center gap-2"
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Team Member
                  </>
                )}
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-warning text-sm font-semibold flex items-center gap-2">
                  <FaEdit />
                  You have unsaved changes
                </p>
              </div>
            )}
          </form>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-info/10 rounded-lg border border-info/20">
            <h3 className="font-semibold text-info mb-2 flex items-center gap-2">
              <FaUsers />
              Quick Tips
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Update social links to keep team information current</li>
              <li>
                • Use high-quality professional headshots for best results
              </li>
              <li>• Keep bios concise and engaging (2-3 sentences)</li>
              <li>
                • Ensure role titles accurately reflect current responsibilities
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
