"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { data: session, status } = useSession();
  const router = useRouter();

  const localT = {
    ar: {
      addTeamMember: "إضافة عضو فريق",
      createProfile: "إنشاء ملف تعريفي جديد لعضو الفريق",
      fullName: "الاسم الكامل",
      rolePosition: "الدور / الوظيفة",
      bioComment: "نبذة / تعليق",
      facebookUrl: "رابط فيسبوك",
      linkedinUrl: "رابط لينكدان",
      profileImage: "صورة الملف الشخصي",
      chooseImage: "اختر صورة",
      supportedFormat: "PNG أو JPG أو WEBP حتى 5 ميجابايت",
      imagePreview: "معاينة الصورة",
      selectedImage: "الصورة المحددة",
      cancel: "إلغاء",
      createTeamMember: "إنشاء عضو الفريق",
      creating: "جاري الإنشاء...",
      placeholderName: "أدخل الاسم الكامل",
      placeholderRole: "مثال: مهندس برمجيات، مدير تسويق",
      placeholderBio: "اكتب وصفاً موجزاً عن عضو الفريق...",
      placeholderFb: "https://facebook.com/username",
      placeholderLi: "https://linkedin.com/in/username",
      invalidImageFile: "يرجى اختيار ملف صورة صالح",
      imageSizeTooLarge: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
      imageSelected: "تم اختيار صورة الملف الشخصي",
      fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
      selectProfileImage: "يرجى اختيار صورة الملف الشخصي",
      memberCreatedSuccess: "🎉 تم إنشاء عضو الفريق بنجاح!",
      failedCreateMember: "فشل إنشاء عضو الفريق",
      cancelConfirm: "هل أنت متأكد أنك تريد الإلغاء؟ سيتم فقدان جميع التغييرات غير المحفوظة."
    },
    en: {
      addTeamMember: "Add Team Member",
      createProfile: "Create a new team member profile",
      fullName: "Full Name",
      rolePosition: "Role/Position",
      bioComment: "Bio/Comment",
      facebookUrl: "Facebook URL",
      linkedinUrl: "LinkedIn URL",
      profileImage: "Profile Image",
      chooseImage: "Choose Image",
      supportedFormat: "PNG, JPG, WEBP up to 5MB",
      imagePreview: "Image Preview",
      selectedImage: "Selected Image",
      cancel: "Cancel",
      createTeamMember: "Create Team Member",
      creating: "Creating...",
      placeholderName: "Enter full name",
      placeholderRole: "e.g., Software Engineer, Marketing Manager",
      placeholderBio: "Write a brief description about this team member...",
      placeholderFb: "https://facebook.com/username",
      placeholderLi: "https://linkedin.com/in/username",
      invalidImageFile: "Please select a valid image file",
      imageSizeTooLarge: "Image size should be less than 5MB",
      imageSelected: "Profile image selected",
      fillRequiredFields: "Please fill in all required fields",
      selectProfileImage: "Please select a profile image",
      memberCreatedSuccess: "🎉 Team member created successfully!",
      failedCreateMember: "Failed to create team member",
      cancelConfirm: "Are you sure you want to cancel? All unsaved changes will be lost."
    }
  };
  const currentT = isRTL ? localT.ar : localT.en;
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
        toast.error(currentT.invalidImageFile);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(currentT.imageSizeTooLarge);
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      toast.info(currentT.imageSelected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.role.trim() ||
      !formData.comment.trim()
    ) {
      toast.error(currentT.fillRequiredFields);
      return;
    }

    if (!formData.image) {
      toast.error(currentT.selectProfileImage);
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
        throw new Error(errorData.message || currentT.failedCreateMember);
      }

      toast.success(currentT.memberCreatedSuccess);

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
        confirm(currentT.cancelConfirm)
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className={`text-md ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg">
              <FaUsers className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {currentT.addTeamMember}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentT.createProfile}
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
                    {currentT.fullName}
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder={currentT.placeholderName}
                  required
                  maxLength={100}
                />
                <div className={`text-sm text-gray-500 mt-1 ${isRTL ? "text-left" : "text-right"}`}>
                  {formData.name.length}/100
                </div>
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaBriefcase className="text-primary text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    {currentT.rolePosition}
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder={currentT.placeholderRole}
                  required
                  maxLength={100}
                />
                <div className={`text-sm text-gray-500 mt-1 ${isRTL ? "text-left" : "text-right"}`}>
                  {formData.role.length}/100
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaComment className="text-primary text-md" />
                <span className="label-text text-md font-semibold text-gray-700">
                  {currentT.bioComment}
                </span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary w-full text-md py-3 min-h-32"
                placeholder={currentT.placeholderBio}
                required
                maxLength={500}
              />
              <div className={`text-sm text-gray-500 mt-1 ${isRTL ? "text-left" : "text-right"}`}>
                {formData.comment.length}/500
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaFacebook className="text-emerald-600 text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    {currentT.facebookUrl}
                  </span>
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder={currentT.placeholderFb}
                />
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaLinkedin className="text-emerald-700 text-md" />
                  <span className="label-text text-md font-semibold text-gray-700">
                    {currentT.linkedinUrl}
                  </span>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-md py-3"
                  placeholder={currentT.placeholderLi}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-md" />
                <span className="label-text text-md font-semibold text-gray-700">
                  {currentT.profileImage}
                </span>
                <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2 font-bold">
                  <FaUpload />
                  {currentT.chooseImage}
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
                  {currentT.supportedFormat}
                </span>
              </div>

              {imagePreview && (
                <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                  <p className="font-semibold text-success mb-3 flex items-center gap-2">
                    <FaEye />
                    {currentT.imagePreview}
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
                        {currentT.selectedImage}
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
                className="btn flex-1 text-md py-3 font-bold"
                disabled={isSubmitting}
              >
                <FaTimes className={`${isRTL ? "ml-2" : "mr-2"}`} />
                {currentT.cancel}
              </button>

              <button
                type="submit"
                className="btn btn-primary flex-1 text-md py-3 flex items-center justify-center gap-2 font-bold text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {currentT.creating}
                  </>
                ) : (
                  <>
                    <FaSave />
                    {currentT.createTeamMember}
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
