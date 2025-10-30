"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import {
  FaEdit,
  FaSave,
  FaPlus,
  FaTrash,
  FaEye,
  FaImage,
  FaUsers,
  FaTrophy,
  FaClock,
  FaGlobe,
  FaRocket,
  FaLink,
  FaShieldAlt,
  FaHeart,
  FaStar,
  FaAward,
  FaLightbulb,
  FaChartLine,
  FaHandshake,
  FaMobileAlt,
  FaCloudUploadAlt,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaPalette,
  FaMagic,
  FaHistory,
  FaBullseye,
} from "react-icons/fa";

export default function AdminAboutUs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aboutUsData, setAboutUsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [imagePreview, setImagePreview] = useState({});
  const [copiedUrl, setCopiedUrl] = useState("");

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

  useEffect(() => {
    fetchAboutUsData();
  }, []);

  const fetchAboutUsData = async () => {
    try {
      const response = await fetch("/api/admin/about-us");
      if (!response.ok) throw new Error("Failed to fetch about us data");
      const data = await response.json();
      setAboutUsData(data);
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        aboutUsData._id
          ? `/api/admin/about-us/${aboutUsData._id}`
          : "/api/admin/about-us",
        {
          method: aboutUsData._id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aboutUsData),
        }
      );

      if (!response.ok) throw new Error("Failed to save about us data");
      const savedData = await response.json();
      setAboutUsData(savedData);
      toast.success("🎉 About Us content saved successfully!");
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, data) => {
    setAboutUsData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const addArrayItem = (section, field, newItem) => {
    setAboutUsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], newItem],
      },
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setAboutUsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }));
  };

  const updateArrayItem = (section, field, index, data) => {
    setAboutUsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) =>
          i === index ? data : item
        ),
      },
    }));
  };

  const handleImageUrlChange = (section, field, url, index = null) => {
    if (index !== null) {
      updateArrayItem(section, field, index, {
        ...aboutUsData[section][field][index],
        image: url,
      });
    } else {
      updateSection(section, { ...aboutUsData[section], [field]: url });
    }

    setImagePreview((prev) => ({
      ...prev,
      [`${section}_${field}_${index}`]: url,
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(""), 2000);
    toast.info("📋 URL copied to clipboard!");
  };

  const iconOptions = [
    {
      value: "Users",
      label: "Users",
      icon: FaUsers,
      color: "text-emerald-500",
    },
    { value: "Globe", label: "Globe", icon: FaGlobe, color: "text-green-500" },
    {
      value: "ShieldCheck",
      label: "Shield",
      icon: FaShieldAlt,
      color: "text-green-500",
    },
    { value: "Clock", label: "Clock", icon: FaClock, color: "text-orange-500" },
    { value: "Heart", label: "Heart", icon: FaHeart, color: "text-red-500" },
    { value: "Star", label: "Star", icon: FaStar, color: "text-yellow-500" },
    { value: "Award", label: "Award", icon: FaAward, color: "text-amber-500" },
    {
      value: "Lightbulb",
      label: "Lightbulb",
      icon: FaLightbulb,
      color: "text-cyan-500",
    },
    {
      value: "ChartLine",
      label: "Chart",
      icon: FaChartLine,
      color: "text-emerald-500",
    },
    {
      value: "Handshake",
      label: "Handshake",
      icon: FaHandshake,
      color: "text-emerald-500",
    },
    {
      value: "Rocket",
      label: "Rocket",
      icon: FaRocket,
      color: "text-emerald-500",
    },
    {
      value: "MobileAlt",
      label: "Mobile",
      icon: FaMobileAlt,
      color: "text-teal-500",
    },
  ];

  const getIconComponent = (iconName) => {
    const icon = iconOptions.find((opt) => opt.value === iconName);
    return icon ? icon.icon : FaUsers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary mx-auto mb-6"></div>
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Loading Editor...
          </div>
          <p className="text-gray-600 mt-2">Preparing your About Us content</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "hero",
      label: "Hero",
      icon: FaRocket,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "mission",
      label: "Mission",
      icon: FaTrophy,
      color: "from-emerald-500 to-cyan-500",
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: FaClock,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "team",
      label: "Team",
      icon: FaUsers,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "values",
      label: "Values",
      icon: FaHeart,
      color: "from-emerald-500 to-green-500",
    },
    {
      id: "cta",
      label: "Call to Action",
      icon: FaHandshake,
      color: "from-teal-500 to-emerald-500",
    },
    {
      id: "seo",
      label: "SEO",
      icon: FaGlobe,
      color: "from-gray-500 to-slate-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-primary to-emerald-600 rounded-2xl shadow-xl animate-pulse">
                <FaEdit className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                  About Us Editor
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaMagic className="text-primary animate-pulse" />
                  Design and customize your About Us page
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 px-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white hover:scale-105 transform hover:-translate-y-1"
              >
                <FaSave className="text-lg" />
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => router.push("/about-us")}
                className="btn btn-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 border-0 text-white hover:scale-105 transform hover:-translate-y-1"
              >
                <FaEye />
                Preview Page
                <FaExternalLinkAlt className="text-sm" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-primary">
                {aboutUsData.team.members.length}
              </div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-emerald-600">
                {aboutUsData.timeline.items.length}
              </div>
              <div className="text-sm text-gray-600">Timeline Items</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-green-600">
                {aboutUsData.values.items.length}
              </div>
              <div className="text-sm text-gray-600">Core Values</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-green-600">
                {aboutUsData.mission.stats.length}
              </div>
              <div className="text-sm text-gray-600">Statistics</div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          <div className="flex overflow-x-auto bg-gradient-to-r from-gray-50/80 to-slate-100/80 p-3">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-800 hover:shadow-md"
                  }`}
                >
                  <IconComponent className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 lg:p-8">
            {/* Hero Section */}
            {activeTab === "hero" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <FaRocket className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Hero Section
                    </h2>
                    <p className="text-gray-600">
                      First impression matters. Make it count!
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                        <FaPalette className="text-green-500" />
                        Main Title
                      </label>
                      <input
                        type="text"
                        value={aboutUsData.hero.title}
                        onChange={(e) =>
                          updateSection("hero", {
                            ...aboutUsData.hero,
                            title: e.target.value,
                          })
                        }
                        className="input input-bordered input-lg w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary transition-all duration-300"
                        placeholder="Enter your compelling headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                        <FaPalette className="text-emerald-500" />
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={aboutUsData.hero.subtitle}
                        onChange={(e) =>
                          updateSection("hero", {
                            ...aboutUsData.hero,
                            subtitle: e.target.value,
                          })
                        }
                        className="input input-bordered input-lg w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary transition-all duration-300"
                        placeholder="Supporting message that captures attention"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-dashed border-green-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaLightbulb className="text-green-500" />
                      Hero Section Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        ✨ Keep title short and impactful
                      </li>
                      <li className="flex items-center gap-2">
                        🚀 Use action-oriented language
                      </li>
                      <li className="flex items-center gap-2">
                        💫 Highlight your unique value proposition
                      </li>
                      <li className="flex items-center gap-2">
                        🎯 Make it memorable and shareable
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Mission Section */}
            {activeTab === "mission" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl">
                    <FaTrophy className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Mission & Vision
                    </h2>
                    <p className="text-gray-600">
                      Share your purpose and achievements
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={aboutUsData.mission.badge}
                          onChange={(e) =>
                            updateSection("mission", {
                              ...aboutUsData.mission,
                              badge: e.target.value,
                            })
                          }
                          className="input input-bordered w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                          placeholder="OUR MISSION"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={aboutUsData.mission.title}
                          onChange={(e) =>
                            updateSection("mission", {
                              ...aboutUsData.mission,
                              title: e.target.value,
                            })
                          }
                          className="input input-bordered w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                          placeholder="What drives us forward"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Description
                      </label>
                      <textarea
                        value={aboutUsData.mission.description}
                        onChange={(e) =>
                          updateSection("mission", {
                            ...aboutUsData.mission,
                            description: e.target.value,
                          })
                        }
                        className="textarea textarea-bordered w-full h-32 bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                        placeholder="Tell your story and mission..."
                      />
                    </div>

                    {/* Image with Preview */}
                    <div>
                      <label className="block text-sm font-bold mb-3 flex items-center gap-2">
                        <FaImage className="text-green-500" />
                        Mission Image
                      </label>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={aboutUsData.mission.image}
                          onChange={(e) =>
                            handleImageUrlChange(
                              "mission",
                              "image",
                              e.target.value
                            )
                          }
                          className="input input-bordered w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                          placeholder="https://example.com/mission-image.jpg"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              copyToClipboard(aboutUsData.mission.image)
                            }
                            className="btn btn-sm btn-outline flex items-center gap-2 hover:scale-105 transition-transform"
                          >
                            {copiedUrl === aboutUsData.mission.image ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaCopy />
                            )}
                            Copy URL
                          </button>
                          <button className="btn btn-sm btn-outline flex items-center gap-2 hover:scale-105 transition-transform">
                            <FaCloudUploadAlt />
                            Upload
                          </button>
                        </div>
                        {aboutUsData.mission.image && (
                          <div className="mt-4">
                            <label className="block text-sm font-semibold mb-2">
                              Image Preview
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-white/50 backdrop-blur-sm">
                              <img
                                src={aboutUsData.mission.image}
                                alt="Mission preview"
                                className="w-full h-48 object-cover rounded-xl shadow-lg"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              {!aboutUsData.mission.image.startsWith(
                                "http"
                              ) && (
                                <div className="text-center text-gray-500 py-8">
                                  <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
                                  <p>Enter a valid image URL to see preview</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold">
                        Key Statistics
                      </label>
                      <button
                        onClick={() =>
                          addArrayItem("mission", "stats", {
                            value: "",
                            label: "",
                            icon: "Users",
                          })
                        }
                        className="btn btn-sm btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <FaPlus />
                        Add Stat
                      </button>
                    </div>

                    <div className="space-y-4">
                      {aboutUsData.mission.stats.map((stat, index) => {
                        const IconComponent = getIconComponent(stat.icon);
                        const iconOption = iconOptions.find(
                          (opt) => opt.value === stat.icon
                        );
                        return (
                          <div
                            key={index}
                            className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                          >
                            <div className="flex gap-3 items-start">
                              <div className="flex-shrink-0">
                                <select
                                  value={stat.icon}
                                  onChange={(e) =>
                                    updateArrayItem("mission", "stats", index, {
                                      ...stat,
                                      icon: e.target.value,
                                    })
                                  }
                                  className="select select-bordered select-sm bg-white"
                                >
                                  {iconOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={stat.value}
                                  onChange={(e) =>
                                    updateArrayItem("mission", "stats", index, {
                                      ...stat,
                                      value: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm bg-white"
                                  placeholder="1.5M+"
                                />
                                <input
                                  type="text"
                                  value={stat.label}
                                  onChange={(e) =>
                                    updateArrayItem("mission", "stats", index, {
                                      ...stat,
                                      label: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm bg-white"
                                  placeholder="Active Users"
                                />
                              </div>
                              <button
                                onClick={() =>
                                  removeArrayItem("mission", "stats", index)
                                }
                                className="btn btn-error btn-sm hover:scale-110 transition-transform"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <div className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border border-gray-100">
                              <IconComponent
                                className={`text-lg ${
                                  iconOption?.color || "text-emerald-500"
                                }`}
                              />
                              <span className="text-sm font-semibold text-gray-800">
                                {stat.value}
                              </span>
                              <span className="text-sm text-gray-600">
                                {stat.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Section */}
            {activeTab === "timeline" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <FaHistory className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Timeline Section
                    </h2>
                    <p className="text-gray-600">
                      Showcase your journey and milestones
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={aboutUsData.timeline.title}
                      onChange={(e) =>
                        updateSection("timeline", {
                          ...aboutUsData.timeline,
                          title: e.target.value,
                        })
                      }
                      className="input input-bordered input-lg w-full max-w-md bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                      placeholder="Our Journey"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold">
                        Timeline Items
                      </label>
                      <button
                        onClick={() =>
                          addArrayItem("timeline", "items", {
                            year: "",
                            title: "",
                            content: "",
                          })
                        }
                        className="btn btn-sm btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <FaPlus /> Add Timeline Item
                      </button>
                    </div>

                    <div className="space-y-6">
                      {aboutUsData.timeline.items.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-2 text-gray-600">
                                Year
                              </label>
                              <input
                                type="text"
                                value={item.year}
                                onChange={(e) =>
                                  updateArrayItem("timeline", "items", index, {
                                    ...item,
                                    year: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full bg-white"
                                placeholder="2023"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-2 text-gray-600">
                                Event Title
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) =>
                                  updateArrayItem("timeline", "items", index, {
                                    ...item,
                                    title: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full bg-white"
                                placeholder="Major Milestone"
                              />
                            </div>
                            <button
                              onClick={() =>
                                removeArrayItem("timeline", "items", index)
                              }
                              className="btn btn-error btn-sm hover:scale-110 transition-transform"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-2 text-gray-600">
                              Description
                            </label>
                            <textarea
                              value={item.content}
                              onChange={(e) =>
                                updateArrayItem("timeline", "items", index, {
                                  ...item,
                                  content: e.target.value,
                                })
                              }
                              className="textarea textarea-bordered w-full bg-white"
                              placeholder="Describe this important event..."
                              rows="3"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Section */}
            {activeTab === "team" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                    <FaUsers className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Team Members
                    </h2>
                    <p className="text-gray-600">Introduce your amazing team</p>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={aboutUsData.team.title}
                        onChange={(e) =>
                          updateSection("team", {
                            ...aboutUsData.team,
                            title: e.target.value,
                          })
                        }
                        className="input input-bordered w-full max-w-md bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                        placeholder="Meet Our Team"
                      />
                    </div>
                    <button
                      onClick={() =>
                        addArrayItem("team", "members", {
                          name: "",
                          position: "",
                          description: "",
                          image: "",
                          facebook: "",
                          linkedin: "",
                          instagram: "",
                        })
                      }
                      className="btn btn-primary btn-lg flex items-center gap-3 hover:scale-105 transition-transform"
                    >
                      <FaPlus />
                      Add Team Member
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {aboutUsData.team.members.map((member, index) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                      >
                        {/* Image Preview */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {member.image ? (
                            <>
                              <img
                                src={member.image}
                                alt={member.name || "Team member"}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center ${
                              member.image ? "hidden" : "flex"
                            }`}
                          >
                            <FaUsers className="text-6xl text-gray-400 opacity-50" />
                          </div>
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() =>
                                removeArrayItem("team", "members", index)
                              }
                              className="btn btn-error btn-sm btn-circle hover:scale-110 transition-transform"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) =>
                                updateArrayItem("team", "members", index, {
                                  ...member,
                                  name: e.target.value,
                                })
                              }
                              className="input input-bordered input-sm w-full font-bold text-lg bg-white/50 backdrop-blur-sm"
                              placeholder="Full Name"
                            />
                            <input
                              type="text"
                              value={member.position}
                              onChange={(e) =>
                                updateArrayItem("team", "members", index, {
                                  ...member,
                                  position: e.target.value,
                                })
                              }
                              className="input input-bordered input-sm w-full bg-white/50 backdrop-blur-sm"
                              placeholder="Position/Role"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-600">
                              Image URL
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={member.image}
                                onChange={(e) =>
                                  updateArrayItem("team", "members", index, {
                                    ...member,
                                    image: e.target.value,
                                  })
                                }
                                className="input input-bordered input-sm flex-1 bg-white/50 backdrop-blur-sm"
                                placeholder="Profile image URL"
                              />
                              <button
                                onClick={() => copyToClipboard(member.image)}
                                className="btn btn-sm btn-outline hover:scale-105 transition-transform"
                                title="Copy URL"
                              >
                                {copiedUrl === member.image ? (
                                  <FaCheck className="text-green-500" />
                                ) : (
                                  <FaCopy />
                                )}
                              </button>
                            </div>
                          </div>

                          <textarea
                            value={member.description}
                            onChange={(e) =>
                              updateArrayItem("team", "members", index, {
                                ...member,
                                description: e.target.value,
                              })
                            }
                            className="textarea textarea-bordered textarea-sm w-full h-20 bg-white/50 backdrop-blur-sm"
                            placeholder="Brief description about this team member..."
                          />

                          {/* Social Links */}
                          <div className="pt-4 border-t border-gray-200">
                            <label className="block text-xs font-semibold mb-3 text-gray-600 flex items-center gap-2">
                              <FaLink className="text-emerald-500" />
                              Social Media Links
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    f
                                  </span>
                                </div>
                                <input
                                  type="url"
                                  value={member.facebook || ""}
                                  onChange={(e) =>
                                    updateArrayItem("team", "members", index, {
                                      ...member,
                                      facebook: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm flex-1 bg-white/50 backdrop-blur-sm"
                                  placeholder="Facebook URL"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    in
                                  </span>
                                </div>
                                <input
                                  type="url"
                                  value={member.linkedin || ""}
                                  onChange={(e) =>
                                    updateArrayItem("team", "members", index, {
                                      ...member,
                                      linkedin: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm flex-1 bg-white/50 backdrop-blur-sm"
                                  placeholder="LinkedIn URL"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    ig
                                  </span>
                                </div>
                                <input
                                  type="url"
                                  value={member.instagram || ""}
                                  onChange={(e) =>
                                    updateArrayItem("team", "members", index, {
                                      ...member,
                                      instagram: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm flex-1 bg-white/50 backdrop-blur-sm"
                                  placeholder="Instagram URL"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Values Section */}
            {activeTab === "values" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl">
                    <FaHeart className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Core Values
                    </h2>
                    <p className="text-gray-600">
                      Define what makes your company unique
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={aboutUsData.values.title}
                      onChange={(e) =>
                        updateSection("values", {
                          ...aboutUsData.values,
                          title: e.target.value,
                        })
                      }
                      className="input input-bordered input-lg w-full max-w-md bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                      placeholder="Our Values"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold">
                        Value Items
                      </label>
                      <button
                        onClick={() =>
                          addArrayItem("values", "items", {
                            icon: "Heart",
                            title: "",
                            description: "",
                            color: "primary",
                          })
                        }
                        className="btn btn-sm btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <FaPlus /> Add Value
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {aboutUsData.values.items.map((value, index) => {
                        const IconComponent = getIconComponent(value.icon);
                        const iconOption = iconOptions.find(
                          (opt) => opt.value === value.icon
                        );
                        return (
                          <div
                            key={index}
                            className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 ${
                                      iconOption?.color || "text-emerald-500"
                                    }`}
                                  >
                                    <IconComponent className="text-lg" />
                                  </div>
                                  <select
                                    value={value.icon}
                                    onChange={(e) =>
                                      updateArrayItem(
                                        "values",
                                        "items",
                                        index,
                                        { ...value, icon: e.target.value }
                                      )
                                    }
                                    className="select select-bordered select-sm bg-white"
                                  >
                                    {iconOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() =>
                                    removeArrayItem("values", "items", index)
                                  }
                                  className="btn btn-error btn-sm hover:scale-110 transition-transform"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={value.title}
                                  onChange={(e) =>
                                    updateArrayItem("values", "items", index, {
                                      ...value,
                                      title: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-lg w-full bg-white"
                                  placeholder="Value title"
                                />
                              </div>
                              <div>
                                <select
                                  value={value.color}
                                  onChange={(e) =>
                                    updateArrayItem("values", "items", index, {
                                      ...value,
                                      color: e.target.value,
                                    })
                                  }
                                  className="select select-bordered w-full bg-white"
                                >
                                  <option value="primary">Primary</option>
                                  <option value="secondary">Secondary</option>
                                  <option value="accent">Accent</option>
                                </select>
                              </div>
                              <textarea
                                value={value.description}
                                onChange={(e) =>
                                  updateArrayItem("values", "items", index, {
                                    ...value,
                                    description: e.target.value,
                                  })
                                }
                                className="textarea textarea-bordered w-full bg-white"
                                placeholder="Value description"
                                rows="3"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Section */}
            {activeTab === "cta" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl">
                    <FaBullseye className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      Call to Action
                    </h2>
                    <p className="text-gray-600">
                      Encourage visitors to take the next step
                    </p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        CTA Title
                      </label>
                      <input
                        type="text"
                        value={aboutUsData.cta.title}
                        onChange={(e) =>
                          updateSection("cta", {
                            ...aboutUsData.cta,
                            title: e.target.value,
                          })
                        }
                        className="input input-bordered input-lg w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                        placeholder="Join Our Journey"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        CTA Subtitle
                      </label>
                      <input
                        type="text"
                        value={aboutUsData.cta.subtitle}
                        onChange={(e) =>
                          updateSection("cta", {
                            ...aboutUsData.cta,
                            subtitle: e.target.value,
                          })
                        }
                        className="input input-bordered input-lg w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                        placeholder="Start your experience today"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold">
                        CTA Buttons
                      </label>
                      <button
                        onClick={() =>
                          addArrayItem("cta", "buttons", {
                            text: "",
                            href: "",
                            variant: "primary",
                          })
                        }
                        className="btn btn-sm btn-primary flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <FaPlus /> Add Button
                      </button>
                    </div>

                    <div className="space-y-4">
                      {aboutUsData.cta.buttons.map((button, index) => (
                        <div
                          key={index}
                          className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border-2 border-gray-200 hover:border-primary/50 transition-all duration-300"
                        >
                          <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-2 text-gray-600">
                                Button Text
                              </label>
                              <input
                                type="text"
                                value={button.text}
                                onChange={(e) =>
                                  updateArrayItem("cta", "buttons", index, {
                                    ...button,
                                    text: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full bg-white"
                                placeholder="Get Started"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-2 text-gray-600">
                                Button URL
                              </label>
                              <input
                                type="text"
                                value={button.href}
                                onChange={(e) =>
                                  updateArrayItem("cta", "buttons", index, {
                                    ...button,
                                    href: e.target.value,
                                  })
                                }
                                className="input input-bordered w-full bg-white"
                                placeholder="/contact"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold mb-2 text-gray-600">
                                Button Style
                              </label>
                              <select
                                value={button.variant}
                                onChange={(e) =>
                                  updateArrayItem("cta", "buttons", index, {
                                    ...button,
                                    variant: e.target.value,
                                  })
                                }
                                className="select select-bordered w-full bg-white"
                              >
                                <option value="primary">Primary</option>
                                <option value="outline">Outline</option>
                                <option value="secondary">Secondary</option>
                              </select>
                            </div>
                            <button
                              onClick={() =>
                                removeArrayItem("cta", "buttons", index)
                              }
                              className="btn btn-error btn-sm hover:scale-110 transition-transform"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Section */}
            {activeTab === "seo" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-r from-gray-500 to-slate-600 rounded-2xl">
                    <FaGlobe className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-800">
                      SEO Settings
                    </h2>
                    <p className="text-gray-600">
                      Optimize your page for search engines
                    </p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={aboutUsData.seo.title}
                      onChange={(e) =>
                        updateSection("seo", {
                          ...aboutUsData.seo,
                          title: e.target.value,
                        })
                      }
                      className="input input-bordered input-lg w-full bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                      placeholder="About Us - Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={aboutUsData.seo.description}
                      onChange={(e) =>
                        updateSection("seo", {
                          ...aboutUsData.seo,
                          description: e.target.value,
                        })
                      }
                      className="textarea textarea-bordered textarea-lg w-full h-32 bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-primary"
                      placeholder="Brief description of your about us page for search engines..."
                      rows="4"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: 150-160 characters
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-800">
                Ready to publish changes?
              </h3>
              <p className="text-gray-600 text-sm">
                Don't forget to save your updates
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-lg flex items-center gap-3 px-8 hover:scale-105 transition-transform"
              >
                <FaSave />
                {saving ? "Saving..." : "Save All Changes"}
              </button>
              <button
                onClick={() => router.push("/about-us")}
                className="btn btn-outline btn-lg flex items-center gap-3 px-8 hover:scale-105 transition-transform"
              >
                <FaEye />
                Live Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
