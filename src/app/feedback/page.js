"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  FaUser,
  FaBriefcase,
  FaCamera,
  FaEnvelope,
  FaStar,
  FaComment,
  FaPaperPlane,
  FaSmile,
  FaRegSmile,
  FaRegStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userImage, setUserImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !role || !email || !comment || !rating) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("role", role);
      formData.append("email", email);
      formData.append("comment", comment);
      formData.append("rating", rating);

      console.log("Form data before submission:", {
        name,
        role,
        email,
        comment,
        rating,
        hasImage: !!userImage,
        imageSize: userImage?.size,
        imageType: userImage?.type,
      });

      if (userImage) {
        formData.append("userImage", userImage);
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      const data = await response.json();

      toast.success(data.message);

      setName("");
      setRole("");
      setEmail("");
      setComment("");
      setRating(0);
      setUserImage(null);
      setImagePreview("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = star <= (hoverRating || rating);
      return (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all duration-200 transform hover:scale-110 ${
            isFilled
              ? "bg-yellow-400 text-yellow-600 shadow-lg"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          {isFilled ? (
            <FaStar className="text-xl" />
          ) : (
            <FaRegStar className="text-xl" />
          )}
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaComment className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Share Your Feedback
          </h1>
          <p className="text-gray-500 mt-2 text-sm">We value your opinion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="relative">
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
            >
              <FaUser className="mr-2 text-primary" />
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Role Field */}
          <div className="relative">
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
            >
              <FaBriefcase className="mr-2 text-emerald-500" />
              Your Role
            </label>
            <div className="relative">
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Developer, Designer"
                required
              />
              <FaBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* User Image Field */}
          <div>
            <label
              htmlFor="userImage"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
            >
              <FaCamera className="mr-2 text-green-500" />
              Profile Photo
            </label>
            <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaCamera className="text-green-400 text-xl cursor-pointer " />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="userImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setUserImage(file);
                      const reader = new FileReader();
                      reader.onload = (e) => setImagePreview(e.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block cursor-pointer  w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-500 file:to-emerald-500 file:text-white hover:file:from-green-600 hover:file:to-emerald-600 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
            >
              <FaEnvelope className="mr-2 text-red-500" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="your@email.com"
                required
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Rating Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaStar className="mr-2 text-yellow-500" />
              Your Rating
            </label>
            <div className="flex justify-between mt-1">{renderStars()}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Comment Field */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center"
            >
              <FaComment className="mr-2 text-primary" />
              Your Feedback
            </label>
            <div className="relative">
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                rows="4"
                placeholder="Share your thoughts and experience..."
                required
              />
              <FaComment className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <IoMdSend className="text-lg" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <FaSmile className="mr-1 text-yellow-500" />
            Thank you for helping us improve!
          </p>
        </div>
      </div>
    </div>
  );
}
