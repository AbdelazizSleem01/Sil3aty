"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
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
  FaEdit,
} from "react-icons/fa";

export default function EditEmployee() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const router = useRouter();
  const { id } = useParams();

  const localT = {
    ar: {
      editTeamMember: "تعديل عضو الفريق",
      updateInfo: "تحديث معلومات عضو الفريق",
      fullName: "الاسم الكامل",
      rolePosition: "الدور / الوظيفة",
      bioComment: "نبذة / تعليق",
      facebookUrl: "رابط فيسبوك",
      linkedinUrl: "رابط لينكدان",
      profileImage: "صورة الملف الشخصي",
      currentImage: "الصورة الحالية",
      currentImageInfo: "سيتم الاحتفاظ بهذه الصورة إذا لم يتم تحديد صورة جديدة",
      changeImage: "تغيير الصورة",
      supportedFormat: "PNG أو JPG أو WEBP حتى 5 ميجابايت",
      imagePreview: "معاينة الصورة الجديدة",
      selectedImage: "الصورة المحددة",
      cancel: "إلغاء",
      updateTeamMember: "تحديث عضو الفريق",
      updating: "جاري التحديث...",
      placeholderName: "أدخل الاسم الكامل",
      placeholderRole: "مثال: مهندس برمجيات، مدير تسويق",
      placeholderBio: "اكتب وصفاً موجزاً عن عضو الفريق...",
      placeholderFb: "https://facebook.com/username",
      placeholderLi: "https://linkedin.com/in/username",
      invalidImageFile: "يرجى اختيار ملف صورة صالح",
      imageSizeTooLarge: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
      newImageSelected: "تم اختيار صورة جديدة",
      fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
      memberUpdatedSuccess: "🎉 تم تحديث عضو الفريق بنجاح!",
      failedUpdateMember: "فشل تحديث عضو الفريق",
      fetchFailed: "فشل تحميل تفاصيل عضو الفريق",
      loadingMember: "جاري تحميل عضو الفريق...",
      pleaseWait: "يرجى الانتظار...",
      unsavedChanges: "لديك تغييرات غير محفوظة",
      cancelConfirm: "هل أنت متأكد أنك تريد الإلغاء؟ سيتم فقدان جميع التغييرات غير المحفوظة."
    },
    en: {
      editTeamMember: "Edit Team Member",
      updateInfo: "Update team member information",
      fullName: "Full Name",
      rolePosition: "Role/Position",
      bioComment: "Bio/Comment",
      facebookUrl: "Facebook URL",
      linkedinUrl: "LinkedIn URL",
      profileImage: "Profile Image",
      currentImage: "Current Image",
      currentImageInfo: "This image will be kept if no new image is selected",
      changeImage: "Change Image",
      supportedFormat: "PNG, JPG, WEBP up to 5MB",
      imagePreview: "New Image Preview",
      selectedImage: "New Image Selected",
      cancel: "Cancel",
      updateTeamMember: "Update Team Member",
      updating: "Updating...",
      placeholderName: "Enter full name",
      placeholderRole: "e.g., Software Engineer, Marketing Manager",
      placeholderBio: "Write a brief description about this team member...",
      placeholderFb: "https://facebook.com/username",
      placeholderLi: "https://linkedin.com/in/username",
      invalidImageFile: "Please select a valid image file",
      imageSizeTooLarge: "Image size should be less than 5MB",
      newImageSelected: "New image selected",
      fillRequiredFields: "Please fill in all required fields",
      memberUpdatedSuccess: "🎉 Team member updated successfully!",
      failedUpdateMember: "Failed to update team member",
      fetchFailed: "Failed to fetch team member",
      loadingMember: "Loading Team Member...",
      pleaseWait: "Please wait while we fetch team member details",
      unsavedChanges: "You have unsaved changes",
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
    existingImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        const response = await fetch(`/api/admin/team/${id}`);
        if (!response.ok) throw new Error(currentT.fetchFailed);
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
  }, [id, router, isRTL]);

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
      toast.info(currentT.newImageSelected);
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
        throw new Error(errorData.message || currentT.failedUpdateMember);
      }

      toast.success(currentT.memberUpdatedSuccess);

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
        confirm(currentT.cancelConfirm)
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
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700 justify-center">
            <FaUsers className="text-primary" />
            <span>{currentT.loadingMember}</span>
          </div>
          <p className="text-gray-500 mt-2">
            {currentT.pleaseWait}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
          >
            <FaArrowLeft className={`text-lg ${isRTL ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning rounded-2xl shadow-lg">
              <FaEdit className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {currentT.editTeamMember}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentT.updateInfo}
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
                    {currentT.fullName}
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
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
                  <FaBriefcase className="text-primary text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    {currentT.rolePosition}
                  </span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
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
                <FaComment className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">
                  {currentT.bioComment}
                </span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                className="textarea textarea-bordered textarea-primary w-full text-lg py-3 min-h-32"
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
                  <FaFacebook className="text-emerald-600 text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    {currentT.facebookUrl}
                  </span>
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
                  placeholder={currentT.placeholderFb}
                />
              </div>

              <div className="form-control">
                <label className="label flex items-center gap-2 mb-3">
                  <FaLinkedin className="text-emerald-700 text-lg" />
                  <span className="label-text text-lg font-semibold text-gray-700">
                    {currentT.linkedinUrl}
                  </span>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input input-bordered input-primary w-full text-lg py-3"
                  placeholder={currentT.placeholderLi}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label flex items-center gap-2 mb-3">
                <FaImage className="text-primary text-lg" />
                <span className="label-text text-lg font-semibold text-gray-700">
                  {currentT.profileImage}
                </span>
              </label>

              {/* Current Image */}
              {formData.existingImage && (
                <div className="mb-4 p-4 border-2 border-dashed border-info rounded-lg bg-info/10">
                  <p className="font-semibold text-info mb-3 flex items-center gap-2">
                    <FaEye />
                    {currentT.currentImage}
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
                        {currentT.currentImage}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentT.currentImageInfo}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                <label className="btn btn-primary btn-outline cursor-pointer flex items-center gap-2 font-bold">
                  <FaUpload />
                  {currentT.changeImage}
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>

                <span className="text-sm text-gray-500">
                  {currentT.supportedFormat}
                </span>
              </div>

              {/* New Image Preview */}
              {imagePreview && (
                <div className="mt-4 p-4 border-2 border-dashed border-success rounded-lg bg-success/10">
                  <p className="font-semibold text-success mb-3 flex items-center gap-2">
                    <FaEye />
                    {currentT.imagePreview}
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-ghost flex-1 text-lg py-3 font-bold"
                disabled={isSubmitting}
              >
                <FaTimes className={`${isRTL ? "ml-2" : "mr-2"}`} />
                {currentT.cancel}
              </button>

              <button
                type="submit"
                className="btn btn-warning flex-1 text-lg py-3 flex items-center justify-center gap-2 font-bold text-white"
                disabled={isSubmitting || !hasChanges}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {currentT.updating}
                  </>
                ) : (
                  <>
                    <FaSave />
                    {currentT.updateTeamMember}
                  </>
                )}
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-warning text-sm font-semibold flex items-center gap-2">
                  <FaEdit />
                  {currentT.unsavedChanges}
                </p>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
