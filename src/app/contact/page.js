"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { 
  FaUser, 
  FaEnvelope, 
  FaFolder, 
  FaComment,
  FaPaperPlane,
  FaPhone,
  FaMapMarkerAlt,
  FaClock
} from "react-icons/fa";
import { 
  FiUser, 
  FiMail, 
  FiFolder, 
  FiMessageCircle,
  FiSend 
} from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      Swal.fire({
        title: "Success!",
        text: "Message sent successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "dark:bg-base-300 dark:text-white",
          confirmButton: "btn btn-primary",
        },
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary mb-4">
            <FaPaperPlane className="text-3xl text-white animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-base-100 shadow-xl border border-base-300 h-fit">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6 flex items-center gap-2">
                  <FaComment className="text-primary" />
                  Contact Info
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <FaPhone className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Phone</h3>
                      <p className="text-gray-600 dark:text-gray-300">+20 1012105407</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
                    <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                      <FaEnvelope className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">abdelazizsleem957@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
                    <div className="p-3 rounded-full bg-accent/10 text-accent">
                      <FaMapMarkerAlt className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Address</h3>
                      <p className="text-gray-600 dark:text-gray-300">Benha<br />Qlubia, EGYPT</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors">
                    <div className="p-3 rounded-full bg-info/10 text-info">
                      <FaClock className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Business Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300">Mon - Fri: 9AM - 6PM<br />Sat: 10AM - 4PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-2xl border border-base-300">
              <div className="card-body p-6 lg:p-8">
                {error && (
                  <div className="alert alert-error mb-6 animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-lg font-semibold flex items-center gap-2">
                          <FiUser className="text-primary text-xl" />
                          Full Name
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        className="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-lg font-semibold flex items-center gap-2">
                          <FiMail className="text-primary text-xl" />
                          Email Address
                        </span>
                      </label>
                      <input
                        type="email"
                        required
                        className="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold flex items-center gap-2">
                        <FiFolder className="text-primary text-xl" />
                        Subject
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input input-bordered input-primary w-full focus:ring-2 focus:ring-primary/20 transition-all"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-semibold flex items-center gap-2">
                        <FiMessageCircle className="text-primary text-xl" />
                        Your Message
                      </span>
                    </label>
                    <textarea
                      required
                      className="textarea textarea-bordered textarea-primary w-full focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Please describe your inquiry in detail..."
                      rows="6"
                    />
                  </div>

                  <div className="form-control mt-8">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-full transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group"
                      disabled={isSubmitting}
                      aria-disabled={isSubmitting}
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-3">
                          <span className="loading loading-spinner loading-md"></span>
                          <span className="font-semibold">Sending Message...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <FiSend className="text-xl group-hover:animate-pulse" />
                          <span className="font-semibold">Send Message</span>
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}