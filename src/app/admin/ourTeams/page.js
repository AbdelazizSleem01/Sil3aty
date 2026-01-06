"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFacebook,
  FaLinkedin,
  FaSpinner,
  FaSearch,
  FaExclamationCircle,
  FaUserPlus,
  FaSync,
  FaEye,
} from "react-icons/fa";

export default function OurTeams() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/admin/team");
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();
        setTeamMembers(data);
      } catch (err) {
        toast.error(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleDelete = async (id, memberName) => {
    const result = await Swal.fire({
      title: "Delete Team Member?",
      html: `
        <div class="text-center">
          <div class="text-6xl text-red-500 mb-4">🗑️</div>
          <p class="text-lg font-semibold mb-2">You are about to delete:</p>
          <p class="text-xl text-primary font-bold">${memberName}</p>
          <p class="text-gray-600 mt-2">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete It!",
      cancelButtonText: "Cancel",

      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-6 py-3 rounded-lg font-semibold",
        cancelButton: "px-6 py-3 rounded-lg font-semibold",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/team/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete team member");

        await Swal.fire({
          title: "Deleted!",
          text: `${memberName} has been deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#10b981",

          customClass: {
            popup: "rounded-2xl",
          },
        });

        setTeamMembers((prev) => prev.filter((member) => member._id !== id));
        toast.success("Team member deleted successfully!");
      } catch (err) {
        toast.error(`❌ ${err.message}`);
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/team");
      if (!response.ok) throw new Error("Failed to fetch team members");
      const data = await response.json();
      setTeamMembers(data);
      toast.info("Team list refreshed!");
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-8xl text-primary animate-spin mx-auto mb-6" />
          <div className="flex items-center gap-3 text-2xl font-semibold text-gray-700">
            <FaUsers className="text-primary" />
            <span>Loading Team Members...</span>
          </div>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch your team
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg">
                <FaUsers className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Team Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <FaEye className="text-primary" />
                  Manage your team members and their profiles
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRefresh}
                className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 rounded-xl"
              >
                <FaSync className="text-lg" />
                Refresh
              </button>
              <Link
                href="/admin/create-employee"
                className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 px-6 rounded-xl"
              >
                <FaUserPlus className="text-lg" />
                Add Member
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaUsers className="text-3xl text-primary" />
                <span className="text-3xl font-bold text-gray-800">
                  {teamMembers.length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">Total Members</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaLinkedin className="text-3xl text-emerald-600" />
                <span className="text-3xl font-bold text-gray-800">
                  {teamMembers.filter((m) => m.linkedin).length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">With LinkedIn</p>
            </div>

            <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <FaFacebook className="text-3xl text-emerald-500" />
                <span className="text-3xl font-bold text-gray-800">
                  {teamMembers.filter((m) => m.facebook).length}
                </span>
              </div>
              <p className="text-gray-600 font-semibold">With Facebook</p>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search team members by name, role, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered input-lg w-full pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaUsers className="text-primary" />
                <span>
                  {filteredMembers.length}{" "}
                  {filteredMembers.length === 1 ? "member" : "members"} found
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <FaExclamationCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "No team members found" : "No team members yet"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Get started by adding your first team member to showcase your team."}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/create-employee"
                  className="btn btn-success btn-lg flex items-center gap-2 mx-auto"
                >
                  <FaUserPlus />
                  Add Your First Team Member
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-base-300"
                >
                  <figure className="px-6 pt-6">
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-avatar.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-base-100/50 to-transparent"></div>
                    </div>
                  </figure>

                  <div className="card-body p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="card-title text-xl font-bold text-gray-800">
                        {member.name}
                      </h2>
                      <div className="badge badge-primary badge-lg font-semibold">
                        {member.role}
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {member.comment}
                    </p>

                    {/* Social Links */}
                    <div className="flex justify-center gap-3 mb-4">
                      {member.facebook && (
                        <a
                          href={member.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-sm bg-emerald-500 hover:bg-emerald-600 text-white border-0 transition-all duration-200 hover:scale-110"
                        >
                          <FaFacebook className="w-4 h-4" />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all duration-200 hover:scale-110"
                        >
                          <FaLinkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/create-employee/${member._id}`)
                        }
                        className="btn btn-warning btn-sm flex-1 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        <FaEdit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id, member.name)}
                        className="btn btn-error btn-sm flex-1 flex items-center gap-2 transition-all duration-200 hover:scale-105"
                      >
                        <FaTrash className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredMembers.length > 0 && (
          <div className="mt-6 bg-base-100 rounded-2xl p-6 shadow-lg border border-base-300">
            <div className="flex flex-wrap gap-6 justify-center text-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FaUsers className="text-primary text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {teamMembers.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Team Members</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <FaUserPlus className="text-success text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredMembers.length}
                  </p>
                  <p className="text-sm text-gray-600">Displayed Members</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
